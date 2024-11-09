import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { DiamondTier, IronTier, StoneTier } from "../mixins.js";

/// Base class for all mineral blocks.
class MineralBlockProperties extends BlockProperties {
    public breakingSoundId(): string {
        return "dig.stone";
    }

    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.minerals)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

const COPPER_BLOCK_VARIANTS = new Set<string>([
    // Non-waxed
    "minecraft:copper_block",
    "minecraft:exposed_copper",
    "minecraft:weathered_copper",
    "minecraft:oxidized_copper",
    // Waxed
    "minecraft:waxed_copper",
    "minecraft:waxed_exposed_copper",
    "minecraft:waxed_weathered_copper",
    "minecraft:waxed_oxidized_copper",
]);

/// Base class for copper block variants
class CopperBlockProperties extends StoneTier(MineralBlockProperties) {
    public override isEquivalentTo(pa: BlockPermutation, pb: BlockPermutation): boolean {
        // Ignore variance in oxidisation levels and waxing.
        return COPPER_BLOCK_VARIANTS.has(pa.typeId) && COPPER_BLOCK_VARIANTS.has(pb.typeId);
    }
}

// Block of Coal
blockProps.addBlockProps("minecraft:coal_block", MineralBlockProperties);

// Block of Copper and its variants
for (const id of COPPER_BLOCK_VARIANTS) {
    blockProps.addBlockProps(id, CopperBlockProperties);
}

// Block of Diamond
blockProps.addBlockProps("minecraft:diamond_block", IronTier(MineralBlockProperties));

// Block of Emerald
blockProps.addBlockProps("minecraft:emerald_block", IronTier(MineralBlockProperties));

// Block of Gold
blockProps.addBlockProps("minecraft:gold_block", IronTier(MineralBlockProperties));

// Block of Iron
blockProps.addBlockProps("minecraft:iron_block", StoneTier(MineralBlockProperties));

// Block of Lapis Lazuli
blockProps.addBlockProps("minecraft:lapis_block", StoneTier(MineralBlockProperties));

// Block of Netherite
blockProps.addBlockProps("minecraft:netherite_block", DiamondTier(MineralBlockProperties));

// Block of Quartz
blockProps.addBlockProps("minecraft:quartz_block", MineralBlockProperties);

// Block of Redstone
blockProps.addBlockProps("minecraft:redstone_block", MineralBlockProperties);
