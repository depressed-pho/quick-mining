import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";

/// Base class for terracotta
abstract class TerracottaProperties extends BlockProperties {
    public breakingSoundId(): string {
        return "dig.stone";
    }

    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.terracotta)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

// Terracotta
const TERRACOTTA_IDS = new Set([
    "minecraft:hardened_clay",
    "minecraft:white_terracotta",
    "minecraft:orange_terracotta",
    "minecraft:magenta_terracotta",
    "minecraft:light_blue_terracotta",
    "minecraft:yellow_terracotta",
    "minecraft:lime_terracotta",
    "minecraft:pink_terracotta",
    "minecraft:gray_terracotta",
    "minecraft:light_gray_terracotta",
    "minecraft:cyan_terracotta",
    "minecraft:purple_terracotta",
    "minecraft:blue_terracotta",
    "minecraft:brown_terracotta",
    "minecraft:green_terracotta",
    "minecraft:red_terracotta",
    "minecraft:black_terracotta",
]);
for (const blockId of TERRACOTTA_IDS) {
    blockProps.addBlockProps(blockId, TerracottaProperties);
}
