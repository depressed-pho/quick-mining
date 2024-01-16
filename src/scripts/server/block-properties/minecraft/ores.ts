import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { Constructor } from "cicada-lib/mixin.js";
import { BlockProperties, blockProps } from "../../block-properties.js";
import { LootTable, LootCondition, LootEntry, LootPool,
         randomIntInClosedInterval } from "../../loot-table.js";
import { PlayerPrefs } from "../../player-prefs.js";

/// Base class for all ore blocks.
abstract class OreBlockProperties extends BlockProperties {
    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        if (prefs.coverage.enableMiningOres)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }
}

/// Mixin for blocks that yield experience when mined with a non-silk-touch tool.
export function Experience<T extends Constructor<BlockProperties>>(base: T, min: number, max = min) {
    abstract class Experience extends base {
        public override experience(_perm: BlockPermutation, tool: ItemStack): number {
            if (tool.enchantments.has("silk_touch"))
                return 0;
            else
                return randomIntInClosedInterval(min, max);
        }
    }
    return Experience;
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
function StoneTier<T extends Constructor<OreBlockProperties>>(base: T) {
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
function IronTier<T extends Constructor<OreBlockProperties>>(base: T) {
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
function DiamondTier<T extends Constructor<OreBlockProperties>>(base: T) {
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

/// Mixin for blocks whose drops are affected multiplicatively by Fortune.
export function MultiplicativeDrops<T extends Constructor<BlockProperties>>(
    base: T, block: ItemStack, minRolls: number, maxRolls: number, drop: ItemStack) {

    const loots = new LootTable()
        .when(
            LootCondition.matchTool().enchantment("silk_touch"),
            [ new LootPool().entry(block) ]) // 100% drop
        .otherwise(
            [ new LootPool()
                .entry(
                    LootEntry
                        .item(drop)
                        .amount(minRolls, maxRolls)
                        .multiplicative())
            ]);

    abstract class MultiplicativeDrops extends base {
        public override lootTable(_perm: BlockPermutation): LootTable {
            return loots;
        }
    }
    return MultiplicativeDrops;
}

/// Mixin for blocks whose drops use discrete uniform distribution.
export function DiscreteUniformDrops<T extends Constructor<BlockProperties>>(
    base: T, block: ItemStack, minRolls: number, maxRolls: number,
    limit: number|undefined, drop: ItemStack) {

    const loots = new LootTable()
        .when(
            LootCondition.matchTool().enchantment("silk_touch"),
            [ new LootPool().entry(block) ]) // 100% drop
        .otherwise(
            [ new LootPool()
                .entry(
                    LootEntry
                        .item(drop)
                        .amount(minRolls, maxRolls)
                        .discreteUniform(limit))
            ]);

    abstract class DiscreteUniformDrops extends base {
        public override lootTable(_perm: BlockPermutation): LootTable {
            return loots;
        }
    }
    return DiscreteUniformDrops;
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
        StoneBased(Experience(OreBlockProperties, 0, 2)),
        new ItemStack("minecraft:coal_ore"),
        1, 1,
        new ItemStack("minecraft:coal")) {});

blockProps.addBlockProps(
    "minecraft:deepslate_coal_ore",
    class extends MultiplicativeDrops(
        DeepslateBased(Experience(OreBlockProperties, 0, 2)),
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
        IronTier(StoneBased(Experience(OreBlockProperties, 3, 7))),
        new ItemStack("minecraft:emerald_ore"),
        1, 1,
        new ItemStack("minecraft:emerald")) {});

blockProps.addBlockProps(
    "minecraft:deepslate_emerald_ore",
    class extends MultiplicativeDrops(
        IronTier(DeepslateBased(Experience(OreBlockProperties, 3, 7))),
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
        NetherrackBased(Experience(OreBlockProperties, 0, 1)),
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
        StoneTier(StoneBased(Experience(OreBlockProperties, 2, 5))),
        new ItemStack("minecraft:lapis_ore"),
        4, 9,
        new ItemStack("minecraft:lapis_lazuli")) {});

blockProps.addBlockProps(
    "minecraft:deepslate_lapis_ore",
    class extends MultiplicativeDrops(
        StoneTier(DeepslateBased(Experience(OreBlockProperties, 2, 5))),
        new ItemStack("minecraft:deepslate_lapis_ore"),
        4, 9,
        new ItemStack("minecraft:lapis_lazuli")) {});

// Nether quartz
blockProps.addBlockProps(
    "minecraft:quartz_ore",
    class extends MultiplicativeDrops(
        NetherrackBased(Experience(OreBlockProperties, 2, 5)),
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
                Lit(Experience(OreBlockProperties, 2, 5),
                    "minecraft:lit_redstone_ore", "minecraft:redstone_ore"))),
        new ItemStack("minecraft:redstone_ore"),
        4, 5, undefined,
        new ItemStack("minecraft:redstone")) {});

blockProps.addBlockProps(
    "minecraft:lit_redstone_ore",
    class extends DiscreteUniformDrops(
        IronTier(
            StoneBased(
                Lit(Experience(OreBlockProperties, 2, 5),
                    "minecraft:lit_redstone_ore", "minecraft:redstone_ore"))),
        new ItemStack("minecraft:redstone_ore"),
        4, 5, undefined,
        new ItemStack("minecraft:redstone")) {});

blockProps.addBlockProps(
    "minecraft:deepslate_redstone_ore",
    class extends DiscreteUniformDrops(
        IronTier(
            DeepslateBased(
                Lit(Experience(OreBlockProperties, 2, 3),
                    "minecraft:lit_deepslate_redstone_ore", "minecraft:deepslate_redstone_ore"))),
        new ItemStack("minecraft:deepslate_redstone_ore"),
        4, 5, undefined,
        new ItemStack("minecraft:redstone")) {});

blockProps.addBlockProps(
    "minecraft:lit_deepslate_redstone_ore",
    class extends DiscreteUniformDrops(
        IronTier(
            DeepslateBased(
                Lit(Experience(OreBlockProperties, 2, 3),
                    "minecraft:lit_deepslate_redstone_ore", "minecraft:deepslate_redstone_ore"))),
        new ItemStack("minecraft:deepslate_redstone_ore"),
        4, 5, undefined,
        new ItemStack("minecraft:redstone")) {});
