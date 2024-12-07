import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { IgnoringAllStates } from "../mixins.js";

/// Base class for bones.
class BoneProperties extends IgnoringAllStates(BlockProperties) {
    public breakingSoundId(): string {
        return "dig.bone_block";
    }

    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.bones)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

// Bone block
blockProps.addBlockProps(
    "minecraft:bone_block", BoneProperties);
