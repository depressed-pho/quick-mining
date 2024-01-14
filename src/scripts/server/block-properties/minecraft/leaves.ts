import { BlockPermutation } from "cicada-lib/block.js";
import { Constructor } from "cicada-lib/mixin.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { LootCondition, LootTable, LootPool } from "../../loot-table.js";
import { PlayerPrefs } from "../../player-prefs.js";

const AZALEA_LEAVES_IDS = new Set([
    "minecraft:azalea_leaves",
    "minecraft:azalea_leaves_flowered",
]);

// Oak leaves; they can drop apples.
const OAK_LOOTS = lootOfLeaves(
    new ItemStack("minecraft:leaves", {old_leaf_type: "oak"}),
    [ new LootPool()
        .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
        .entry(new ItemStack("minecraft:sapling", {sapling_type: "oak"})),
      new LootPool()
        .condition(LootCondition.randomChance(1/200, 1/180, 1/160, 1/120, 1/40))
        .entry(new ItemStack("minecraft:apple"))
    ]);

// Spruce leaves
const SPRUCE_LOOTS = lootOfLeaves(
    new ItemStack("minecraft:leaves", {old_leaf_type: "spruce"}),
    [ new LootPool()
        .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
        .entry(new ItemStack("minecraft:sapling", {sapling_type: "spruce"}))
    ]);

// Birch leaves
const BIRCH_LOOTS = lootOfLeaves(
    new ItemStack("minecraft:leaves", {old_leaf_type: "birch"}),
    [ new LootPool()
        .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
        .entry(new ItemStack("minecraft:sapling", {sapling_type: "birch"}))
    ]);

// Jungle leaves; they have a much lower chance of dropping sapplings.
const JUNGLE_LOOTS = lootOfLeaves(
    new ItemStack("minecraft:leaves", {old_leaf_type: "jungle"}),
    [ new LootPool()
        .condition(LootCondition.randomChance(1/40, 1/36, 1/32, 1/24, 1/10))
        .entry(new ItemStack("minecraft:sapling", {sapling_type: "jungle"}))
    ]);

// Acacia leaves
const ACACIA_LOOTS = lootOfLeaves(
    new ItemStack("minecraft:leaves2", {new_leaf_type: "acacia"}),
    [ new LootPool()
        .condition(LootCondition.randomChance(1/40, 1/36, 1/32, 1/24, 1/10))
        .entry(new ItemStack("minecraft:sapling", {sapling_type: "acacia"}))
    ]);

// Dark oak leaves; they can drop apples.
const DARK_OAK_LOOTS = lootOfLeaves(
    new ItemStack("minecraft:leaves2", {new_leaf_type: "dark_oak"}),
    [ new LootPool()
        .condition(LootCondition.randomChance(1/40, 1/36, 1/32, 1/24, 1/10))
        .entry(new ItemStack("minecraft:sapling", {sapling_type: "dark_oak"})),
      new LootPool()
        .condition(LootCondition.randomChance(1/200, 1/180, 1/160, 1/120, 1/40))
        .entry(new ItemStack("minecraft:apple"))
    ]);

// Mangrove leaves; they don't drop saplings.
const MANGROVE_LOOTS = lootOfLeaves(
    new ItemStack("minecraft:mangrove_leaves"), []);

// Cherry leaves
const CHERRY_LOOTS = lootOfLeaves(
    new ItemStack("minecraft:cherry_leaves"),
    [ new LootPool()
        .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
        .entry(new ItemStack("minecraft:cherry_sapling"))
    ]);

// Azalea leaves
const AZALEA_LOOTS = lootOfLeaves(
    new ItemStack("minecraft:azalea_leaves"),
    [ new LootPool()
        .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
        .entry(new ItemStack("minecraft:azalea"))
    ]);
const FLOWERING_AZALEA_LOOTS = lootOfLeaves(
    new ItemStack("minecraft:azalea_leaves_flowered"),
    [ new LootPool()
        .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
        .entry(new ItemStack("minecraft:flowering_azalea"))
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
class LeavesProperties extends BlockProperties {
    public breakingSoundId(): string {
        return "dig.grass";
    }

    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs): boolean {
        if (prefs.coverage.enableMiningLeaves)
            // There is no tags for shears, which is unfortunate but is
            // understandable because the vanilla Minecraft has only one type of shears.
            return tool.typeId === "minecraft:shears" ||
                   tool.tags.has("minecraft:is_hoe");
        else
            return false;
    }

    public override isEquivalentTo(pa: BlockPermutation, pb: BlockPermutation): boolean {
        // A special case for mining leaves. Ignore the difference in
        // update_bit.
        if (pa.typeId === pb.typeId) {
            for (const [key, value] of pa.states) {
                if (key === "update_bit")
                    continue;
                else if (pb.states.get(key) !== value)
                    return false;
            }
            return true;
        }
        else {
            return false;
        }
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

blockProps.addBlockProps(
    "minecraft:leaves",
    class extends LeavesProperties {
        public override lootTable(perm: BlockPermutation): LootTable {
            const leafType = perm.states.get("old_leaf_type");
            switch (leafType) {
                case "oak":    return OAK_LOOTS;
                case "spruce": return SPRUCE_LOOTS;
                case "birch":  return BIRCH_LOOTS;
                case "jungle": return JUNGLE_LOOTS;
                default:
                    throw new Error(`Unknown leaf type for \`minecraft:leaves': ${leafType}`);
            }
        }
    });

blockProps.addBlockProps(
    "minecraft:leaves2",
    class extends LeavesProperties {
        public override lootTable(perm: BlockPermutation): LootTable {
            const leafType = perm.states.get("new_leaf_type");
            switch (leafType) {
                case "acacia":   return ACACIA_LOOTS;
                case "dark_oak": return DARK_OAK_LOOTS;
                default:
                    throw new Error(`Unknown leaf type for \`minecraft:leaves': ${leafType}`);
            }
        }
    });

blockProps.addBlockProps(
    "minecraft:mangrove_leaves",
    class extends LeavesProperties {
        public override lootTable(): LootTable {
            return MANGROVE_LOOTS;
        }
    });

blockProps.addBlockProps(
    "minecraft:cherry_leaves",
    class extends LeavesProperties {
        public override breakingSoundId(): string {
            return "break.cherry_leaves";
        }

        public override lootTable(): LootTable {
            return CHERRY_LOOTS;
        }
    });

blockProps.addBlockProps(
    "minecraft:azalea_leaves",
    class extends AzaleaLike(LeavesProperties) {
        public override lootTable(): LootTable {
            return AZALEA_LOOTS;
        }
    });

blockProps.addBlockProps(
    "minecraft:azalea_leaves_flowered",
    class extends AzaleaLike(LeavesProperties) {
        public override lootTable(): LootTable {
            return FLOWERING_AZALEA_LOOTS;
        }
    });
