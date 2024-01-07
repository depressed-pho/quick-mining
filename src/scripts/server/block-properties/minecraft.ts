import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, MiningWay, blockProps } from "../block-properties.js";

const LEAF_BLOCK_IDS = new Set([
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

const MANGROVE_LOG_IDS = new Set([
    "minecraft:mangrove_log",
    "minecraft:stripped_mangrove_log",
    "minecraft:mangrove_wood",
    "minecraft:stripped_mangrove_wood",
]);

const HUGE_MUSHROOM_IDS = new Set([
    "minecraft:brown_mushroom_block",
    "minecraft:red_mushroom_block",
]);

const HUGE_FUNGI_ADJUNCT_IDS = new Set([
    "minecraft:nether_wart_block",
    "minecraft:warped_wart_block",
    "minecraft:shroomlight",
]);

class LogLikeBlockProperties extends BlockProperties {
    public readonly breakingSoundId: string = "dig.wood";

    public isToolSuitable(tool: ItemStack): boolean {
        return tool.tags.has("minecraft:is_axe");
    }

    public override miningWay(perm: BlockPermutation): MiningWay {
        // A special case for mining logs. It should also mine
        // non-persistent leaves as a bonus, without regard to their
        // types. We could be nicer by restricting leaf types but then
        // we lose our ability to automatically support custom trees
        // added by addons. But gee, leaves don't have block tags...
        if (LEAF_BLOCK_IDS.has(perm.typeId) && !perm.states.get("persistent_bit"))
            return MiningWay.MineAsABonus;

        // A special case for mining mangrove logs and roots. Mangrove
        // trees generate alongside mangrove roots and moss carpets. Their
        // leaves also produce hanging propagules when bonemeal is
        // applied. While roots and carpets don't really decay, they can
        // still be broken with a bare hand and drop themselves, so it
        // would be nice to bonus-mine them as well.
        if (this.typeId === "minecraft:mangrove_roots" ||
            MANGROVE_LOG_IDS.has(this.typeId)) {

            switch (perm.typeId) {
                case "minecraft:mangrove_roots":
                    return MiningWay.MineRegularly;
                case "minecraft:moss_carpet":
                    return MiningWay.MineAsABonus;
                case "minecraft:mangrove_propagule":
                    // FIXME: The wiki page
                    // (https://minecraft.fandom.com/wiki/Mangrove_Propagule)
                    // doesn't tell us the probability of age=4 hanging
                    // propagules dropping themselves. We cannot simulate
                    // their loot table at the moment, therefore we cannot
                    // bonus-mine them.
                    return MiningWay.LeaveAlone;
                default:
                    // Ignore differences in woodness or strippedness. This
                    // behaviour may be inconsistent with other logs but
                    // mangroves are already handled specially.
                    return MANGROVE_LOG_IDS.has(perm.typeId)
                        ? MiningWay.MineRegularly
                        : MiningWay.LeaveAlone;
            }
        }

        // We consider two wood-like blocks be equivalent as long as their
        // block states match, except we ignore their pillar axis. It would
        // be nicer to ignore their strippedness too, but then again we
        // cannot support custom trees.
        if (this.typeId === perm.typeId) {
            let matched = true;
            for (const [key, value] of this.permutation.states) {
                if (key === "pillar_axis") {
                    continue;
                }
                else if (perm.states.get(key) !== value) {
                    matched = false;
                    break;
                }
            }
            if (matched)
                return MiningWay.MineRegularly;
        }

        return MiningWay.LeaveAlone;
    }
}
blockProps.addTaggedProps("wood", LogLikeBlockProperties);
blockProps.addBlockProps(
    "minecraft:mangrove_roots",
    class extends LogLikeBlockProperties {
        public override readonly breakingSoundId = "block.mangrove_roots.break";
    });

class LeavesProperties extends BlockProperties {
    public readonly breakingSoundId: string = "dig.grass";

    public isToolSuitable(tool: ItemStack): boolean {
        // There is no tags for shears, which is unfortunate but is
        // understandable because the vanilla Minecraft has only one type of shears.
        return tool.typeId === "minecraft:shears" ||
               tool.tags.has("minecraft:is_hoe");
    }

    public override miningWay(perm: BlockPermutation): MiningWay {
        // A special case for mining leaves. Ignore the difference in
        // update_bit.
        if (this.typeId === perm.typeId) {
            let matched = true;
            for (const [key, value] of this.permutation.states) {
                if (key === "update_bit") {
                    continue;
                }
                else if (perm.states.get(key) !== value) {
                    matched = false;
                    break;
                }
            }
            if (matched)
                return MiningWay.MineRegularly;
        }

        // No puns intended.
        return MiningWay.LeaveAlone;
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

class HugeMushroomProperties extends BlockProperties {
    public readonly breakingSoundId = "dig.wood";

    public isToolSuitable(tool: ItemStack): boolean {
        return tool.tags.has("minecraft:is_axe");
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

abstract class HugeFungiAdjunctProperties extends BlockProperties {
    public isToolSuitable(tool: ItemStack): boolean {
        return tool.tags.has("minecraft:is_hoe");
    }

    public override miningWay(perm: BlockPermutation): MiningWay {
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
                    public readonly breakingSoundId = "dig.nether_wart";
                });
            break;
        case "minecraft:shroomlight":
            blockProps.addBlockProps(
                blockId,
                class extends HugeFungiAdjunctProperties {
                    public readonly breakingSoundId = "dig.shroomlight";
                });
    }
}
