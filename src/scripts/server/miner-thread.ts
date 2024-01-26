import { Block, BlockPermutation } from "cicada-lib/block.js";
import { OrdMap } from "cicada-lib/collections/ordered-map.js";
import { Dimension } from "cicada-lib/dimension.js";
import { EquipmentSlot } from "cicada-lib/entity.js";
import { ItemBag } from "cicada-lib/item/bag.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { Location } from "cicada-lib/location.js";
import { Player, GameMode } from "cicada-lib/player.js";
import { Timer } from "cicada-lib/timer.js";
import { Thread } from "cicada-lib/thread.js";
import { world } from "cicada-lib/world.js";
import { BlockProperties, MiningWay, blockProps } from "./block-properties.js";
import { PlayerPrefs } from "./player-prefs.js";
import { type PlayerSession } from "./player-session.js";
import { isStandingOn } from "./utils.js";
import { worldPrefs } from "./world-prefs.js";

export class MinerThread extends Thread {
    readonly #player: Player;
    readonly #playerPrefs: PlayerPrefs;
    readonly #tool: ItemStack;
    readonly #dimension: Dimension;
    readonly #origLoc: Location;
    readonly #origPerm: BlockPermutation;
    readonly #origProps: BlockProperties;
    readonly #scanned: LocationSet; // negative cache for scanning
    readonly #toScan: LocationSet;
    readonly #toMine: OrdMap<Block, [MiningWay, BlockPermutation]>;
    readonly #loots: ItemBag;
    readonly #soundsPlayed: Set<string>;
    #experience: number;

    public constructor(player: Player, tool: ItemStack, origin: Block, perm: BlockPermutation) {
        super();
        this.#player      = player;
        this.#playerPrefs = player.getSession<PlayerSession>().playerPrefs;
        this.#tool        = tool;
        this.#dimension   = origin.dimension;
        this.#origLoc     = origin.location;
        this.#origPerm    = perm;
        this.#origProps   = blockProps.get(perm);

        const ordBlock  = (ba: Block, bb: Block) => {
            // We sort scheduled blocks by Y, then X, and then Z, and mine
            // blocks from the highest to the lowest. This is because
            // blocks might be gravity-affected and we don't want them to
            // fall.
            return ba.y > bb.y ?  1 :
                   ba.y < bb.y ? -1 :
                   ba.x > bb.x ?  1 :
                   ba.x < bb.x ? -1 :
                   ba.z > bb.z ?  1 :
                   ba.z < bb.z ? -1 :
                   0;
        };
        this.#scanned = new LocationSet();
        this.#toScan  = new LocationSet();
        this.#toMine  = new OrdMap(ordBlock);

        this.#loots        = new ItemBag();
        this.#soundsPlayed = new Set();
        this.#experience   = 0;
    }

    protected async* run() {
        const timer = new Timer();

        // The first path: discover blocks to quick-mine. This is a
        // non-destructive operation. Note that the block located at
        // this.#origLoc might not be the one we observed before spawning
        // this thread, which is fine because this.#scan() will not
        // schedule blocks incompatible with this.#origPerm.
        this.#scan(this.#origLoc);
        while (this.#toScan.size > 0) {
            const loc = this.#toScan.deleteAny()!;
            this.#scan(loc);

            if (timer.elapsedMs >= worldPrefs.timeBudgetInMsPerTick) {
                yield;
                timer.reset();
            }
        }

        // The second path: mine all blocks that we have decided to mine.
        try {
            for (const [block, [way, perm]] of this.#toMine.entries().reverse()) {
                if (this.#playerPrefs.protection.keepGroundFromQuickMined) {
                    if (this.#player.isValid && isStandingOn(this.#player, block))
                        continue;
                }

                if (!this.#tryMining(block, way, perm))
                    break;

                if (timer.elapsedMs >= worldPrefs.timeBudgetInMsPerTick) {
                    this.#flushLoots();
                    this.#soundsPlayed.clear();
                    yield;
                    timer.reset();
                }
            }
        }
        finally {
            this.#flushLoots();
        }
    }

    get #isCreative(): boolean {
        if (this.#player.isValid)
            return this.#player.gameMode == GameMode.creative;
        else
            return false;
    }

    #horizDist(x: number, z: number): number {
        return Math.sqrt(
                   Math.pow(this.#origLoc.x - x, 2) +
                   Math.pow(this.#origLoc.z - z, 2));
    }

    #vertDist(y: number): number {
        return Math.abs(this.#origLoc.y - y);
    }

    // Return `true` iff it actually scheduled the block for mining.
    #scan(loc: Location): boolean {
        const block = this.#dimension.getBlock(loc);

        if (!block) {
            // This block is either in an unloaded chunk or out of the world boundary,
            // so we can't do anything about it.
            this.#scanned.add(loc);
            return false;
        }

        const way = this.#origProps.miningWay(this.#origPerm, block.permutation);
        switch (way) {
            case MiningWay.LeaveAlone:
                this.#scanned.add(loc);
                return false;

            case MiningWay.MineRegularly:
            case MiningWay.MineAsABonus:
                this.#toMine.set(block, [way, block.permutation]);
                this.#scanned.add(loc);
                // This is one of the slowest part of this entire addon. We
                // must optimize this very carefully.
                for (let y = -1; y <= 1; y++) {
                    if (this.#vertDist(loc.y + y) > worldPrefs.maxVerticalDistance)
                        continue;

                    for (let x = -1; x <= 1; x++) {
                        for (let z = -1; z <= 1; z++) {
                            const loc1 = loc.offset(x, y, z);
                            if (!this.#scanned.has(loc1) && !this.#toScan.has(loc1)) {
                                if (this.#horizDist(loc.x + x, loc.z + z) > worldPrefs.maxHorizontalDistance)
                                    this.#scanned.add(loc1);
                                else
                                    this.#toScan.add(loc1);
                            }
                        }
                    }
                }
                return true;
        }
    }

    #playSound(soundId: string, at?: Location): void {
        if (this.#soundsPlayed.has(soundId))
            return;

        if (at)
            world.playSound(soundId, at);
        else
            this.#player.playSound(soundId);

        this.#soundsPlayed.add(soundId);
    }

    /// Return `true` if we should continue mining blocks. `false` otherwise.
    #tryMining(block: Block, way: MiningWay, perm: BlockPermutation): boolean {
        console.assert(
            way === MiningWay.MineRegularly ||
            way === MiningWay.MineAsABonus);

        // Things might have changed since we scanned blocks, as our
        // operation is asynchronous. Check if the block is still the one
        // we expect.
        const props = blockProps.get(perm);
        if (!props.isEquivalentTo(perm, block.permutation))
            return true;

        let toolWithstood = true;
        if (way === MiningWay.MineRegularly) {
            // Play a breaking sound only once per tick.
            this.#playSound(props.breakingSoundId(perm), block.location);

            // Consume the durability unless the player is in creative.
            if (!this.#isCreative) {
                // The item stack this.#tool is only a snapshot of the tool
                // the player used to initiate quick-mining. At this point
                // they might have put it in a chest, handed it to another
                // player, thrown it in lava, or whatever. So we have no
                // choice but to just reduce the durability of the tool the
                // player is currently holding in their main hand. What
                // else can we do?
                if (!this.#player.isValid)
                    return false;

                const tool = this.#player.equipments.get(EquipmentSlot.Mainhand);
                if (tool && tool.durability) {
                    if (this.#playerPrefs.protection.abortBeforeToolBreaks) {
                        if (tool.durability.current <= 1)
                            return false;
                    }

                    tool.durability.damage(1);
                    if (tool.durability.current <= 0) {
                        world.playSound("random.break", this.#player.location);
                        // THINKME: This would be wrong for things like
                        // tools leaving scraps upon breaking, but there is
                        // currently no mechanism available for us to
                        // customise the behaviour.
                        this.#player.equipments.delete(EquipmentSlot.Mainhand);
                        toolWithstood = false;
                    }
                    else {
                        this.#player.equipments.set(EquipmentSlot.Mainhand, tool);
                    }
                }
            }
        }

        // Tool enchantments should not apply to bonus mining.
        const tool  = way === MiningWay.MineRegularly ? this.#tool : undefined;
        const loots = props.lootTable(perm).execute(tool);
        const xp    = props.experience(perm, this.#tool);
        if (this.#playerPrefs.loots.autoCollect) {
            this.#loots.merge(loots);
            this.#experience += xp;
        }
        else {
            // The player asked us to cause server lag by not automatically
            // collecting loots for them. Okay then. Spam the server with a
            // fabulous amount of item entities.
            if (!this.#isCreative) {
                for (const stack of loots)
                    this.#dimension.spawnItem(stack, block.location.offset(0.5));

                // We cannot spawn experience orbs with custom values. Shit.
                for (let i = 0; i < xp; i++)
                    this.#dimension.spawnEntity("minecraft:xp_orb", block.location.offset(0.5));
            }
        }
        props.break(block, tool);

        return toolWithstood;
    }

    #flushLoots() {
        // Spawn item entities and experience orbs at the location of the
        // player who initiated the quick-mining. We could place items
        // directly in their inventory, but it's easier this way as we
        // don't need to handle cases like when their inventory is full.
        if (this.#player.isValid) {
            // But creative players should not receive items or XPs.
            if (!this.#isCreative) {
                for (const stack of this.#loots)
                    this.#player.dimension.spawnItem(stack, this.#player.location);

                if (this.#experience > 0) {
                    // If the user has any equipped items that have Mending,
                    // consume the XP for repairing them.
                    const toMend: [EquipmentSlot, ItemStack][] = [];
                    this.#player.equipments.forEach((item, slot) => {
                        if (item.enchantments.has("mending")) {
                            const dur = item.durability;
                            if (dur && dur.current < dur.maximum)
                                toMend.push([slot, item]);
                        }
                    });
                    while (toMend.length > 0 && this.#experience > 0) {
                        const idx          = Math.floor(Math.random() * toMend.length);
                        const [slot, item] = toMend[idx]!;
                        const dur          = item.durability!;
                        if (dur.maximum - dur.current >= 2) {
                            dur.current += 2;
                            this.#experience--;
                        }
                        else {
                            // The tool has only 1 durability to repair. No
                            // XP is consumed in this case.
                            dur.current++;
                        }
                        this.#player.equipments.set(slot, item);

                        if (dur.current >= dur.maximum)
                            // This tool is now fully repaired.
                            toMend.splice(idx, 1);
                    }
                }

                // And if we still have XP to dispense, put it directly
                // into the player.
                while (this.#experience > 0) {
                    const toNextLevel = this.#player.totalXpNeededForNextLevel - this.#player.xpEarnedAtCurrentLevel;
                    const toAbsorb    = Math.min(this.#experience, toNextLevel);

                    this.#player.addExperience(toAbsorb);
                    if (toAbsorb >= toNextLevel)
                        this.#playSound("random.levelup");
                    else
                        this.#playSound("random.orb");

                    this.#experience -= toAbsorb;
                }
            }
        }
        else {
            // But the player is invalid. Maybe the they have left?
            for (const stack of this.#loots)
                this.#dimension.spawnItem(stack, this.#origLoc.offset(0.5));

            // We cannot spawn experience orbs with custom values. Shit.
            for (let i = 0; i < this.#experience; i++)
                this.#dimension.spawnEntity("minecraft:xp_orb", this.#origLoc.offset(0.5));
        }
        this.#loots.clear();
        this.#experience = 0;
    }
}

// My efforts on optimising HashSet didn't come to fruition. Initially it
// was 60x slower than this, and now it's still 2x slower than this abysmal
// abuse of the Set type although it's slightly faster than OrdSet. IT'S A
// SHAME.
class LocationSet {
    readonly #set: Set<string>;

    public constructor() {
        this.#set = new Set();
    }

    public get size(): number {
        return this.#set.size;
    }

    public add(loc: Location): void {
        this.#set.add(LocationSet.#loc2str(loc));
    }

    public has(loc: Location): boolean {
        return this.#set.has(LocationSet.#loc2str(loc));
    }

    public deleteAny(): Location|undefined {
        const str = this.#set.values().next().value;
        if (str) {
            this.#set.delete(str);
            return LocationSet.#str2loc(str);
        }
        else {
            return undefined;
        }
    }

    static #loc2str(loc: Location): string {
        return `${loc.x},${loc.y},${loc.z}`;
    }

    static #str2loc(str: string): Location {
        const pos0 = str.indexOf(",");
        const pos1 = str.indexOf(",", pos0 + 1);
        return new Location(
            parseInt(str.substring(0, pos0)),
            parseInt(str.substring(pos0 + 1, pos1)),
            parseInt(str.substring(pos1 + 1)));
    }
}
