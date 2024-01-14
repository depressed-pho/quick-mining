import { BlockPermutation } from "cicada-lib/block.js";
import { Constructor } from "cicada-lib/mixin.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { LootTable, LootCondition, LootPool } from "../../loot-table.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { MultiplicativeDrops } from "./ores.js";

abstract class CrystalProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.enableMiningCrystals)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

/// Mixin for crystals that drop itself when mined with a silk-touch tool, or
/// nothing otherwise.
function SilkTouchRequired<T extends Constructor<CrystalProperties>>(base: T, block: ItemStack) {
    const loots = new LootTable()
        .when(
            LootCondition.matchTool().enchantment("silk_touch"),
            [ new LootPool().entry(block) ]); // 100% drop

    abstract class SilkTouchRequired extends base {
        public override isToolSuitable(perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
            if (tool.enchantments.has("silk_touch"))
                return super.isToolSuitable(perm, tool, prefs);
            else
                return false;
        }

        public override lootTable(): LootTable {
            return loots;
        }
    }
    return SilkTouchRequired;
}

// Amethyst buds
blockProps.addBlockProps(
    "minecraft:small_amethyst_bud",
    class extends SilkTouchRequired(
        CrystalProperties,
        new ItemStack("minecraft:small_amethyst_bud")) {

        public breakingSoundId(): string {
            return "break.small_amethyst_bud";
        }
    });

blockProps.addBlockProps(
    "minecraft:medium_amethyst_bud",
    class extends SilkTouchRequired(
        CrystalProperties,
        new ItemStack("minecraft:medium_amethyst_bud")) {

        public breakingSoundId(): string {
            return "break.medium_amethyst_bud";
        }
    });

blockProps.addBlockProps(
    "minecraft:large_amethyst_bud",
    class extends SilkTouchRequired(
        CrystalProperties,
        new ItemStack("minecraft:large_amethyst_bud")) {

        public breakingSoundId(): string {
            return "break.large_amethyst_bud";
        }
    });

// Amethyst Cluster
blockProps.addBlockProps(
    "minecraft:amethyst_cluster",
    class extends MultiplicativeDrops(
        CrystalProperties,
        new ItemStack("minecraft:amethyst_cluster"),
        4, 4,
        new ItemStack("minecraft:amethyst_shard")) {

        public breakingSoundId(): string {
            return "break.amethyst_cluster";
        }
    });

// Block of amethyst
blockProps.addBlockProps(
    "minecraft:amethyst_block",
    class extends CrystalProperties {
        public breakingSoundId(): string {
            return "break.amethyst_block";
        }
    });
