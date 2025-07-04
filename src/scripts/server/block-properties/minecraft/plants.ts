import { BlockPermutation } from "cicada-lib/block.js";
import { Constructor } from "cicada-lib/mixin.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { LootTable, LootCondition, LootEntry, LootPool } from "../../loot-table.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { DiscreteUniformDrops, IIsToolSuitable, IgnoringAllStates, IgnoringState
       } from "../mixins.js";

/// Base class for all plants.
abstract class PlantProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, _tool: ItemStack, prefs: PlayerPrefs) {
        return prefs.coverage.plants;
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
/// consume the tool durability by default.
function MinedWithHoe<T extends Constructor<BlockProperties & IIsToolSuitable>>(base: T, consumesDurability = false) {
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
            return consumesDurability;
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

/// Mixin for plants that require supporting blocks.
function Dependent<T extends Constructor<BlockProperties>>(base: T) {
    abstract class Dependent extends base {
        public override dependence(): number {
            return 2;
        }
    }
    return Dependent;
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
    // Ignore the difference in direction bits.
    abstract class GlowLichenLike extends IgnoringState(base, "multi_face_direction_bits") {
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
    }
    return GlowLichenLike;
}

/// Mixin for vine-like plants. Multiple of them can be placed in
/// the area of one block, but mining them causes only one in the block to drop.
function VineLike<T extends Constructor<BlockProperties>>(base: T) {
    // Ignore the difference in direction bits.
    return IgnoringState(base, "vine_direction_bits");
}

/// Mixin for bush-like plants. They are insta-mined with shears.
function BushLike<T extends Constructor<BlockProperties>>(base: T) {
    class BushLike extends MinedWithShears(base) {
        public override consumesDurability(): boolean {
            return false;
        }
    }
    return BushLike;
}

// Cocoa Beans
blockProps.addBlockProps(
    "minecraft:cocoa",
    class extends IgnoringState(
        MinedWithAxe(PlantProperties), "direction") {

        public override dependence(): number {
            return 2;
        }

        readonly #immatureLoots = new LootTable()
            .always(
                // Only one bean.
                [ new LootPool().entry(new ItemStack("minecraft:cocoa_beans", 1))
                ]);

        readonly #matureLoots = new LootTable()
            .always(
                // Always 3 beans regardless of Fortune.
                [ new LootPool().entry(new ItemStack("minecraft:cocoa_beans", 3))
                ]);

        public override lootTable(perm: BlockPermutation): LootTable {
            if ((perm.states.get("age") ?? 2) === 2)
                return this.#matureLoots;
            else
                return this.#immatureLoots;
        }
    });

// Melon
blockProps.addBlockProps(
    "minecraft:melon_block",
    DiscreteUniformDrops(
        MinedWithAxe(PlantProperties),
        new ItemStack("minecraft:melon_block"),
        3, 7, 9,
        new ItemStack("minecraft:melon_slice")));

// Pumpkin
blockProps.addBlockProps(
    "minecraft:pumpkin",
    MinedWithAxe(PlantProperties));

blockProps.addBlockProps(
    "minecraft:carved_pumpkin",
    MinedWithAxe(PlantProperties));

blockProps.addBlockProps(
    "minecraft:lit_pumpkin",
    MinedWithAxe(PlantProperties));

// Hay bales
blockProps.addBlockProps(
    "minecraft:hay_block",
    IgnoringAllStates(MinedWithHoe(PlantProperties, true)));

// Nether wart, not sure if it's a plant though.
blockProps.addBlockProps(
    "minecraft:nether_wart",
    class extends DiscreteUniformDrops(
        MinedWithHoe(Dependent(PlantProperties)),
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

// Grass and fern.
// NOTE: Tall grass, tall ferns, and tall flowers are impossible to
// quick-mine and collect loots because breaking their upper halves also
// breaks their lower-halves.
blockProps.addBlockProps(
    "minecraft:tallgrass",
    class extends MinedWithHoeOrShears(Dependent(PlantProperties)) {
        readonly #grassLoots = new LootTable()
            .when(
                LootCondition.matchTool().typeId("minecraft:shears"),
                [ new LootPool().entry(
                    new ItemStack("minecraft:tallgrass", {tall_grass_type: "tall"})) ])
            .otherwise(
                [ new LootPool()
                    .entry(
                        LootEntry
                            .grassLike(new ItemStack("minecraft:wheat_seeds")))
                ]);

        readonly #fernLoots = new LootTable()
            .when(
                LootCondition.matchTool().typeId("minecraft:shears"),
                [ new LootPool().entry(
                    new ItemStack("minecraft:tallgrass", {tall_grass_type: "fern"})) ])
            .otherwise(
                [ new LootPool()
                    .entry(
                        LootEntry
                            .grassLike(new ItemStack("minecraft:wheat_seeds")))
                ]);

        // We would really like to ignore the difference in snow-loggedness
        // in grass and ferns, but snow-logged plants are represented very
        // differently from water-logged blocks. They are actually
        // "minecraft:snow_layer" with the "covered_bit" set, and the plant
        // type is seemingly stored in their NBT, so we can't tell which
        // snow layer is snow-logging what kind of plant.

        public override lootTable(perm: BlockPermutation): LootTable {
            const grassType = perm.states.get("tall_grass_type");
            switch (grassType) {
                case "default": // Unused
                case "tall":
                    return this.#grassLoots;

                case "fern":
                case "snow": // Unused?
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
        MinedWithHoe(Dependent(PlantProperties)),
        new ItemStack("minecraft:beetroot"),
        new ItemStack("minecraft:beetroot_seeds")) {

        public override breakingSoundId(): string {
            return "dig.wood";
        }
    });

// Bush and Firefly Bush
blockProps.addBlockProps(
    "minecraft:bush",
    class extends BushLike(Dependent(PlantProperties)) {
        public override breakingSoundId(): string {
            return "dig.grass";
        }
    });
blockProps.addBlockProps(
    "minecraft:firefly_bush",
    class extends BushLike(Dependent(PlantProperties)) {
        public override breakingSoundId(): string {
            return "block.sweet_berry_bush.break";
        }
    });

// Carrot
blockProps.addBlockProps(
    "minecraft:carrots",
    Crop(
        MinedWithHoe(Dependent(PlantProperties)),
        new ItemStack("minecraft:carrot"),
        new ItemStack("minecraft:carrot")));

// Glow Lichen
blockProps.addBlockProps(
    "minecraft:glow_lichen",
    GlowLichenLike(MinedWithShears(Dependent(PlantProperties))));

// Leaf Litter
blockProps.addBlockProps(
    "minecraft:leaf_litter",
    class extends IgnoringAllStates(BushLike(Dependent(PlantProperties))) {
        readonly #lootsFor =
            [1, 2, 3, 4].map(
                amount =>
                    new LootTable().always(
                        [ new LootPool().entry(new ItemStack("minecraft:leaf_litter", amount))
                        ]));

        public override breakingSoundId(): string {
            return "dig.grass";
        }

        public override lootTable(perm: BlockPermutation): LootTable {
            const growth = perm.states.get("growth")! as number;
            return this.#lootsFor[growth]!;
        }
    });

// Short and Tall Dry Grass
blockProps.addBlockProps(
    "minecraft:short_dry_grass",
    class extends BushLike(Dependent(PlantProperties)) {
        public override breakingSoundId(): string {
            return "dig.grass";
        }
    });
blockProps.addBlockProps(
    "minecraft:tall_dry_grass",
    class extends BushLike(Dependent(PlantProperties)) {
        public override breakingSoundId(): string {
            return "dig.grass";
        }
    });

// Potato
blockProps.addBlockProps(
    "minecraft:potatoes",
    Crop(
        MinedWithHoe(Dependent(PlantProperties)),
        new ItemStack("minecraft:potato"),
        new ItemStack("minecraft:potato"),
        [ new LootPool()
            .condition(LootCondition.randomChance(0.02))
            .entry(new ItemStack("minecraft:poisonous_potato"))
        ]));

// Sea Pickle
blockProps.addBlockProps(
    "minecraft:sea_pickle",
    class extends IgnoringAllStates(MinedWithShears(PlantProperties)) {
        readonly #lootsFor =
            [1, 2, 3, 4].map(
                amount =>
                    new LootTable().always(
                        [ new LootPool().entry(new ItemStack("minecraft:sea_pickle", amount))
                        ]));

        public override breakingSoundId(): string {
            return "hit.slime";
        }

        public override consumesDurability(): boolean {
            return false;
        }

        public override lootTable(perm: BlockPermutation): LootTable {
            // The count is 0-based.
            const count = perm.states.get("cluster_count") as number;
            return this.#lootsFor[count]!;
        }
    });

// Vines
blockProps.addBlockProps(
    "minecraft:vine",
    class extends VineLike(MinedWithShears(Dependent(PlantProperties))) {
        public override breakingSoundId(): string {
            return "dig.roots";
        }
    });

// Wheat
blockProps.addBlockProps(
    "minecraft:wheat",
    Crop(
        MinedWithHoe(Dependent(PlantProperties)),
        new ItemStack("minecraft:wheat"),
        new ItemStack("minecraft:wheat_seeds")));
