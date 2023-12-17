import { Block, BlockPermutation } from "cicada-lib/block.js";
import { Dimension } from "cicada-lib/dimension.js";
import { HashSet } from "cicada-lib/collections/hash-set.js";
import { Hasher } from "cicada-lib/hasher.js";
import { Location } from "cicada-lib/location.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { Thread } from "cicada-lib/thread.js";

enum MiningWay {
    /// Don't mine this block.
    Skip,
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

export class MinerThread extends Thread {
    // THINKME: Maybe this should be world-configurable?
    static readonly MAX_BLOCKS_TO_MINE_PER_TICK = 8;

    // @ts-ignore: FIXME
    readonly #tool: ItemStack;
    readonly #dimension: Dimension;
    readonly #origLoc: Location;
    readonly #origPerm: BlockPermutation;
    readonly #mined: HashSet<Location>;
    readonly #scheduled: HashSet<Location>;
    // @ts-ignore: FIXME
    readonly #loots: ItemStack[];

    public constructor(tool: ItemStack, origin: Block) {
        super();
        this.#tool      = tool;
        this.#dimension = origin.dimension;
        this.#origLoc   = origin.location;
        this.#origPerm  = origin.permutation;

        const eqLoc     = (la: Location, lb: Location) => la.equals(lb);
        const hashLoc   = (hasher: Hasher, loc: Location) => {
            hasher.update(loc.x);
            hasher.update(loc.y);
            hasher.update(loc.z);
        };
        this.#mined     = new HashSet<Location>(eqLoc, hashLoc);
        this.#scheduled = new HashSet<Location>(eqLoc, hashLoc);

        this.#loots     = [];
    }

    protected async* run() {
        try {
            this.#tryMining(this.#origLoc);

            let numMinedByPrevTick = 0;
            while (this.#scheduled.size > 0) {
                const loc = this.#scheduled.values().next().value!;
                this.#scheduled.delete(loc);

                if (this.#tryMining(loc)) {
                    const numMinedInThisTick = this.#mined.size - numMinedByPrevTick;
                    if (numMinedInThisTick >= MinerThread.MAX_BLOCKS_TO_MINE_PER_TICK) {
                        this.#flush();
                        numMinedByPrevTick = this.#mined.size;
                        yield;
                    }
                }
            }
        }
        finally {
            this.#flush();
        }
    }

    // Return `true` iff it actually mined a block.
    #tryMining(loc: Location): boolean {
        const block = this.#dimension.getBlock(loc);

        if (!block || !block.isValid)
            // This block is either in an unloaded chunk or out of the
            // world boundary, so we can't do anything about it.
            return false;

        switch (this.#miningWay(block.permutation)) {
            case MiningWay.Skip:
                return false;

            case MiningWay.MineRegularly:
                // FIXME: play sound but only once per tick
                // FIXME: Consume the durability.

            case MiningWay.MineAsABonus:
                this.#addToLoots(block.permutation);
                block.type = "minecraft:air";
                this.#mined.add(loc);

                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        for (let z = -1; z <= 1; z++) {
                            const loc1 = loc.offset(x, y, z);
                            if (!this.#mined.has(loc1)) {
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
            if (LEAF_BLOCK_IDS.has(perm.type.id) && !perm.states.get("persistent_bit"))
                return MiningWay.MineAsABonus;

        if (perm.equals(this.#origPerm))
            return MiningWay.MineRegularly;

        return MiningWay.Skip;
    }

    #addToLoots(_perm: BlockPermutation) {
        // FIXME
    }

    #flush() {
        // FIXME
    }
}
