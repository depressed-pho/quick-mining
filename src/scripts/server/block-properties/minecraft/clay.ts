import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { Constructor } from "cicada-lib/mixin.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { LootCondition, LootTable, LootPool } from "../../loot-table.js";
import { PlayerPrefs } from "../../player-prefs.js";

/// Base class for clay-like blocks.
abstract class ClayLikeProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.enableMiningClayLike)
            return tool.tags.has("minecraft:is_shovel");
        else
            return false;
    }
}

/// Mixin for snow-like blocks.
function SnowLike<T extends Constructor<BlockProperties>>(base: T) {
    abstract class SnowLike extends base {
        public breakingSoundId(): string {
            return "dig.snow";
        }

        public override isEquivalentTo(pa: BlockPermutation, pb: BlockPermutation): boolean {
            // Ignore the difference in snow layers and snow blocks. Also
            // ignore the height of snow layers. But we must leave
            // snow-logged plants alone (see below).
            if (pa.typeId === "minecraft:snow_layer" || pa.typeId === "minecraft:snow")
                if (pb.typeId === "minecraft:snow_layer" || pb.typeId === "minecraft:snow")
                    return !pa.states.get("covered_bit") && !pb.states.get("covered_bit");
            return false;
        }
    }
    return SnowLike;
}

// Clay
blockProps.addBlockProps(
    "minecraft:clay",
    class extends ClayLikeProperties {
        readonly #loots = new LootTable()
            .when(
                LootCondition.matchTool().enchantment("silk_touch"),
                [ new LootPool().entry(new ItemStack("minecraft:clay")) ])
            .otherwise(
                [ new LootPool().entry(new ItemStack("minecraft:clay_ball", 4)) ]);

        public breakingSoundId(): string {
            return "dig.gravel";
        }

        public override lootTable(): LootTable {
            return this.#loots;
        }
    });

// Mud
blockProps.addBlockProps(
    "minecraft:mud",
    class extends ClayLikeProperties {
        public breakingSoundId(): string {
            return "block.mud.break";
        }
    });

// Snow block
blockProps.addBlockProps(
    "minecraft:snow",
    class extends SnowLike(ClayLikeProperties) {
        readonly #loots = new LootTable()
            .when(
                LootCondition.matchTool().enchantment("silk_touch"),
                [ new LootPool().entry(new ItemStack("minecraft:snow")) ])
            .otherwise(
                [ new LootPool().entry(new ItemStack("minecraft:snowball", 4)) ]);

        public override lootTable(): LootTable {
            return this.#loots;
        }
    });

// Snow layer
blockProps.addBlockProps(
    "minecraft:snow_layer",
    class extends SnowLike(ClayLikeProperties) {
        public override isToolSuitable(perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
            // We must leave snow-logged plants alone because their plant
            // type is inaccessible from the scripting API atm. It seems to
            // be stored in NBT but there's no block components for
            // that. This means we cannot uncover plants without removing
            // them entirely.
            if (perm.states.get("covered_bit"))
                return false;
            else
                return super.isToolSuitable(perm, tool, prefs);
        }

        public override lootTable(perm: BlockPermutation): LootTable {
            const height = perm.states.get("height");
            switch (height) {
                case 0:
                case 1:
                case 2:
                    return new LootTable().always(
                        [ new LootPool().entry(new ItemStack("minecraft:snowball", 1)) ]);
                case 3:
                case 4:
                    return new LootTable().always(
                        [ new LootPool().entry(new ItemStack("minecraft:snowball", 2)) ]);
                case 5:
                case 6:
                    return new LootTable().always(
                        [ new LootPool().entry(new ItemStack("minecraft:snowball", 3)) ]);
                case 7:
                    return new LootTable().always(
                        [ new LootPool().entry(new ItemStack("minecraft:snowball", 4)) ]);
                default:
                    throw new Error(`Unknown height of snow layer: ${height}`);
            }
        }
    });
