import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { Constructor } from "cicada-lib/mixin.js";
import { BlockProperties } from "../block-properties.js";
import { LootTable, LootCondition, LootEntry, LootPool,
         randomIntInClosedInterval } from "../loot-table.js";
import { PlayerPrefs } from "../player-prefs.js";

/// Mixin for blocks requiring a silk-touch tool to quick-mine.
export function SilkTouchForQuickMining<T extends Constructor<BlockProperties & IIsToolSuitable>>(base: T) {
    abstract class SilkTouchForQuickMining extends base {
        public override isToolSuitable(perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
            if (tool.enchantments.has("silk_touch"))
                return super.isToolSuitable(perm, tool, prefs);
            else
                return false;
        }
    }
    return SilkTouchForQuickMining;
}

/** Interface for objects that has a concrete implementation of {@link
 * BlockProperties.prototype.isToolSuitable}.
 */
export interface IIsToolSuitable {
    isToolSuitable(perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs): boolean;
}

/// Mixin for blocks requiring a silk-touch tool to drop itself.
export function SilkTouchForDrop<T extends Constructor<BlockProperties>>(base: T) {
    abstract class SilkTouchForDrop extends base {
        public override lootTable(perm: BlockPermutation): LootTable {
            const stack = perm.getItemStack(1);
            if (stack)
                return new LootTable()
                    .when(
                        LootCondition.matchTool().enchantment("silk_touch"),
                        [ new LootPool().entry(stack) ]); // 100% drop
            else
                // No corresponding items exist for this block. Drop nothing.
                return new LootTable();
        }
    }
    return SilkTouchForDrop;
}

/** Combination of `SilkTouchForQuickMining` and `SilkTouchForDrop`. */
export function SilkTouchRequired<T extends Constructor<BlockProperties & IIsToolSuitable>>(base: T) {
    return SilkTouchForQuickMining(SilkTouchForDrop(base));
}

/// Mixin for blocks that yield experience when mined with a non-silk-touch tool.
export function YieldsExperience<T extends Constructor<BlockProperties>>(base: T, min: number, max = min) {
    abstract class YieldsExperience extends base {
        public override experience(_perm: BlockPermutation, tool: ItemStack): number {
            if (tool.enchantments.has("silk_touch"))
                return 0;
            else
                return randomIntInClosedInterval(min, max);
        }
    }
    return YieldsExperience;
}

/// Mixin for blocks whose drops are affected multiplicatively by Fortune.
export function MultiplicativeDrops<T extends Constructor<BlockProperties>>(
    base: T, block: ItemStack, minRolls: number, maxRolls: number, drop: ItemStack) {

    const loots = new LootTable()
        .when(
            LootCondition.matchTool().enchantment("silk_touch"),
            [ new LootPool().entry(block) ]) // 100% drop
        .otherwise(
            [ new LootPool()
                .entry(
                    LootEntry
                        .item(drop)
                        .amount(minRolls, maxRolls)
                        .multiplicative())
            ]);

    abstract class MultiplicativeDrops extends base {
        public override lootTable(_perm: BlockPermutation): LootTable {
            return loots;
        }
    }
    return MultiplicativeDrops;
}

/// Mixin for blocks whose drops use discrete uniform distribution.
export function DiscreteUniformDrops<T extends Constructor<BlockProperties>>(
    base: T, block: ItemStack, minRolls: number, maxRolls: number,
    limit: number|undefined, drop: ItemStack) {

    const loots = new LootTable()
        .when(
            LootCondition.matchTool().enchantment("silk_touch"),
            [ new LootPool().entry(block) ]) // 100% drop
        .otherwise(
            [ new LootPool()
                .entry(
                    LootEntry
                        .item(drop)
                        .amount(minRolls, maxRolls)
                        .discreteUniform(limit))
            ]);

    abstract class DiscreteUniformDrops extends base {
        public override lootTable(_perm: BlockPermutation): LootTable {
            return loots;
        }
    }
    return DiscreteUniformDrops;
}
