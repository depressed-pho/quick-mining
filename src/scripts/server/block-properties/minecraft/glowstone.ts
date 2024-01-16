import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { DiscreteUniformDrops } from "../mixins.js";

/// Base class for glowstone-like blocks.
abstract class GlowstoneLikeProperties extends BlockProperties {
    public breakingSoundId(): string {
        return "random.glass";
    }

    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.enableMiningGlowstoneLike)
            // This isn't really correct, as these blocks can be mined with
            // any tools (including bare hands). But should we really allow
            // players to initiate a quick mining of glowstones with
            // something like a sword?
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

// Glowstone
blockProps.addBlockProps(
    "minecraft:glowstone",
    class extends DiscreteUniformDrops(
        GlowstoneLikeProperties,
        new ItemStack("minecraft:glowstone"),
        2, 4, 4,
        new ItemStack("minecraft:glowstone_dust")) {});

// Sea lantern
blockProps.addBlockProps(
    "minecraft:sea_lantern",
    class extends DiscreteUniformDrops(
        GlowstoneLikeProperties,
        new ItemStack("minecraft:sea_lantern"),
        2, 5, 5,
        new ItemStack("minecraft:prismarine_crystals")) {});
