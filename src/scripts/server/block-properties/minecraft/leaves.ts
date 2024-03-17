import { BlockPermutation } from "cicada-lib/block.js";
import { Constructor } from "cicada-lib/mixin.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { LootCondition, LootTable, LootPool } from "../../loot-table.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { IgnoringState } from "../mixins.js";

const AZALEA_LEAVES_IDS = new Set([
    "minecraft:azalea_leaves",
    "minecraft:azalea_leaves_flowered",
]);

function lootOfLeaves(leafBlock: ItemStack, extraPools: LootPool[]): LootTable {
    return new LootTable()
        .when(
            LootCondition.or([
                LootCondition.matchTool().typeId("minecraft:shears"),
                LootCondition.matchTool().enchantment("silk_touch")
            ]),
            [ new LootPool().entry(leafBlock) ]) // 100% drop

        .otherwise(
            [ new LootPool()
                .rolls(1, 2)
                .condition(LootCondition.randomChance(1/50, 1/45, 1/40, 1/30))
                .entry(new ItemStack("minecraft:stick")),
              ...extraPools
            ]);
}

/// Base class for all leaf blocks.
class LeavesProperties extends IgnoringState(BlockProperties, "update_bit") {
    public breakingSoundId(): string {
        return "dig.grass";
    }

    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs): boolean {
        if (prefs.coverage.leaves)
            // There is no tags for shears, which is unfortunate but is
            // understandable because the vanilla Minecraft has only one type of shears.
            return tool.typeId === "minecraft:shears" ||
                   tool.tags.has("minecraft:is_hoe");
        else
            return false;
    }
}

/// Mixin for azalea-like leaves.
function AzaleaLike<T extends Constructor<LeavesProperties>>(base: T) {
    abstract class AzaleaLike extends base {
        public override breakingSoundId(): string {
            return "dig.azalea_leaves";
        }

        public override isEquivalentTo(pa: BlockPermutation, pb: BlockPermutation): boolean {
            // A special case for mining azalea leaves (flowering or
            // not). It should also mine the other variant as long as they
            // have an identical persistence state.
            if (AZALEA_LEAVES_IDS.has(pa.typeId) && AZALEA_LEAVES_IDS.has(pb.typeId))
                if (pa.states.get("persistent_bit") === pb.states.get("persistent_bit"))
                    return true;

            return super.isEquivalentTo(pa, pb);
        }
    }
    return AzaleaLike;
}

// Oak leaves; they can drop apples.
blockProps.addBlockProps(
    "minecraft:oak_leaves",
    class extends LeavesProperties {
        readonly #loots = lootOfLeaves(
            new ItemStack("minecraft:oak_leaves"),
            [ new LootPool()
                .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
                .entry(new ItemStack("minecraft:sapling", {sapling_type: "oak"})),
              new LootPool()
                  .condition(LootCondition.randomChance(1/200, 1/180, 1/160, 1/120, 1/40))
                  .entry(new ItemStack("minecraft:apple"))
            ]);

        public override lootTable(): LootTable {
            return this.#loots;
        }
    });

// Spruce leaves
blockProps.addBlockProps(
    "minecraft:spruce_leaves",
    class extends LeavesProperties {
        readonly #loots = lootOfLeaves(
            new ItemStack("minecraft:spruce_leaves"),
            [ new LootPool()
                .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
                .entry(new ItemStack("minecraft:sapling", {sapling_type: "spruce"}))
            ]);

        public override lootTable(): LootTable {
            return this.#loots;
        }
    });

// Birch leaves
blockProps.addBlockProps(
    "minecraft:birch_leaves",
    class extends LeavesProperties {
        readonly #loots = lootOfLeaves(
            new ItemStack("minecraft:birch_leaves"),
            [ new LootPool()
                .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
                .entry(new ItemStack("minecraft:sapling", {sapling_type: "birch"}))
            ]);

        public override lootTable(): LootTable {
            return this.#loots;
        }
    });

// Jungle leaves; they have a much lower chance of dropping sapplings.
blockProps.addBlockProps(
    "minecraft:jungle_leaves",
    class extends LeavesProperties {
        readonly #loots = lootOfLeaves(
            new ItemStack("minecraft:jungle_leaves"),
            [ new LootPool()
                .condition(LootCondition.randomChance(1/40, 1/36, 1/32, 1/24, 1/10))
                .entry(new ItemStack("minecraft:sapling", {sapling_type: "jungle"}))
            ]);

        public override lootTable(): LootTable {
            return this.#loots;
        }
    });

// Acacia leaves
blockProps.addBlockProps(
    "minecraft:acacia_leaves",
    class extends LeavesProperties {
        readonly #loots = lootOfLeaves(
            new ItemStack("minecraft:acacia_leaves"),
            [ new LootPool()
                .condition(LootCondition.randomChance(1/40, 1/36, 1/32, 1/24, 1/10))
                .entry(new ItemStack("minecraft:sapling", {sapling_type: "acacia"}))
            ]);

        public override lootTable(): LootTable {
            return this.#loots;
        }
    });

// Dark oak leaves; they can drop apples.
blockProps.addBlockProps(
    "minecraft:dark_oak_leaves",
    class extends LeavesProperties {
        readonly #loots = lootOfLeaves(
            new ItemStack("minecraft:dark_oak_leaves"),
            [ new LootPool()
                .condition(LootCondition.randomChance(1/40, 1/36, 1/32, 1/24, 1/10))
                .entry(new ItemStack("minecraft:sapling", {sapling_type: "dark_oak"})),
              new LootPool()
                  .condition(LootCondition.randomChance(1/200, 1/180, 1/160, 1/120, 1/40))
                  .entry(new ItemStack("minecraft:apple"))
            ]);

        public override lootTable(): LootTable {
            return this.#loots;
        }
    });

// Mangrove leaves; they don't drop saplings.
blockProps.addBlockProps(
    "minecraft:mangrove_leaves",
    class extends LeavesProperties {
        readonly #loots = lootOfLeaves(
            new ItemStack("minecraft:mangrove_leaves"), []);

        public override lootTable(): LootTable {
            return this.#loots;
        }
    });

// Cherry leaves
blockProps.addBlockProps(
    "minecraft:cherry_leaves",
    class extends LeavesProperties {
        readonly #loots = lootOfLeaves(
            new ItemStack("minecraft:cherry_leaves"),
            [ new LootPool()
                .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
                .entry(new ItemStack("minecraft:cherry_sapling"))
            ]);

        public override breakingSoundId(): string {
            return "break.cherry_leaves";
        }

        public override lootTable(): LootTable {
            return this.#loots;
        }
    });

// Azalea leaves
blockProps.addBlockProps(
    "minecraft:azalea_leaves",
    class extends AzaleaLike(LeavesProperties) {
        readonly #loots = lootOfLeaves(
            new ItemStack("minecraft:azalea_leaves"),
            [ new LootPool()
                .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
                .entry(new ItemStack("minecraft:azalea"))
            ]);

        public override lootTable(): LootTable {
            return this.#loots;
        }
    });

blockProps.addBlockProps(
    "minecraft:azalea_leaves_flowered",
    class extends AzaleaLike(LeavesProperties) {
        readonly #loots = lootOfLeaves(
            new ItemStack("minecraft:azalea_leaves_flowered"),
            [ new LootPool()
                .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
                .entry(new ItemStack("minecraft:flowering_azalea"))
            ]);

        public override lootTable(): LootTable {
            return this.#loots;
        }
    });
