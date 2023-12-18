import { BlockPermutation, BlockStateValue } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { LootCondition, LootTable, LootPool, blockLoots
       } from "../../loot-table.js";

const silkTouchLike =
    LootCondition.or([
        LootCondition.matchTool()
            .typeId("minecraft:shears"),
        LootCondition.matchTool()
            .enchantment("silk_touch")
    ]);

function baseTable(stack: ItemStack): LootTable {
    return new LootTable()
        .add(
            new LootPool()
                .condition(silkTouchLike)
                .entry(stack))
        .add(
            new LootPool()
                .rolls(1, 2)
                .condition(
                    LootCondition.and([
                        LootCondition.not(silkTouchLike),
                        LootCondition.randomChance(1/50, 1/45, 1/40, 1/30)
                    ]))
                .entry(new ItemStack("minecraft:stick")));
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

blockLoots.add(
    "minecraft:leaves", {old_leaf_type: "jungle"},
    baseTable(itemWithStates("minecraft:leaves", {old_leaf_type: "jungle"}))
        .add(
            new LootPool()
                .condition(
                    LootCondition.and([
                        LootCondition.not(silkTouchLike),
                        LootCondition.randomChance(1/40, 1/36, 1/32, 1/24, 1/10)
                    ]))
                .entry(itemWithStates("minecraft:sapling", {sapling_type: "jungle"}))));
