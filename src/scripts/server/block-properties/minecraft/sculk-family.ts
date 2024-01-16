import { BlockPermutation } from "cicada-lib/block.js";
import { Constructor } from "cicada-lib/mixin.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { LootTable, LootCondition, LootPool } from "../../loot-table.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { Experience } from "./ores.js";
import { GlowLichenLike } from "./plants.js";

/// Base class for sculk family blocks.
abstract class SculkFamilyProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.enableMiningSculkFamily)
            return tool.tags.has("is_hoe");
        else
            return false;
    }
}

/// Mixin for blocks requiring a silk-touch tool to drop itself.
function SilkTouchRequired<T extends Constructor<BlockProperties>>(base: T, block: ItemStack) {
    const loots = new LootTable()
        .when(
            LootCondition.matchTool().enchantment("silk_touch"),
            [ new LootPool().entry(block) ]); // 100% drop

    abstract class SilkTouchRequired extends base {
        public override lootTable(): LootTable {
            return loots;
        }
    }
    return SilkTouchRequired;
}

// Sculk
blockProps.addBlockProps(
    "minecraft:sculk",
    class extends SilkTouchRequired(
        Experience(SculkFamilyProperties, 1),
        new ItemStack("minecraft:sculk")) {

        public breakingSoundId(): string {
            return "break.sculk";
        }
    });

// Sculk Catalyst
blockProps.addBlockProps(
    "minecraft:sculk_catalyst",
    class extends SilkTouchRequired(
        Experience(SculkFamilyProperties, 5),
        new ItemStack("minecraft:sculk_catalyst")) {

        public breakingSoundId(): string {
            return "break.sculk_catalyst";
        }
    });

// Sculk Sensor
blockProps.addBlockProps(
    "minecraft:sculk_sensor",
    class extends SilkTouchRequired(
        Experience(SculkFamilyProperties, 5),
        new ItemStack("minecraft:sculk_sensor")) {

        public breakingSoundId(): string {
            return "break.sculk_sensor";
        }
    });

// Sculk Shrieker
blockProps.addBlockProps(
    "minecraft:sculk_shrieker",
    class extends SilkTouchRequired(
        Experience(SculkFamilyProperties, 5),
        new ItemStack("minecraft:sculk_shrieker")) {

        public breakingSoundId(): string {
            return "break.sculk_shrieker";
        }
    });

// Sculk Vein
blockProps.addBlockProps(
    "minecraft:sculk_vein",
    class extends GlowLichenLike(
        SculkFamilyProperties,
        LootCondition.matchTool().enchantment("silk_touch")) {

        public breakingSoundId(): string {
            return "break.sculk_vein";
        }
    });
