import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, MiningWay, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";

const HUGE_FUNGI_ADJUNCT_IDS = new Set([
    "minecraft:nether_wart_block",
    "minecraft:warped_wart_block",
    "minecraft:shroomlight",
]);

abstract class HugeFungiAdjunctProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs): boolean {
        if (prefs.coverage.wartBlocks)
            return tool.tags.has("minecraft:is_hoe");
        else
            return false;
    }

    public override miningWay(_origin: BlockPermutation, perm: BlockPermutation): MiningWay {
        // A special case for mining nether wart blocks and
        // shroomlights. It should also mine the other variants. Note that
        // we don't mine these blocks as a bonus for huge fungi stems,
        // because they don't decay like leaves.
        if (HUGE_FUNGI_ADJUNCT_IDS.has(perm.typeId))
            return MiningWay.MineRegularly;
        else
            return MiningWay.LeaveAlone;
    }
}
for (const blockId of HUGE_FUNGI_ADJUNCT_IDS) {
    switch (blockId) {
        case "minecraft:nether_wart_block":
        case "minecraft:warped_wart_block":
            blockProps.addBlockProps(
                blockId,
                class extends HugeFungiAdjunctProperties {
                    public breakingSoundId(): string {
                        return "dig.nether_wart";
                    }
                });
            break;
        case "minecraft:shroomlight":
            blockProps.addBlockProps(
                blockId,
                class extends HugeFungiAdjunctProperties {
                    public breakingSoundId(): string {
                        return "dig.shroomlight";
                    }
                });
    }
}
