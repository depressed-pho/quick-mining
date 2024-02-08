import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { Fragile } from "../mixins.js";

/// Base class for netherrack-like blocks.
abstract class NetherrackLikeProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.netherrackLike)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

// Netherrack
blockProps.addBlockProps(
    "minecraft:netherrack",
    class extends NetherrackLikeProperties {
        public breakingSoundId(): string {
            return "dig.netherrack";
        }
    });

// Crimson Nylium
blockProps.addBlockProps(
    "minecraft:crimson_nylium",
    class extends Fragile(NetherrackLikeProperties, new ItemStack("minecraft:netherrack")) {
        public breakingSoundId(): string {
            return "dig.nylium";
        }
    });

// Warped Nylium
blockProps.addBlockProps(
    "minecraft:warped_nylium",
    class extends Fragile(NetherrackLikeProperties, new ItemStack("minecraft:netherrack")) {
        public breakingSoundId(): string {
            return "dig.nylium";
        }
    });
