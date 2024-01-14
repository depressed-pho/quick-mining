import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { DiscreteUniformDrops } from "./ores.js";

blockProps.addBlockProps(
    "minecraft:glowstone",
    class extends DiscreteUniformDrops(
        BlockProperties,
        new ItemStack("minecraft:glowstone"),
        2, 4, 4,
        new ItemStack("minecraft:glowstone_dust")) {

        public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
            if (prefs.coverage.enableMiningGlowstone)
                // This isn't really correct, as glowstone can be mined
                // with any tools (including bare hands). But should we
                // really allow players to initiate a quick mining of
                // glowstones with something like a sword?
                return tool.tags.has("minecraft:is_pickaxe");
            else
                return false;
        }

        public breakingSoundId(): string {
            return "random.glass";
        }
    });
