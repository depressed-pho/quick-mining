import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, MiningWay, blockProps } from "../../block-properties.js";
import { LootCondition, LootTable, LootPool } from "../../loot-table.js";
import { PlayerPrefs } from "../../player-prefs.js";

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

function lootOfShrooms(blockId: string, item: ItemStack, isStem: boolean): LootTable {
    return new LootTable()
        .when(
            LootCondition.matchTool().enchantment("silk_touch"),
            [ new LootPool()
                .entry(
                    new ItemStack(blockId, { huge_mushroom_bits: isStem ? 15 : 14 }))
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

// A class factory for mushroom blocks.
function HugeMushroomProperties(stemLoots: LootTable, blockLoots: LootTable) {
    return class HugeMushroomProperties extends BlockProperties {
        public readonly breakingSoundId = "dig.wood";

        public override get lootTable(): LootTable {
            const bits = this.permutation.states.get("huge_mushroom_bits");
            switch (bits) {
                case 10:
                case 15:
                    return stemLoots;
                default:
                    return blockLoots;
            }
        }

        public isToolSuitable(tool: ItemStack, prefs: PlayerPrefs): boolean {
            if (prefs.coverage.enableMiningMushrooms)
                return tool.tags.has("minecraft:is_axe");
            else
                return false;
        }

        public override miningWay(perm: BlockPermutation): MiningWay {
            // A special case for mining huge mushrooms. We must ignore
            // differences in block states.
            if (perm.typeId === this.typeId)
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
