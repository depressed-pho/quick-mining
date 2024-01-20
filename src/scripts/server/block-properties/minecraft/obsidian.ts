import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { DiamondTier } from "../mixins.js";

/// Base class for obsidian-like blocks.
abstract class ObsidianLikeProperties extends BlockProperties {
    public breakingSoundId(): string {
        return "dig.stone";
    }

    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.obsidian)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

// Crying obsidian
blockProps.addBlockProps(
    "minecraft:crying_obsidian",
    class extends DiamondTier(ObsidianLikeProperties) {});

// Obsidian
blockProps.addBlockProps(
    "minecraft:obsidian",
    class extends DiamondTier(ObsidianLikeProperties) {});
