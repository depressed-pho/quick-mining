import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { LootCondition } from "../../loot-table.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { SilkTouchForDrop, YieldsExperience } from "../mixins.js";
import { GlowLichenLike } from "./plants.js";

/// Base class for sculk family blocks.
abstract class SculkFamilyProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.sculkFamily)
            return tool.tags.has("minecraft:is_hoe");
        else
            return false;
    }
}

// Sculk
blockProps.addBlockProps(
    "minecraft:sculk",
    class extends SilkTouchForDrop(
        YieldsExperience(SculkFamilyProperties, 1)) {

        public breakingSoundId(): string {
            return "break.sculk";
        }
    });

// Sculk Catalyst
blockProps.addBlockProps(
    "minecraft:sculk_catalyst",
    class extends SilkTouchForDrop(
        YieldsExperience(SculkFamilyProperties, 5)) {

        public breakingSoundId(): string {
            return "break.sculk_catalyst";
        }
    });

// Sculk Sensor
blockProps.addBlockProps(
    "minecraft:sculk_sensor",
    class extends SilkTouchForDrop(
        YieldsExperience(SculkFamilyProperties, 5)) {

        public breakingSoundId(): string {
            return "break.sculk_sensor";
        }
    });

// Sculk Shrieker
blockProps.addBlockProps(
    "minecraft:sculk_shrieker",
    class extends SilkTouchForDrop(
        YieldsExperience(SculkFamilyProperties, 5)) {

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
