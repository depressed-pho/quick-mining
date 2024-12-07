import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { Fragile } from "../mixins.js";

// Bookshelf
blockProps.addBlockProps(
    "minecraft:bookshelf",
    class extends Fragile(BlockProperties, new ItemStack("minecraft:book", 3)) {
        public breakingSoundId(): string {
            return "dig.wood";
        }

        public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
            if (prefs.coverage.bookshelves)
                return tool.tags.has("minecraft:is_axe");
            else
                return false;
        }
    });

// NOTE: We cannot allow Chiseled Bookshelf to be quick-mined because it
// doesn't have a block component minecraft:inventory for whatever reason
// and thus we cannot retrieve books inside it.
