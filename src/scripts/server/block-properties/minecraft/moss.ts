import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";

/// Bass class for moss-like blocks.
class MossLikeProperties extends BlockProperties {
    public breakingSoundId(): string {
        return "dig.moss";
    }

    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.moss)
            return tool.tags.has("minecraft:is_hoe");
        else
            return false;
    }
}

// Moss Block
blockProps.addBlockProps("minecraft:moss_block", MossLikeProperties);

// Moss Carpet
blockProps.addBlockProps("minecraft:moss_carpet", MossLikeProperties);

// Pale Moss Block
blockProps.addBlockProps("minecraft:pale_moss_block", MossLikeProperties);

// Pale Moss Carpet
blockProps.addBlockProps("minecraft:pale_moss_carpet", MossLikeProperties);
