import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../../block-properties.js";
import { PlayerPrefs } from "../../../player-prefs.js";
import { IgnoringState } from "../../mixins.js";

/// Base class for non-stone common stone rocks.
abstract class CommonRockProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.rocksCommon)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

// Andesite
blockProps.addBlockProps(
    "minecraft:andesite",
    class extends CommonRockProperties {
        public breakingSoundId(): string {
            return "dig.stone";
        }
    });

// Basalt
blockProps.addBlockProps(
    "minecraft:basalt",
    class extends IgnoringState(CommonRockProperties, "pillar_axis") {
        public breakingSoundId(): string {
            return "dig.basalt";
        }
    });

// Diorite
blockProps.addBlockProps(
    "minecraft:diorite",
    class extends CommonRockProperties {
        public breakingSoundId(): string {
            return "dig.stone";
        }
    });

// Tuff
blockProps.addBlockProps(
    "minecraft:tuff",
    class extends CommonRockProperties {
        public breakingSoundId(): string {
            return "break.tuff";
        }
    });
