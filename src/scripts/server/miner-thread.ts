import { Block, BlockPermutation } from "cicada-lib/block.js";
import { OrdMap } from "cicada-lib/collections/ordered-map.js";
import { Dimension } from "cicada-lib/dimension.js";
import { Entity } from "cicada-lib/entity.js";
import { ItemBag } from "cicada-lib/item/bag.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { Location } from "cicada-lib/location.js";
import { Player, GameMode } from "cicada-lib/player.js";
import { Timer } from "cicada-lib/timer.js";
import { Thread } from "cicada-lib/thread.js";
import { world } from "cicada-lib/world.js";
import { BlockProperties, MiningWay, blockProps } from "./block-properties.js";
import "./block-properties/minecraft.js";

export class MinerThread extends Thread {
    static readonly TIME_BUDGET_IN_MS_PER_TICK = 30; // Max 50
    static readonly MAX_BLOCKS_TO_MINE = 1024;

    readonly #actor: Entity;
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

    public constructor(actor: Entity, tool: ItemStack, origin: Block, perm: BlockPermutation) {
        super();
        this.#actor     = actor;
        this.#tool      = tool;
        this.#dimension = origin.dimension;
        this.#origLoc   = origin.location;
        this.#origPerm  = perm;
        this.#origProps = blockProps.get(perm);

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
        this.#scanned   = new LocationSet();
        this.#toScan    = new LocationSet();
        this.#toMine    = new OrdMap(ordBlock);

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
            if (this.#scan(loc))
                if (this.#toMine.size >= MinerThread.MAX_BLOCKS_TO_MINE)
                    break;

            if (timer.elapsedMs >= MinerThread.TIME_BUDGET_IN_MS_PER_TICK) {
                yield;
                timer.reset();
            }
        }

        // The second path: mine all blocks that we have decided to mine.
        try {
            for (const [block, [way, perm]] of this.#toMine.entries().reverse()) {
                this.#tryMining(block, way, perm);

                if (timer.elapsedMs >= MinerThread.TIME_BUDGET_IN_MS_PER_TICK) {
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
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        for (let z = -1; z <= 1; z++) {
                            const loc1 = loc.offset(x, y, z);
                            if (!this.#scanned.has(loc1))
                                this.#toScan.add(loc1);
                        }
                    }
                }
                return true;
        }
    }

    #tryMining(block: Block, way: MiningWay, perm: BlockPermutation) {
        console.assert(
            way === MiningWay.MineRegularly ||
            way === MiningWay.MineAsABonus);

        // Things might have changed since we scanned blocks, as our
        // operation is asynchronous. Check if the block is still the one
        // we expect.
        const props = blockProps.get(perm);
        if (!props.isEquivalentTo(perm, block.permutation))
            return;

        // Tool enchantments should not apply to bonus mining.
        const tool = way === MiningWay.MineRegularly ? this.#tool : undefined;
        this.#loots.merge(props.lootTable(perm).execute(tool));
        this.#experience += props.experience(perm, this.#tool);
        props.break(block, tool);

        if (way === MiningWay.MineRegularly) {
            // Play a breaking sound only once per tick.
            const soundId = props.breakingSoundId(perm);
            if (!this.#soundsPlayed.has(soundId)) {
                world.playSound(soundId, block.location);
                this.#soundsPlayed.add(soundId);
            }

            // FIXME: Consume the durability unless the player is in creative.
        }
    }

    #flushLoots() {
        // Spawn item entities and experience orbs at the location of the
        // actor who initiated the quick-mining. We could place items
        // directly in their inventory, but it's easier this way as we
        // don't need to handle cases like when their inventory is full.
        if (this.#actor.isValid) {
            for (const stack of this.#loots)
                this.#actor.dimension.spawnItem(stack, this.#actor.location);

            // Creative players should not receive experience orbs.
            if (!(this.#actor instanceof Player) || this.#actor.gameMode != GameMode.creative) {
                // We cannot spawn experience orbs with custom
                // values. Shit. We should not directly add experience to
                // the player also, because that would bypass Mending
                // tools.
                for (let i = 0; i < this.#experience; i++) {
                    this.#dimension.spawnEntity("minecraft:xp_orb", this.#actor.location);
                }
            }
        }
        else {
            // But the actor is invalid. Maybe the player has left?
            for (const stack of this.#loots)
                this.#dimension.spawnItem(stack, this.#origLoc);

            // We cannot spawn experience orbs with custom values. Shit.
            for (let i = 0; i < this.#experience; i++) {
                this.#dimension.spawnEntity("minecraft:xp_orb", this.#origLoc);
            }
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
