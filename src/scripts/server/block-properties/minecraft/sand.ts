import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { LootEntry, LootTable, LootPool } from "../../loot-table.js";
import { PlayerPrefs } from "../../player-prefs.js";

/// Base class for sand-like blocks.
abstract class SandLikeProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.sandLike)
            return tool.tags.has("minecraft:is_shovel");
        else
            return false;
    }
}

// Gravel
blockProps.addBlockProps(
    "minecraft:gravel",
    class extends SandLikeProperties {
        readonly #loots = new LootTable()
            .always(
                [ new LootPool().entry(
                    LootEntry.gravelLike(
                        new ItemStack("minecraft:gravel"),
                        new ItemStack("minecraft:flint")))
                ]);

        public breakingSoundId(): string {
            return "dig.gravel";
        }

        public override lootTable(): LootTable {
            return this.#loots;
        }
    });

// Sand
blockProps.addBlockProps(
    "minecraft:sand",
    class extends SandLikeProperties {
        public breakingSoundId(): string {
            return "dig.sand";
        }
    });

// Red Sand
blockProps.addBlockProps(
    "minecraft:red_sand",
    class extends SandLikeProperties {
        public breakingSoundId(): string {
            return "dig.sand";
        }
    });
