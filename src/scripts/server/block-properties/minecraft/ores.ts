import { ItemStack } from "cicada-lib/item/stack.js";
import { Constructor } from "cicada-lib/mixin.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";

/// Base class for all ore blocks.
abstract class OreBlockProperties extends BlockProperties {
    public isToolSuitable(tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.enableMiningOres)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

/// Mixin for stone-based ore blocks.
function StoneBased<T extends Constructor<OreBlockProperties>>(base: T) {
    abstract class StoneBased extends base {
        public readonly breakingSoundId = "dig.stone";
    }
    return StoneBased;
}

/// Mixin for deepslate-based ore blocks.
function DeepslateBased<T extends Constructor<OreBlockProperties>>(base: T) {
    abstract class DeepslateBased extends base {
        public readonly breakingSoundId = "dig.deepslate";
    }
    return DeepslateBased;
}

blockProps.addBlockProps(
    "minecraft:coal_ore",
    class extends StoneBased(OreBlockProperties) {});

blockProps.addBlockProps(
    "minecraft:deepslate_coal_ore",
    class extends DeepslateBased(OreBlockProperties) {});
