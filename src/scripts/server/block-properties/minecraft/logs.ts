import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, MiningWay, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { IgnoringState } from "../mixins.js";

const LEAF_BLOCK_IDS = new Set([
    "minecraft:oak_leaves",
    "minecraft:spruce_leaves",
    "minecraft:birch_leaves",
    "minecraft:jungle_leaves",
    "minecraft:acacia_leaves",
    "minecraft:dark_oak_leaves",
    "minecraft:mangrove_leaves",
    "minecraft:cherry_leaves",
    "minecraft:azalea_leaves",
    "minecraft:azalea_leaves_flowered",
]);

// We consider two wood-like blocks be equivalent as long as their block
// states match, except we ignore their pillar axis.
class LogLikeBlockProperties extends IgnoringState(BlockProperties, "pillar_axis") {
    public breakingSoundId(): string {
        return "dig.wood";
    }

    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs): boolean {
        if (prefs.coverage.logs)
            return tool.tags.has("minecraft:is_axe");
        else
            return false;
    }

    public override miningWay(origin: BlockPermutation, perm: BlockPermutation): MiningWay {
        // A special case for mining logs. It should also mine
        // non-persistent leaves as a bonus, without regard to their
        // types. We could be nicer by restricting leaf types but then
        // again, we cannot support custom trees. Gee, leaves don't have
        // block tags...
        if (LEAF_BLOCK_IDS.has(perm.typeId) && !perm.states.get("persistent_bit"))
            return MiningWay.MineAsABonus;

        // A special case for mining mangrove logs and roots. Mangrove
        // trees generate alongside mangrove roots and moss carpets. Their
        // leaves also produce hanging propagules when bonemeal is
        // applied. While roots and carpets don't really decay, they can
        // still be broken with a bare hand and drop themselves, so it
        // would be nice to bonus-mine them as well.
        if (origin.typeId === "minecraft:mangrove_log" || origin.typeId === "minecraft:mangrove_roots") {
            switch (perm.typeId) {
                case "minecraft:mangrove_log":
                    return MiningWay.MineRegularly;
                case "minecraft:mangrove_roots":
                    return MiningWay.MineRegularly;
                case "minecraft:mangrove_propagule":
                    // FIXME: The wiki page
                    // (https://minecraft.fandom.com/wiki/Mangrove_Propagule)
                    // doesn't tell us the probability of age=4 hanging
                    // propagules dropping themselves. We cannot simulate
                    // their loot table at the moment, therefore we cannot
                    // bonus-mine them.
                    return MiningWay.LeaveAlone;
                case "minecraft:moss_carpet":
                    return MiningWay.MineAsABonus;
                default:
                    return MiningWay.LeaveAlone;
            }
        }

        return super.miningWay(origin, perm);
    }
}

blockProps.addTaggedProps("log", LogLikeBlockProperties);

// These logs don't have the "log" tag. Weird.
blockProps.addBlockProps("minecraft:cherry_log", LogLikeBlockProperties);
blockProps.addBlockProps("minecraft:mangrove_log", LogLikeBlockProperties);
blockProps.addBlockProps("minecraft:crimson_stem", LogLikeBlockProperties);
blockProps.addBlockProps("minecraft:warped_stem", LogLikeBlockProperties);

blockProps.addBlockProps(
    "minecraft:mangrove_roots",
    class extends LogLikeBlockProperties {
        public override breakingSoundId(): string {
            return "block.mangrove_roots.break";
        }
    });
