import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, MiningWay, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";

const LEAF_BLOCK_IDS = new Set([
    "minecraft:leaves",
    "minecraft:leaves2",
    "minecraft:mangrove_leaves",
    "minecraft:cherry_leaves",
    "minecraft:azalea_leaves",
    "minecraft:azalea_leaves_flowered",
]);

const MANGROVE_LOG_IDS = new Set([
    "minecraft:mangrove_log",
    "minecraft:stripped_mangrove_log",
    "minecraft:mangrove_wood",
    "minecraft:stripped_mangrove_wood",
]);

class LogLikeBlockProperties extends BlockProperties {
    public breakingSoundId(): string {
        return "dig.wood";
    }

    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs): boolean {
        if (prefs.coverage.enableMiningLogs)
            return tool.tags.has("minecraft:is_axe");
        else
            return false;
    }

    public override isEquivalentTo(pa: BlockPermutation, pb: BlockPermutation): boolean {
        // We consider two wood-like blocks be equivalent as long as their
        // block states match, except we ignore their pillar axis. It would
        // be nicer to ignore their strippedness too, but then we lose our
        // ability to automatically support custom trees added by addons.
        if (pa.typeId === pb.typeId) {
            for (const [key, value] of pa.states) {
                if (key === "pillar_axis")
                    continue;
                else if (pb.states.get(key) !== value)
                    return false;
            }
            return true;
        }
        else {
            return false;
        }
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
        if (origin.typeId === "minecraft:mangrove_roots" ||
            MANGROVE_LOG_IDS.has(origin.typeId)) {

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

        return super.miningWay(origin, perm);
    }
}
blockProps.addTaggedProps("wood", LogLikeBlockProperties);
blockProps.addBlockProps(
    "minecraft:mangrove_roots",
    class extends LogLikeBlockProperties {
        public override breakingSoundId(): string {
            return "block.mangrove_roots.break";
        }
    });
