import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { Drops, Fragile, IgnoringState } from "../mixins.js";

/// Base class for dirt-like rocks.
abstract class DirtLikeProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.dirtLike)
            return tool.tags.has("minecraft:is_shovel");
        else
            return false;
    }

    public breakingSoundId(): string {
        return "dig.gravel";
    }
}

// Dirt and Coarse Dirt: these share the same block ID.
blockProps.addBlockProps(
    "minecraft:dirt", DirtLikeProperties);

// Dirt Path
blockProps.addBlockProps(
    "minecraft:grass_path",
    class extends Fragile(DirtLikeProperties, new ItemStack("minecraft:dirt")) {
        public override breakingSoundId(): string {
            return "dig.grass";
        }
    });

// Farmland
blockProps.addBlockProps(
    "minecraft:farmland",
    class extends IgnoringState(
        Drops(
            DirtLikeProperties,
            new ItemStack("minecraft:dirt")),
        "moisturized_amount") {});

// Grass Block
blockProps.addBlockProps(
    "minecraft:grass_block",
    class extends Fragile(DirtLikeProperties, new ItemStack("minecraft:dirt")) {
        public override breakingSoundId(): string {
            return "dig.grass";
        }
    });

// Mycelium
blockProps.addBlockProps(
    "minecraft:mycelium",
    class extends Fragile(DirtLikeProperties, new ItemStack("minecraft:dirt")) {
        public override breakingSoundId(): string {
            return "dig.grass";
        }
    });

// Podzol
blockProps.addBlockProps(
    "minecraft:podzol",
    class extends Fragile(DirtLikeProperties, new ItemStack("minecraft:dirt")) {});

// Rooted Dirt
blockProps.addBlockProps(
    "minecraft:dirt_with_roots", DirtLikeProperties);
