import { BlockPermutation } from "cicada-lib/block.js";
import { Constructor } from "cicada-lib/mixin.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { LootTable, LootCondition, LootEntry, LootPool } from "../../loot-table.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { DiscreteUniformDrops, IIsToolSuitable } from "../mixins.js";

/// Base class for all plants.
abstract class PlantProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, _tool: ItemStack, prefs: PlayerPrefs) {
        return prefs.coverage.enableMiningPlants;
    }
}

/// Mixin for plants requiring axes to quick-mine.
function MinedWithAxe<T extends Constructor<BlockProperties & IIsToolSuitable>>(base: T) {
    abstract class MinedWithAxe extends base {
        public breakingSoundId(): string {
            return "dig.wood";
        }

        public override isToolSuitable(perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
            if (tool.tags.has("minecraft:is_axe"))
                return super.isToolSuitable(perm, tool, prefs);
            else
                return false;
        }
    }
    return MinedWithAxe;
}

/// Mixin for plants requiring hoes to quick-mine. These plants don't
/// consume the tool durability.
function MinedWithHoe<T extends Constructor<BlockProperties & IIsToolSuitable>>(base: T) {
    abstract class MinedWithHoe extends base {
        public breakingSoundId(): string {
            return "dig.grass";
        }

        public override isToolSuitable(perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
            if (tool.tags.has("minecraft:is_hoe"))
                return super.isToolSuitable(perm, tool, prefs);
            else
                return false;
        }

        public override consumesDurability(): boolean {
            return false;
        }
    }
    return MinedWithHoe;
}

/// Mixin for plants requiring shears to quick-mine. They drop itself when mined.
function MinedWithShears<T extends Constructor<BlockProperties & IIsToolSuitable>>(base: T) {
    abstract class MinedWithShears extends base {
        public breakingSoundId(): string {
            return "dig.grass";
        }

        public override isToolSuitable(perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
            if (tool.typeId === "minecraft:shears")
                return super.isToolSuitable(perm, tool, prefs);
            else
                return false;
        }
    }
    return MinedWithShears;
}

/// Mixin for plants requiring either hoes or shears to quick-mine. These
/// plants don't consume the tool durability when mined with a hoe.
function MinedWithHoeOrShears<T extends Constructor<BlockProperties & IIsToolSuitable>>(base: T) {
    abstract class MinedWithHoeOrShears extends base {
        public breakingSoundId(): string {
            return "dig.grass";
        }

        public override isToolSuitable(perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
            if (tool.typeId === "minecraft:shears" ||
                tool.tags.has("minecraft:is_hoe"))
                return super.isToolSuitable(perm, tool, prefs);
            else
                return false;
        }

        public override consumesDurability(_perm: BlockPermutation, tool: ItemStack): boolean {
            if (tool.tags.has("minecraft:is_hoe"))
                return false;
            else
                return true;
        }
    }
    return MinedWithHoeOrShears;
}

/// Mixin for crops. Their seed drops use binomial distribution.
function Crop<T extends Constructor<BlockProperties & IIsToolSuitable>>(
    base: T, item: ItemStack, seed: ItemStack, extraPools?: LootPool[]) {

    const loots = new LootTable()
        .always(
            [ new LootPool().entry(item),
              new LootPool()
                .entry(
                    LootEntry
                        .item(seed)
                        .rolls(3)
                        .binomial(0.57)),
              ...(extraPools ?? [])
            ]);

    abstract class Crop extends base {
        public override isToolSuitable(perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs): boolean {
            if (perm.states.get("growth") === 7)
                // Fully grown.
                return super.isToolSuitable(perm, tool, prefs);
            else
                return false;
        }

        public override lootTable(): LootTable {
            return loots;
        }
    }
    return Crop;
}

/// Mixin for glow-lichen-like plants. Multiple of them can be placed in
/// the area of one block, and mining them causes all in the block to drop.
export function GlowLichenLike<T extends Constructor<BlockProperties>>(base: T, cond?: LootCondition) {
    abstract class GlowLichenLike extends base {
        public override lootTable(perm: BlockPermutation): LootTable {
            const bits   = Number(perm.states.get("multi_face_direction_bits") || 63);
            const amount =
                ((bits & 0x01) != 0 ? 1 : 0) +
                ((bits & 0x02) != 0 ? 1 : 0) +
                ((bits & 0x04) != 0 ? 1 : 0) +
                ((bits & 0x08) != 0 ? 1 : 0) +
                ((bits & 0x10) != 0 ? 1 : 0) +
                ((bits & 0x20) != 0 ? 1 : 0);

            const stack = perm.getItemStack(amount);
            if (stack)
                if (cond)
                    return new LootTable().when(cond, [new LootPool().entry(stack)]);
                else
                    return new LootTable().always([new LootPool().entry(stack)]);
            else
                return new LootTable(); // Drop nothing
        }

        public override isEquivalentTo(pa: BlockPermutation, pb: BlockPermutation): boolean {
            // Ignore the difference in direction bits.
            if (pa.typeId === pb.typeId) {
                for (const [key, value] of pa.states) {
                if (key === "multi_face_direction_bits")
                    continue;
                else if (pb.states.get(key) !== value)
                    return false;
                }
                return true;
            }
            else {
                return false;
            }
        }
    }
    return GlowLichenLike;
}

/// Mixin for vine-like plants. Multiple of them can be placed in
/// the area of one block, but mining them causes only one in the block to drop.
function VineLike<T extends Constructor<BlockProperties>>(base: T) {
    abstract class VineLike extends base {
        public override isEquivalentTo(pa: BlockPermutation, pb: BlockPermutation): boolean {
            // Ignore the difference in direction bits.
            if (pa.typeId === pb.typeId) {
                for (const [key, value] of pa.states) {
                if (key === "vine_direction_bits")
                    continue;
                else if (pb.states.get(key) !== value)
                    return false;
                }
                return true;
            }
            else {
                return false;
            }
        }
    }
    return VineLike;
}

// Melon
blockProps.addBlockProps(
    "minecraft:melon_block",
    class extends DiscreteUniformDrops(
        MinedWithAxe(PlantProperties),
        new ItemStack("minecraft:melon_block"),
        3, 7, 9,
        new ItemStack("minecraft:melon_slice")) {});

// Pumpkin
blockProps.addBlockProps(
    "minecraft:pumpkin",
    class extends MinedWithAxe(PlantProperties) {});

blockProps.addBlockProps(
    "minecraft:carved_pumpkin",
    class extends MinedWithAxe(PlantProperties) {});

blockProps.addBlockProps(
    "minecraft:lit_pumpkin",
    class extends MinedWithAxe(PlantProperties) {});

// Nether wart, not sure if it's a plant though.
blockProps.addBlockProps(
    "minecraft:nether_wart",
    class extends DiscreteUniformDrops(
        MinedWithHoe(PlantProperties),
        new ItemStack("minecraft:nether_wart"),
        2, 4, undefined,
        new ItemStack("minecraft:nether_wart")) {

        readonly #immatureLoots = new LootTable()
            .always(
                // Only one nether wart.
                [ new LootPool().entry(new ItemStack("minecraft:nether_wart"))
                ]);

        public override breakingSoundId(): string {
            return "dig.nether_wart";
        }

        public override lootTable(perm: BlockPermutation): LootTable {
            if ((perm.states.get("age") ?? 3) === 3)
                // Fully grown
                return super.lootTable(perm);
            else
                return this.#immatureLoots;
        }
    });

// Grass, fern, and snow fern.
// NOTE: Tall grass, fern, and flowers are impossible to quick-mine and
// collect loots because breaking their upper halves also breaks their lower-halves.
blockProps.addBlockProps(
    "minecraft:tallgrass",
    class extends MinedWithHoeOrShears(PlantProperties) {
        readonly #grassLoots = new LootTable()
            .when(
                LootCondition.matchTool().typeId("minecraft:shears"),
                [ new LootPool().entry(new ItemStack("minecraft:tallgrass", {tall_grass_type: 1})) ])
            .otherwise(
                [ new LootPool()
                    .entry(
                        LootEntry
                            .item(new ItemStack("minecraft:wheat_seeds"))
                            .grassLike())
                ]);

        readonly #fernLoots = new LootTable()
            .when(
                LootCondition.matchTool().typeId("minecraft:shears"),
                [ new LootPool().entry(new ItemStack("minecraft:tallgrass", {tall_grass_type: 2})) ])
            .otherwise(
                [ new LootPool()
                    .entry(
                        LootEntry
                            .item(new ItemStack("minecraft:wheat_seeds"))
                            .grassLike())
                ]);

        public override isEquivalentTo(pa: BlockPermutation, pb: BlockPermutation): boolean {
            // Ignore the difference in snow-logged ferns and regular ferns.
            if (pa.typeId === pb.typeId) {
                const typeA = pa.states.get("tall_grass_type") ?? "tall";
                const typeB = pb.states.get("tall_grass_type") ?? "tall";
                if (typeA === "fern" || typeA == "snow")
                    return typeB === "fern" || typeB === "snow"; // Fern or Snow-logged fern.
                else
                    return typeA === typeB;
            }
            return false;
        }

        public override lootTable(perm: BlockPermutation): LootTable {
            const grassType = perm.states.get("tall_grass_type");
            switch (grassType) {
                case "default":
                case "tall":
                    return this.#grassLoots;

                case "fern":
                case "snow":
                    return this.#fernLoots;

                case undefined:
                    return super.lootTable(perm);

                default:
                    throw new Error(`Unknown grass type: ${grassType}`);
            }
        }
    });

// Beetroot
blockProps.addBlockProps(
    "minecraft:beetroot",
    class extends Crop(
        MinedWithHoe(PlantProperties),
        new ItemStack("minecraft:beetroot"),
        new ItemStack("minecraft:beetroot_seeds")) {

        public override breakingSoundId(): string {
            return "dig.wood";
        }
    });

// Carrot
blockProps.addBlockProps(
    "minecraft:carrots",
    class extends Crop(
        MinedWithHoe(PlantProperties),
        new ItemStack("minecraft:carrot"),
        new ItemStack("minecraft:carrot")) {});

// Glow Lichen
blockProps.addBlockProps(
    "minecraft:glow_lichen",
    class extends GlowLichenLike(MinedWithShears(PlantProperties)) {});

// Potato
blockProps.addBlockProps(
    "minecraft:potatoes",
    class extends Crop(
        MinedWithHoe(PlantProperties),
        new ItemStack("minecraft:potato"),
        new ItemStack("minecraft:potato"),
        [ new LootPool()
            .condition(LootCondition.randomChance(0.02))
            .entry(new ItemStack("minecraft:poisonous_potato"))
        ]) {});

// Vines
blockProps.addBlockProps(
    "minecraft:vine",
    class extends VineLike(MinedWithShears(PlantProperties)) {
        public override breakingSoundId(): string {
            return "dig.roots";
        }
    });

// Wheat
blockProps.addBlockProps(
    "minecraft:wheat",
    class extends Crop(
        MinedWithHoe(PlantProperties),
        new ItemStack("minecraft:wheat"),
        new ItemStack("minecraft:wheat_seeds")) {});
