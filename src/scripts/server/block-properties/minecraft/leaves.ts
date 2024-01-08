import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, MiningWay, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";

export const LEAF_BLOCK_IDS = new Set([
    "minecraft:leaves",
    "minecraft:leaves2",
    "minecraft:mangrove_leaves",
    "minecraft:cherry_leaves",
    "minecraft:azalea_leaves",
    "minecraft:azalea_leaves_flowered",
]);

const AZALEA_LEAVES_IDS = new Set([
    "minecraft:azalea_leaves",
    "minecraft:azalea_leaves_flowered",
]);

class LeavesProperties extends BlockProperties {
    public readonly breakingSoundId: string = "dig.grass";

    public isToolSuitable(tool: ItemStack, prefs: PlayerPrefs): boolean {
        if (prefs.coverage.enableMiningLeaves)
            // There is no tags for shears, which is unfortunate but is
            // understandable because the vanilla Minecraft has only one type of shears.
            return tool.typeId === "minecraft:shears" ||
                   tool.tags.has("minecraft:is_hoe");
        else
            return false;
    }

    public override isEquivalentTo(perm: BlockPermutation): boolean {
        // A special case for mining leaves. Ignore the difference in
        // update_bit.
        if (this.typeId === perm.typeId) {
            for (const [key, value] of this.permutation.states) {
                if (key === "update_bit")
                    continue;
                else if (perm.states.get(key) !== value)
                    return false;
            }
            return true;
        }
        else {
            return false;
        }
    }
}
for (const blockId of LEAF_BLOCK_IDS) {
    if (AZALEA_LEAVES_IDS.has(blockId))
        blockProps.addBlockProps(
            blockId,
            class extends LeavesProperties {
                public override readonly breakingSoundId = "dig.azalea_leaves";

                public override miningWay(perm: BlockPermutation): MiningWay {
                    // A special case for mining azalea leaves (flowering
                    // or not). It should also mine the other variant as
                    // long as they have an identical persistence state.
                    if (AZALEA_LEAVES_IDS.has(perm.typeId))
                        if (this.permutation.states.get("persistent_bit")
                            === perm.states.get("persistent_bit"))
                            return MiningWay.MineRegularly;

                    return super.miningWay(perm);
                }
            });
    else if (blockId === "minecraft:cherry_leaves")
        blockProps.addBlockProps(
            blockId,
            class extends LeavesProperties {
                public override readonly breakingSoundId = "break.cherry_leaves";
            });
    else
        blockProps.addBlockProps(blockId, LeavesProperties);
}
