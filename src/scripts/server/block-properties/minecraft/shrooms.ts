import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { LootCondition, LootEntry, LootTable, LootPool } from "../../loot-table.js";
import { PlayerPrefs } from "../../player-prefs.js";

const MUSHROOM_VARIANTS: Map<string, LootTable> = new Map(Object.entries({
    "minecraft:mushroom_stem": lootOfShrooms(
        "minecraft:mushroom_stem",
        null,
        true),
    "minecraft:brown_mushroom_block": lootOfShrooms(
        "minecraft:brown_mushroom_block",
        new ItemStack("minecraft:brown_mushroom"),
        false),
    "minecraft:red_mushroom_block": lootOfShrooms(
        "minecraft:red_mushroom_block",
        new ItemStack("minecraft:red_mushroom"),
        false)
}));

function lootOfShrooms(blockId: string, item: ItemStack|null, isStem: boolean): LootTable {
    return new LootTable()
        .when(
            LootCondition.matchTool().enchantment("silk_touch"),
            [ new LootPool()
                .entry(
                    new ItemStack(blockId, { huge_mushroom_bits: isStem ? 15 : 14 }))
            ])
        .otherwise(
            item ? [ new LootPool().entry(LootEntry.shroomLike(item)) ] : []);
}

class HugeMushroomProperties extends BlockProperties {
    public breakingSoundId(): string {
        return "dig.wood";
    }

    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs): boolean {
        if (prefs.coverage.mushrooms)
            return tool.tags.has("minecraft:is_axe");
        else
            return false;
    }

    public override lootTable(perm: BlockPermutation): LootTable {
        const loots = MUSHROOM_VARIANTS.get(perm.typeId);
        if (loots)
            return loots;
        else
            throw new Error(`Internal error: ${perm.typeId} is not known to be a mushroom-like block`);
    }

    public override isEquivalentTo(pa: BlockPermutation, pb: BlockPermutation): boolean {
        // A special case for mining huge mushrooms. We must ignore
        // differences in block states, and we also ignore differences in
        // caps and stems. This means we have no choice but to consider
        // brown caps and red caps as equivalent, because we want to chop
        // down the entire mushroom by mining its stem.
        return MUSHROOM_VARIANTS.has(pa.typeId) && MUSHROOM_VARIANTS.has(pb.typeId);
    }
}

for (const id of MUSHROOM_VARIANTS.keys()) {
    blockProps.addBlockProps(id, HugeMushroomProperties);
}
