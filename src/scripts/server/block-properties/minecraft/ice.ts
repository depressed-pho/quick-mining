import { Block, BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { SilkTouchRequired, SilkTouchForDrop } from "../mixins.js";

/// Base class for ice-like blocks.
abstract class IceLikeProperties extends BlockProperties {
    public breakingSoundId(): string {
        return "random.glass";
    }

    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.iceLike)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

// Ice
blockProps.addBlockProps(
    "minecraft:ice",
    class extends SilkTouchForDrop(IceLikeProperties) {
        public override "break"(block: Block, tool?: ItemStack): void {
            // Special case for breaking ice. If it's not in the Nether,
            // and the tool doesn't have Silk Touch, and the block directly
            // below it is not Air, then the block should turn into Water.
            if (block.dimension.id !== "minecraft:nether") {
                if (!tool || !tool.enchantments.has("silk_touch")) {
                    const below = block.offset(0, -1, 0);
                    if (!below || !below.isAir) {
                        block.typeId = "minecraft:water";
                        return;
                    }
                }
            }
            block.typeId = "minecraft:air";
        }
    });

// Packed ice
blockProps.addBlockProps(
    "minecraft:packed_ice",
    class extends SilkTouchRequired(IceLikeProperties) {});

// Blue ice
blockProps.addBlockProps(
    "minecraft:blue_ice",
    class extends SilkTouchRequired(IceLikeProperties) {});
