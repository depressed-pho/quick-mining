import { ItemStack } from "cicada-lib/item/stack.js";
import { LootCondition, LootTable, LootPool, blockLoots
       } from "../../loot-table.js";

function lootOfLeaves(leafBlock: ItemStack, extraPools: LootPool[]): LootTable {
    return new LootTable()
        .when(
            LootCondition.or([
                LootCondition.matchTool().typeId("minecraft:shears"),
                LootCondition.matchTool().enchantment("silk_touch")
            ]),
            [ new LootPool().entry(leafBlock) ]) // 100% drop

        .otherwise(
            [ new LootPool()
                .rolls(1, 2)
                .condition(LootCondition.randomChance(1/50, 1/45, 1/40, 1/30))
                .entry(new ItemStack("minecraft:stick")),
              ...extraPools
            ]);
}

// Oak leaves; they can drop apples.
blockLoots.add(
    "minecraft:leaves", {old_leaf_type: "oak"},
    lootOfLeaves(
        new ItemStack("minecraft:leaves", {old_leaf_type: "oak"}),
        [ new LootPool()
            .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
            .entry(new ItemStack("minecraft:sapling", {sapling_type: "oak"})),
          new LootPool()
            .condition(LootCondition.randomChance(1/200, 1/180, 1/160, 1/120, 1/40))
            .entry(new ItemStack("minecraft:apple"))
        ]));

// Spruce leaves
blockLoots.add(
    "minecraft:leaves", {old_leaf_type: "spruce"},
    lootOfLeaves(
        new ItemStack("minecraft:leaves", {old_leaf_type: "spruce"}),
        [ new LootPool()
            .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
            .entry(new ItemStack("minecraft:sapling", {sapling_type: "spruce"}))
        ]));

// Birch leaves
blockLoots.add(
    "minecraft:leaves", {old_leaf_type: "birch"},
    lootOfLeaves(
        new ItemStack("minecraft:leaves", {old_leaf_type: "birch"}),
        [ new LootPool()
            .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
            .entry(new ItemStack("minecraft:sapling", {sapling_type: "birch"}))
        ]));

// Jungle leaves; they have a much lower chance of dropping sapplings.
blockLoots.add(
    "minecraft:leaves", {old_leaf_type: "jungle"},
    lootOfLeaves(
        new ItemStack("minecraft:leaves", {old_leaf_type: "jungle"}),
        [ new LootPool()
            .condition(LootCondition.randomChance(1/40, 1/36, 1/32, 1/24, 1/10))
            .entry(new ItemStack("minecraft:sapling", {sapling_type: "jungle"}))
        ]));

// Acacia leaves
blockLoots.add(
    "minecraft:leaves2", {new_leaf_type: "acacia"},
    lootOfLeaves(
        new ItemStack("minecraft:leaves2", {new_leaf_type: "acacia"}),
        [ new LootPool()
            .condition(LootCondition.randomChance(1/40, 1/36, 1/32, 1/24, 1/10))
            .entry(new ItemStack("minecraft:sapling", {sapling_type: "acacia"}))
        ]));

// Dark oak leaves; they can drop apples.
blockLoots.add(
    "minecraft:leaves2", {new_leaf_type: "dark_oak"},
    lootOfLeaves(
        new ItemStack("minecraft:leaves2", {new_leaf_type: "dark_oak"}),
        [ new LootPool()
            .condition(LootCondition.randomChance(1/40, 1/36, 1/32, 1/24, 1/10))
            .entry(new ItemStack("minecraft:sapling", {sapling_type: "dark_oak"})),
          new LootPool()
            .condition(LootCondition.randomChance(1/200, 1/180, 1/160, 1/120, 1/40))
            .entry(new ItemStack("minecraft:apple"))
        ]));

// Mangrove leaves; they don't drop saplings.
blockLoots.add(
    "minecraft:mangrove_leaves",
    lootOfLeaves(
        new ItemStack("minecraft:mangrove_leaves"), []));

// Cerry leaves
blockLoots.add(
    "minecraft:cherry_leaves",
    lootOfLeaves(
        new ItemStack("minecraft:cherry_leaves"),
        [ new LootPool()
            .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
            .entry(new ItemStack("minecraft:cherry_sapling"))
        ]));

// Azalea leaves
blockLoots.add(
    "minecraft:azalea_leaves",
    lootOfLeaves(
        new ItemStack("minecraft:azalea_leaves"),
        [ new LootPool()
            .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
            .entry(new ItemStack("minecraft:azalea"))
        ]));
blockLoots.add(
    "minecraft:azalea_leaves_flowered",
    lootOfLeaves(
        new ItemStack("minecraft:azalea_leaves_flowered"),
        [ new LootPool()
            .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
            .entry(new ItemStack("minecraft:flowering_azalea"))
        ]));