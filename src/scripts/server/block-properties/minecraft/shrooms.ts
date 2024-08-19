import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, MiningWay, blockProps } from "../../block-properties.js";
import { LootCondition, LootEntry, LootTable, LootPool } from "../../loot-table.js";
import { PlayerPrefs } from "../../player-prefs.js";

const BROWN_MUSHROOM_STEM_LOOTS =
    lootOfShrooms(
        "minecraft:brown_mushroom_block",
        null,
        true);

const BROWN_MUSHROOM_BLOCK_LOOTS =
    lootOfShrooms(
        "minecraft:brown_mushroom_block",
        new ItemStack("minecraft:brown_mushroom"),
        false);

const RED_MUSHROOM_STEM_LOOTS =
    lootOfShrooms(
        // This isn't an error. See
        // https://minecraft.wiki/w/Mushroom_Block
        "minecraft:brown_mushroom_block",
        null,
        true);

const RED_MUSHROOM_BLOCK_LOOTS =
    lootOfShrooms(
        "minecraft:red_mushroom_block",
        new ItemStack("minecraft:red_mushroom"),
        false);

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

// A class factory for mushroom blocks.
function HugeMushroomProperties(stemLoots: LootTable, blockLoots: LootTable) {
    return class HugeMushroomProperties extends BlockProperties {
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
            const bits = perm.states.get("huge_mushroom_bits");
            switch (bits) {
                case 10:
                case 15:
                    return stemLoots;
                default:
                    return blockLoots;
            }
        }

        public override miningWay(origin: BlockPermutation, perm: BlockPermutation): MiningWay {
            // A special case for mining huge mushrooms. We must ignore
            // differences in block states.
            if (origin.typeId === perm.typeId)
                return MiningWay.MineRegularly;
            else
                return MiningWay.LeaveAlone;
        }
    };
}

blockProps.addBlockProps(
    "minecraft:brown_mushroom_block",
    HugeMushroomProperties(
        BROWN_MUSHROOM_STEM_LOOTS, BROWN_MUSHROOM_BLOCK_LOOTS));

blockProps.addBlockProps(
    "minecraft:red_mushroom_block",
    HugeMushroomProperties(
        RED_MUSHROOM_STEM_LOOTS, RED_MUSHROOM_BLOCK_LOOTS));
