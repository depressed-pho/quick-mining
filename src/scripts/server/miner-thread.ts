import { Block, BlockPermutation } from "cicada-lib/block.js";
import { HashSet } from "cicada-lib/collections/hash-set.js";
import { OrdSet } from "cicada-lib/collections/ordered-set.js";
import { Dimension } from "cicada-lib/dimension.js";
import { Entity } from "cicada-lib/entity.js";
import { Hasher } from "cicada-lib/hasher.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { Location } from "cicada-lib/location.js";
import { Timer } from "cicada-lib/timer.js";
import { Thread } from "cicada-lib/thread.js";
import { blockLoots } from "./loot-table.js";
import "./loot-table/minecraft.js";

enum MiningWay {
    /// Don't mine this block.
    LeaveAlone,
    /// Mine the block in the normal way: the tool durability should be
    /// consumed.
    MineRegularly,
    /// Mine the block as a bonus: the tool durability should not be
    /// consumed.
    MineAsABonus,
}

const LEAF_BLOCK_IDS = new Set([
    "minecraft:leaves",
    "minecraft:leaves2",
    "minecraft:mangrove_leaves",
    "minecraft:cherry_leaves",
    "minecraft:azalea_leaves",
    "minecraft:azalea_leaves_flowered",
]);

const AZALEA_LEAVES_IDS = new Set([
    "minecraft:azalea_leaves",
    "minecraft:azalea_leaves_flowered",
]);

export class MinerThread extends Thread {
    // THINKME: This should be world-configurable.
    static readonly TIME_BUDGET_IN_MS_PER_TICK = 30; // Max 50

    // THINKME: This should be world-configurable.
    static readonly MAX_BLOCKS_TO_MINE = 512;

    readonly #actor: Entity;
    // @ts-ignore: FIXME
    readonly #tool: ItemStack;
    readonly #dimension: Dimension;
    readonly #origLoc: Location;
    readonly #origPerm: BlockPermutation;
    readonly #mined: HashSet<Location>;
    readonly #leftAlone: HashSet<Location>; // negative cache
    readonly #scheduled: OrdSet<Location>;
    readonly #loots: ItemStack[];

    public constructor(actor: Entity, tool: ItemStack, origin: Block) {
        super();
        this.#actor     = actor;
        this.#tool      = tool;
        this.#dimension = origin.dimension;
        this.#origLoc   = origin.location;
        this.#origPerm  = origin.permutation;

        const eqLoc     = (la: Location, lb: Location) => la.equals(lb);
        const ordLoc    = (la: Location, lb: Location) => {
            // We sort scheduled blocks by Y, then X, and then Z, and mine
            // blocks from the highest to the lowest. This is because
            // blocks might be gravity-affected and we don't want them to
            // fall.
            return la.y > lb.y ?  1 :
                   la.y < lb.y ? -1 :
                   la.x > lb.x ?  1 :
                   la.x < lb.x ? -1 :
                   la.z > lb.z ?  1 :
                   la.z < lb.z ? -1 :
                   0;
        };
        const hashLoc   = (hasher: Hasher, loc: Location) => {
            hasher.update(loc.x);
            hasher.update(loc.y);
            hasher.update(loc.z);
        };
        this.#mined     = new HashSet<Location>(eqLoc, hashLoc);
        this.#leftAlone = new HashSet<Location>(eqLoc, hashLoc);
        this.#scheduled = new OrdSet<Location>(ordLoc);

        this.#loots     = [];
    }

    protected async* run() {
        try {
            this.#tryMining(this.#origLoc);

            let timer = new Timer();
            while (this.#scheduled.size > 0) {
                const loc = this.#scheduled.deleteMax()!;
                if (this.#tryMining(loc)) {
                    if (this.#mined.size >= MinerThread.MAX_BLOCKS_TO_MINE)
                        break;
                }

                if (timer.elapsedMs >= MinerThread.TIME_BUDGET_IN_MS_PER_TICK) {
                    this.#flushLoots();
                    yield;
                    timer = new Timer();
                }
            }
        }
        finally {
            this.#flushLoots();
        }
    }

    // Return `true` iff it actually mined a block.
    #tryMining(loc: Location): boolean {
        const block = this.#dimension.getBlock(loc);

        if (!block || !block.isValid) {
            // This block is either in an unloaded chunk or out of the
            // world boundary, so we can't do anything about it.
            this.#leftAlone.add(loc);
            return false;
        }

        const way = this.#miningWay(block.permutation);
        switch (way) {
            case MiningWay.LeaveAlone:
                this.#leftAlone.add(loc);
                return false;

            case MiningWay.MineRegularly:
                // FIXME: play sound but only once per tick
                // FIXME: Consume the durability.

            case MiningWay.MineAsABonus:
                this.#accumulateLoots(
                    block.permutation,
                    way === MiningWay.MineRegularly ? this.#tool : undefined);
                block.type = "minecraft:air";
                this.#mined.add(loc);

                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        for (let z = -1; z <= 1; z++) {
                            const loc1 = loc.offset(x, y, z);
                            if (!this.#mined.has(loc1) && !this.#leftAlone.has(loc1)) {
                                this.#scheduled.add(loc1);
                            }
                        }
                    }
                }
                return true;
        }
    }

    #miningWay(perm: BlockPermutation): MiningWay {
        // A special case for mining logs. It should also mine
        // non-persistent leaves as a bonus.
        if (this.#origPerm.tags.has("wood"))
            // Gee, leaves don't have block tags...
            if (LEAF_BLOCK_IDS.has(perm.typeId) && !perm.states.get("persistent_bit"))
                return MiningWay.MineAsABonus;

        // A special case for mining azalea leaves (flowering or not). It
        // should also mine the other variant as long as they have an
        // identical persistence state.
        if (AZALEA_LEAVES_IDS.has(this.#origPerm.typeId))
            if (AZALEA_LEAVES_IDS.has(perm.typeId))
                if (this.#origPerm.states.get("persistent_bit") === perm.states.get("persistent_bit"))
                    return MiningWay.MineRegularly;

        if (perm.equals(this.#origPerm))
            return MiningWay.MineRegularly;

        return MiningWay.LeaveAlone;
    }

    #accumulateLoots(perm: BlockPermutation, tool?: ItemStack) {
        const table = blockLoots.get(perm);
        if (table) {
            for (const stack of table.execute(tool)) {
                this.#addToLoots(stack);
            }
        }
        else {
            // Having no specific loot table means that the block should
            // drop itself regardless of how they are broken.
            const stack = perm.getItemStack(1);
            if (stack)
                this.#addToLoots(stack);
        }
    }

    #addToLoots(stack: ItemStack) {
        // Try to merge the stack with existing ones as far as possible.
        for (const st of this.#loots) {
            if (st.isStackableWith(stack)) {
                const numTaken = Math.min(st.maxAmount - st.amount, stack.amount);
                if (numTaken > 0) {
                    st.amount += numTaken;

                    const numRemains = stack.amount - numTaken;
                    if (numRemains == 0)
                        return;
                    else
                        stack.amount = numRemains;
                }
            }
        }

        // It couldn't be fully merged so add it to the list.
        this.#loots.push(stack);
    }

    #flushLoots() {
        // Spawn item entities at the location of the actor who initiated
        // the quick-mining. We could place items directly in their
        // inventory, but it's easier this way as we don't need to handle
        // cases like when their inventory is full.
        if (this.#actor.isValid) {
            for (const stack of this.#loots)
                this.#actor.dimension.spawnItem(stack, this.#actor.location);
        }
        else {
            // But the actor is invalid. Maybe the player has left?
            for (const stack of this.#loots)
                this.#dimension.spawnItem(stack, this.#origLoc);
        }
        this.#loots.splice(0);
    }
}
