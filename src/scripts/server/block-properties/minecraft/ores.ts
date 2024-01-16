import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { Constructor } from "cicada-lib/mixin.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { DiscreteUniformDrops, IIsToolSuitable,
         MultiplicativeDrops, YieldsExperience } from "../mixins.js";

/// Base class for all ore blocks.
abstract class OreBlockProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.enableMiningOres)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

/// Mixin for stone-based ore blocks.
function StoneBased<T extends Constructor<BlockProperties>>(base: T) {
    abstract class StoneBased extends base {
        public breakingSoundId(): string {
            return "dig.stone";
        }
    }
    return StoneBased;
}

/// Mixin for deepslate-based ore blocks.
function DeepslateBased<T extends Constructor<BlockProperties>>(base: T) {
    abstract class DeepslateBased extends base {
        public breakingSoundId(): string {
            return "dig.deepslate";
        }
    }
    return DeepslateBased;
}

/// Mixin for netherrack-based ore blocks.
function NetherrackBased<T extends Constructor<BlockProperties>>(base: T) {
    abstract class NetherrackBased extends base {
        public breakingSoundId(): string {
            return "dig.nether_gold_ore";
        }
    }
    return NetherrackBased;
}

/// Mixin for ore blocks requiring stone-tier pickaxes to mine.
function StoneTier<T extends Constructor<BlockProperties & IIsToolSuitable>>(base: T) {
    abstract class StoneTier extends base {
        public override isToolSuitable(perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
            if (tool.tags.has("minecraft:stone_tier"    ) ||
                tool.tags.has("minecraft:iron_tier"     ) ||
                tool.tags.has("minecraft:diamond_tier"  ) ||
                tool.tags.has("minecraft:netherite_tier"))
                return super.isToolSuitable(perm, tool, prefs);
            else
                return false;
        }
    }
    return StoneTier;
}

/// Mixin for ore blocks requiring iron-tier pickaxes to mine.
function IronTier<T extends Constructor<BlockProperties & IIsToolSuitable>>(base: T) {
    abstract class IronTier extends base {
        public override isToolSuitable(perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
            if (tool.tags.has("minecraft:iron_tier"     ) ||
                tool.tags.has("minecraft:diamond_tier"  ) ||
                tool.tags.has("minecraft:netherite_tier"))
                return super.isToolSuitable(perm, tool, prefs);
            else
                return false;
        }
    }
    return IronTier;
}

/// Mixin for ore blocks requiring diamond-tier pickaxes to mine.
function DiamondTier<T extends Constructor<BlockProperties & IIsToolSuitable>>(base: T) {
    abstract class DiamondTier extends base {
        public override isToolSuitable(perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
            if (tool.tags.has("minecraft:diamond_tier"  ) ||
                tool.tags.has("minecraft:netherite_tier"))
                return super.isToolSuitable(perm, tool, prefs);
            else
                return false;
        }
    }
    return DiamondTier;
}

/// Mixin for ore blocks that can be lit.
function Lit<T extends Constructor<BlockProperties>>(
    base: T, litBlockId: string, unlitBlockId: string) {

    abstract class Lit extends base {
        public override isEquivalentTo(pa: BlockPermutation, pb: BlockPermutation): boolean {
            if (pa.typeId === litBlockId || pa.typeId === unlitBlockId)
                return pb.typeId === litBlockId || pb.typeId === unlitBlockId;
            else
                return false;
        }
    }
    return Lit;
}

// Ancient Debris
blockProps.addBlockProps(
    "minecraft:ancient_debris",
    class extends DiamondTier(OreBlockProperties) {
        public breakingSoundId(): string {
            return "dig.ancient_debris";
        }
    });

// Coal
blockProps.addBlockProps(
    "minecraft:coal_ore",
    class extends MultiplicativeDrops(
        StoneBased(YieldsExperience(OreBlockProperties, 0, 2)),
        new ItemStack("minecraft:coal_ore"),
        1, 1,
        new ItemStack("minecraft:coal")) {});

blockProps.addBlockProps(
    "minecraft:deepslate_coal_ore",
    class extends MultiplicativeDrops(
        DeepslateBased(YieldsExperience(OreBlockProperties, 0, 2)),
        new ItemStack("minecraft:deepslate_coal_ore"),
        1, 1,
        new ItemStack("minecraft:coal")) {});

// Copper
blockProps.addBlockProps(
    "minecraft:copper_ore",
    class extends MultiplicativeDrops(
        StoneTier(StoneBased(OreBlockProperties)),
        new ItemStack("minecraft:copper_ore"),
        2, 5,
        new ItemStack("minecraft:raw_copper")) {});

blockProps.addBlockProps(
    "minecraft:deepslate_copper_ore",
    class extends MultiplicativeDrops(
        StoneTier(DeepslateBased(OreBlockProperties)),
        new ItemStack("minecraft:deepslate_copper_ore"),
        2, 5,
        new ItemStack("minecraft:raw_copper")) {});

// Diamond
blockProps.addBlockProps(
    "minecraft:diamond_ore",
    class extends MultiplicativeDrops(
        IronTier(StoneBased(OreBlockProperties)),
        new ItemStack("minecraft:diamond_ore"),
        1, 1,
        new ItemStack("minecraft:diamond")) {});

blockProps.addBlockProps(
    "minecraft:deepslate_diamond_ore",
    class extends MultiplicativeDrops(
        IronTier(DeepslateBased(OreBlockProperties)),
        new ItemStack("minecraft:deepslate_diamond_ore"),
        1, 1,
        new ItemStack("minecraft:diamond")) {});

// Emerald
blockProps.addBlockProps(
    "minecraft:emerald_ore",
    class extends MultiplicativeDrops(
        IronTier(StoneBased(YieldsExperience(OreBlockProperties, 3, 7))),
        new ItemStack("minecraft:emerald_ore"),
        1, 1,
        new ItemStack("minecraft:emerald")) {});

blockProps.addBlockProps(
    "minecraft:deepslate_emerald_ore",
    class extends MultiplicativeDrops(
        IronTier(DeepslateBased(YieldsExperience(OreBlockProperties, 3, 7))),
        new ItemStack("minecraft:deepslate_emerald_ore"),
        1, 1,
        new ItemStack("minecraft:emerald")) {});

// Gold
blockProps.addBlockProps(
    "minecraft:gold_ore",
    class extends MultiplicativeDrops(
        IronTier(StoneBased(OreBlockProperties)),
        new ItemStack("minecraft:gold_ore"),
        1, 1,
        new ItemStack("minecraft:raw_gold")) {});

blockProps.addBlockProps(
    "minecraft:deepslate_gold_ore",
    class extends MultiplicativeDrops(
        IronTier(DeepslateBased(OreBlockProperties)),
        new ItemStack("minecraft:deepslate_gold_ore"),
        1, 1,
        new ItemStack("minecraft:raw_gold")) {});

blockProps.addBlockProps(
    "minecraft:nether_gold_ore",
    class extends MultiplicativeDrops(
        NetherrackBased(YieldsExperience(OreBlockProperties, 0, 1)),
        new ItemStack("minecraft:nether_gold_ore"),
        2, 6,
        new ItemStack("minecraft:gold_nugget")) {});

// Iron
blockProps.addBlockProps(
    "minecraft:iron_ore",
    class extends MultiplicativeDrops(
        StoneTier(StoneBased(OreBlockProperties)),
        new ItemStack("minecraft:iron_ore"),
        1, 1,
        new ItemStack("minecraft:raw_iron")) {});

blockProps.addBlockProps(
    "minecraft:deepslate_iron_ore",
    class extends MultiplicativeDrops(
        StoneTier(DeepslateBased(OreBlockProperties)),
        new ItemStack("minecraft:deepslate_iron_ore"),
        1, 1,
        new ItemStack("minecraft:raw_iron")) {});

// Lapis Lazuli
blockProps.addBlockProps(
    "minecraft:lapis_ore",
    class extends MultiplicativeDrops(
        StoneTier(StoneBased(YieldsExperience(OreBlockProperties, 2, 5))),
        new ItemStack("minecraft:lapis_ore"),
        4, 9,
        new ItemStack("minecraft:lapis_lazuli")) {});

blockProps.addBlockProps(
    "minecraft:deepslate_lapis_ore",
    class extends MultiplicativeDrops(
        StoneTier(DeepslateBased(YieldsExperience(OreBlockProperties, 2, 5))),
        new ItemStack("minecraft:deepslate_lapis_ore"),
        4, 9,
        new ItemStack("minecraft:lapis_lazuli")) {});

// Nether quartz
blockProps.addBlockProps(
    "minecraft:quartz_ore",
    class extends MultiplicativeDrops(
        NetherrackBased(YieldsExperience(OreBlockProperties, 2, 5)),
        new ItemStack("minecraft:quartz_ore"),
        1, 1,
        new ItemStack("minecraft:quartz")) {});

// Redstone
// FIXME: The exact amount of experience is not known:
// https://minecraft.fandom.com/wiki/Redstone_Ore
blockProps.addBlockProps(
    "minecraft:redstone_ore",
    class extends DiscreteUniformDrops(
        IronTier(
            StoneBased(
                Lit(YieldsExperience(OreBlockProperties, 2, 5),
                    "minecraft:lit_redstone_ore", "minecraft:redstone_ore"))),
        new ItemStack("minecraft:redstone_ore"),
        4, 5, undefined,
        new ItemStack("minecraft:redstone")) {});

blockProps.addBlockProps(
    "minecraft:lit_redstone_ore",
    class extends DiscreteUniformDrops(
        IronTier(
            StoneBased(
                Lit(YieldsExperience(OreBlockProperties, 2, 5),
                    "minecraft:lit_redstone_ore", "minecraft:redstone_ore"))),
        new ItemStack("minecraft:redstone_ore"),
        4, 5, undefined,
        new ItemStack("minecraft:redstone")) {});

blockProps.addBlockProps(
    "minecraft:deepslate_redstone_ore",
    class extends DiscreteUniformDrops(
        IronTier(
            DeepslateBased(
                Lit(YieldsExperience(OreBlockProperties, 2, 3),
                    "minecraft:lit_deepslate_redstone_ore", "minecraft:deepslate_redstone_ore"))),
        new ItemStack("minecraft:deepslate_redstone_ore"),
        4, 5, undefined,
        new ItemStack("minecraft:redstone")) {});

blockProps.addBlockProps(
    "minecraft:lit_deepslate_redstone_ore",
    class extends DiscreteUniformDrops(
        IronTier(
            DeepslateBased(
                Lit(YieldsExperience(OreBlockProperties, 2, 3),
                    "minecraft:lit_deepslate_redstone_ore", "minecraft:deepslate_redstone_ore"))),
        new ItemStack("minecraft:deepslate_redstone_ore"),
        4, 5, undefined,
        new ItemStack("minecraft:redstone")) {});
