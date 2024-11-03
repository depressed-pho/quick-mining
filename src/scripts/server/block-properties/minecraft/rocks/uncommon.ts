import { BlockPermutation } from "cicada-lib/block.js";
import { GameMode, Player } from "cicada-lib/player.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../../block-properties.js";
import { PlayerPrefs } from "../../../player-prefs.js";

/// Base class for uncommon stone rocks.
abstract class UncommonRockProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.rocksUncommon)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

// Blackstone
blockProps.addBlockProps(
    "minecraft:blackstone",
    class extends UncommonRockProperties {
        public breakingSoundId(): string {
            return "dig.stone";
        }
    });

// Block of amethyst
blockProps.addBlockProps(
    "minecraft:amethyst_block",
    class extends UncommonRockProperties {
        public breakingSoundId(): string {
            return "break.amethyst_block";
        }
    });

// Budding Amethyst
blockProps.addBlockProps(
    "minecraft:budding_amethyst",
    class extends BlockProperties {
        public breakingSoundId(): string {
            return "break.amethyst_block";
        }

        public override isProtected(_perm: BlockPermutation, player: Player, prefs: PlayerPrefs): boolean {
            if (player.gameMode === GameMode.survival)
                return prefs.protection.keepBuddingAmethystFromBroken;
            else
                return false;
        }

        public isToolSuitable() {
            // Never quick-mine them.
            return false;
        }
    });

// Calcite
blockProps.addBlockProps(
    "minecraft:calcite",
    class extends UncommonRockProperties {
        public breakingSoundId(): string {
            return "break.calcite";
        }
    });

// Dripstone block
blockProps.addBlockProps(
    "minecraft:dripstone_block",
    class extends UncommonRockProperties {
        public breakingSoundId(): string {
            return "break.dripstone_block";
        }
    });

// Magma block
blockProps.addBlockProps(
    "minecraft:magma",
    class extends UncommonRockProperties {
        public breakingSoundId(): string {
            return "dig.stone";
        }
    });
