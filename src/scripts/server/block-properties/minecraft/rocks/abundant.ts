import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../../block-properties.js";
import { PlayerPrefs } from "../../../player-prefs.js";
import { Fragile, IgnoringState } from "../../mixins.js";

/// Base class for abundant rocks.
abstract class AbundantRockProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.rocksAbundant)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }

    public breakingSoundId(): string {
        return "dig.stone";
    }
}

// Stone
blockProps.addBlockProps(
    "minecraft:stone",
    Fragile(AbundantRockProperties, new ItemStack("minecraft:cobblestone")));

// Cobblestone
blockProps.addBlockProps(
    "minecraft:cobblestone", AbundantRockProperties);

// Mossy Cobblestone
blockProps.addBlockProps(
    "minecraft:mossy_cobblestone", AbundantRockProperties);

// Deepslate
blockProps.addBlockProps(
    "minecraft:deepslate",
    class extends IgnoringState(
        Fragile(AbundantRockProperties, new ItemStack("minecraft:cobbled_deepslate")),
        "pillar_axis") {

        public override breakingSoundId(): string {
            return "dig.deepslate";
        }
    });

// Cobbled Deepslate
blockProps.addBlockProps(
    "minecraft:cobbled_deepslate",
    class extends AbundantRockProperties {
        public override breakingSoundId(): string {
            return "dig.deepslate";
        }
    });

// End Stone
blockProps.addBlockProps(
    "minecraft:end_stone", AbundantRockProperties);
