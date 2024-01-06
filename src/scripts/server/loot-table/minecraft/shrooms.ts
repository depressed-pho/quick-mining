import { ItemStack } from "cicada-lib/item/stack.js";
import { LootCondition, LootTable, LootPool, blockLoots
       } from "../../loot-table.js";
import { itemWithStates } from "./_utils.js";

function lootOfShrooms(blockId: string, item: ItemStack, isStem: boolean): LootTable {
    return new LootTable()
        .when(
            LootCondition.matchTool().enchantment("silk_touch"),
            [ new LootPool()
                .entry(
                    isStem
                        ? itemWithStates(blockId, { huge_mushroom_bits: 15 })
                        : itemWithStates(blockId, { huge_mushroom_bits: 14 }))
            ])
        .otherwise(
            [ new LootPool()
                // FIXME: This is most likely incorrect but we don't know
                // the exact formula. Someone please analyze the actual
                // code.
                .rolls(0, 2)
                .entry(item)
            ]);
}

const BROWN_MUSHROOM_STEM_LOOTS =
    lootOfShrooms(
        "minecraft:brown_mushroom_block",
        new ItemStack("minecraft:brown_mushroom"),
        true);

const BROWN_MUSHROOM_BLOCK_LOOTS =
    lootOfShrooms(
        "minecraft:brown_mushroom_block",
        new ItemStack("minecraft:brown_mushroom"),
        false);

const RED_MUSHROOM_STEM_LOOTS =
    lootOfShrooms(
        // This isn't an error. See
        // https://minecraft.fandom.com/wiki/Mushroom_Block
        "minecraft:brown_mushroom_block",
        new ItemStack("minecraft:red_mushroom"),
        true);

const RED_MUSHROOM_BLOCK_LOOTS =
    lootOfShrooms(
        "minecraft:red_mushroom_block",
        new ItemStack("minecraft:red_mushroom"),
        false);

for (let bits = 0; bits <= 15; bits++) {
    blockLoots.add(
        "minecraft:brown_mushroom_block",
        { huge_mushroom_bits: bits },
        bits == 10 || bits == 15
            ? BROWN_MUSHROOM_STEM_LOOTS
            : BROWN_MUSHROOM_BLOCK_LOOTS);

    blockLoots.add(
        "minecraft:red_mushroom_block",
        { huge_mushroom_bits: bits },
        bits == 10 || bits == 15
            ? RED_MUSHROOM_STEM_LOOTS
            : RED_MUSHROOM_BLOCK_LOOTS);
}
