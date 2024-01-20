import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";

/// Base class for soul-sand-like blocks.
abstract class SoulSandLikeProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.soulSandLike)
            return tool.tags.has("minecraft:is_shovel");
        else
            return false;
    }
}

// Soul Sand
blockProps.addBlockProps(
    "minecraft:soul_sand",
    class extends SoulSandLikeProperties {
        public breakingSoundId(): string {
            return "dig.soul_sand";
        }
    });

// Soul Soil
blockProps.addBlockProps(
    "minecraft:soul_soil",
    class extends SoulSandLikeProperties {
        public breakingSoundId(): string {
            return "dig.soul_soil";
        }
    });
