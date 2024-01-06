import { BlockPermutation, BlockStateValue } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";

// There seems to be no means to directly construct an ItemStack with state
// values. This is a hack to work around the limitation and only works for
// items that have corresponding blocks.
export function itemWithStates(typeId: string,
                               states: Record<string, BlockStateValue>,
                               amount?: number): ItemStack {
    const perm  = new BlockPermutation(typeId, states);
    const stack = perm.getItemStack(amount);
    if (stack)
        return stack;
    else
        throw new Error("No item stack is available for the given ID and states");
}
