import { BlockPermutation, BlockStateValue } from "cicada-lib/block.js";
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

// There seems to be no means to directly construct an ItemStack with state
// values. This is a hack to work around the limitation and only works for
// items that have corresponding blocks.
function itemWithStates(typeId: string,
                        states: Record<string, BlockStateValue>,
                        amount?: number): ItemStack {
    const perm  = new BlockPermutation(typeId, states);
    const stack = perm.getItemStack(amount);
    if (stack)
        return stack;
    else
        throw new Error("No item stack is available for the given ID and states");
}

// Jungle leaves
blockLoots.add(
    "minecraft:leaves", {old_leaf_type: "jungle"},
    lootOfLeaves(
        itemWithStates("minecraft:leaves", {old_leaf_type: "jungle"}),
        [ new LootPool()
            .condition(LootCondition.randomChance(1/40, 1/36, 1/32, 1/24, 1/10))
            .entry(itemWithStates("minecraft:sapling", {sapling_type: "jungle"}))
        ]));

// Non-flowering Azalea leaves
blockLoots.add(
    "minecraft:azalea_leaves",
    lootOfLeaves(
        new ItemStack("minecraft:azalea_leaves"),
        [ new LootPool()
            .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
            .entry(new ItemStack("minecraft:azalea"))
        ]));

// Flowering Azalea leaves
blockLoots.add(
    "minecraft:azalea_leaves_flowered",
    lootOfLeaves(
        new ItemStack("minecraft:azalea_leaves_flowered"),
        [ new LootPool()
            .condition(LootCondition.randomChance(1/20, 1/16, 1/12, 1/10))
            .entry(new ItemStack("minecraft:flowering_azalea"))
        ]));
