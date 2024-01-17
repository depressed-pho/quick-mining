import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { IgnoringState } from "../mixins.js";

/// Base class for tuff-like blocks.
abstract class TuffLikeProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.enableMiningTuffLike)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

// Andesite
blockProps.addBlockProps(
    "minecraft:andesite",
    class extends TuffLikeProperties {
        public breakingSoundId(): string {
            return "dig.stone";
        }
    });

// Basalt
blockProps.addBlockProps(
    "minecraft:basalt",
    class extends IgnoringState(TuffLikeProperties, "pillar_axis") {
        public breakingSoundId(): string {
            return "dig.basalt";
        }
    });

// Blackstone
blockProps.addBlockProps(
    "minecraft:blackstone",
    class extends TuffLikeProperties {
        public breakingSoundId(): string {
            return "dig.stone";
        }
    });

// Block of amethyst
blockProps.addBlockProps(
    "minecraft:amethyst_block",
    class extends TuffLikeProperties {
        public breakingSoundId(): string {
            return "break.amethyst_block";
        }
    });

// Calcite
blockProps.addBlockProps(
    "minecraft:calcite",
    class extends TuffLikeProperties {
        public breakingSoundId(): string {
            return "break.calcite";
        }
    });

// Diorite
blockProps.addBlockProps(
    "minecraft:diorite",
    class extends TuffLikeProperties {
        public breakingSoundId(): string {
            return "dig.stone";
        }
    });

// Granite
blockProps.addBlockProps(
    "minecraft:granite",
    class extends TuffLikeProperties {
        public breakingSoundId(): string {
            return "dig.stone";
        }
    });

// Magma block
blockProps.addBlockProps(
    "minecraft:magma",
    class extends TuffLikeProperties {
        public breakingSoundId(): string {
            return "dig.stone";
        }
    });

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
    blockProps.addBlockProps(
        blockId,
        class extends TuffLikeProperties {
            public breakingSoundId(): string {
                return "dig.stone";
            }
        });
}

// Tuff
blockProps.addBlockProps(
    "minecraft:tuff",
    class extends TuffLikeProperties {
        public breakingSoundId(): string {
            return "break.tuff";
        }
    });
