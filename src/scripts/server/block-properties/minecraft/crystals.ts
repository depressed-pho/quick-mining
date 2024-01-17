import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { MultiplicativeDrops, SilkTouchRequired } from "../mixins.js";

abstract class CrystalProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.enableMiningCrystals)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

// Amethyst buds
blockProps.addBlockProps(
    "minecraft:small_amethyst_bud",
    class extends SilkTouchRequired(CrystalProperties) {
        public breakingSoundId(): string {
            return "break.small_amethyst_bud";
        }
    });

blockProps.addBlockProps(
    "minecraft:medium_amethyst_bud",
    class extends SilkTouchRequired(CrystalProperties) {
        public breakingSoundId(): string {
            return "break.medium_amethyst_bud";
        }
    });

blockProps.addBlockProps(
    "minecraft:large_amethyst_bud",
    class extends SilkTouchRequired(CrystalProperties) {
        public breakingSoundId(): string {
            return "break.large_amethyst_bud";
        }
    });

// Amethyst Cluster
blockProps.addBlockProps(
    "minecraft:amethyst_cluster",
    class extends MultiplicativeDrops(
        CrystalProperties,
        new ItemStack("minecraft:amethyst_cluster"),
        4, 4,
        new ItemStack("minecraft:amethyst_shard")) {

        public breakingSoundId(): string {
            return "break.amethyst_cluster";
        }
    });
