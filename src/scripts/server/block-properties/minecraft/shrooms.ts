import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, MiningWay, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";

const HUGE_MUSHROOM_IDS = new Set([
    "minecraft:brown_mushroom_block",
    "minecraft:red_mushroom_block",
]);

class HugeMushroomProperties extends BlockProperties {
    public readonly breakingSoundId = "dig.wood";

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
}
for (const blockId of HUGE_MUSHROOM_IDS)
    blockProps.addBlockProps(blockId, HugeMushroomProperties);
