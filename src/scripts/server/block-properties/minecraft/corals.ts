import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, MiningWay, blockProps } from "../../block-properties.js";
import { LootCondition, LootTable, LootPool } from "../../loot-table.js";
import { PlayerPrefs } from "../../player-prefs.js";
import { IgnoringAllStates, SilkTouchForDrop } from "../mixins.js";
import "cicada-lib/shims/set-union.js";

const CORAL_VARIANTS = ["tube", "brain", "bubble", "fire", "horn"];

const CORAL_IDS: Set<string> =
    new Set(CORAL_VARIANTS.map(variant => `minecraft:${variant}_coral`));

const DEAD_CORAL_IDS: Set<string> =
    new Set(CORAL_VARIANTS.map(variant => `minecraft:dead_${variant}_coral`));

const CORAL_FAN_IDS: Set<string> =
    new Set(CORAL_VARIANTS.map(variant => `minecraft:${variant}_coral_fan`));

const DEAD_CORAL_FAN_IDS: Set<string> =
    new Set(CORAL_VARIANTS.map(variant => `minecraft:dead_${variant}_coral_fan`));

const CORAL_BLOCK_IDS: Set<string> =
    new Set(CORAL_VARIANTS.map(variant => `minecraft:${variant}_coral_block`));

const DEAD_CORAL_BLOCK_IDS: Set<string> =
    new Set(CORAL_VARIANTS.map(variant => `minecraft:dead_${variant}_coral_block`));

const DEAD_CORAL_BLOCK_ID_FOR: Map<string, string> =
    new Map(
        CORAL_VARIANTS.map(variant =>
            [`minecraft:${variant}_coral_block`, `minecraft:dead_${variant}_coral_block`]));

/// Base class for non-block corals.
class CoralProperties extends SilkTouchForDrop(IgnoringAllStates(BlockProperties)) {
    public breakingSoundId(): string {
        return "dig.stone";
    }

    public override consumesDurability(): boolean {
        return false;
    }

    public override dependence(): number {
        return 2;
    }

    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        // Quick-mining can only be initiated with a silk-touch pick.
        if (prefs.coverage.corals)
            return tool.tags.has("minecraft:is_pickaxe") && tool.enchantments.has("silk_touch");
        else
            return false;
    }
}

/// Base class for Coral Blocks.
class CoralBlockProperties extends IgnoringAllStates(BlockProperties) {
    public breakingSoundId(): string {
        return "dig.stone";
    }

    public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs) {
        // Quick-mining can be initiated without a silk-touch as long as
        // it's a pickaxe, but doing so kills the coral.
        if (prefs.coverage.corals)
            return tool.tags.has("minecraft:is_pickaxe");
        else
            return false;
    }

    public override lootTable(perm: BlockPermutation): LootTable {
        if (CORAL_BLOCK_IDS.has(perm.typeId)) {
            // Mining live coral blocks without silk-touch pick drops dead
            // counterparts.
            const deadId = DEAD_CORAL_BLOCK_ID_FOR.get(perm.typeId);
            if (!deadId)
                throw new Error(`No dead counterpart was found for ${perm.typeId}`);

            return new LootTable()
                .when(
                    LootCondition.matchTool().enchantment("silk_touch"),
                    [ new LootPool().entry(new ItemStack(perm.typeId)) ])
                .otherwise(
                    [ new LootPool().entry(new ItemStack(deadId)) ]);
        }
        else {
            return super.lootTable(perm);
        }
    }

    readonly #bonusIDs =
        new Set(["minecraft:sea_pickle"])
            // @ts-ignore: TypeScript complains because Set.prototype.union
            // doesn't exist but we have a shim.
            .union(CORAL_IDS).union(DEAD_CORAL_IDS).union(CORAL_FAN_IDS).union(DEAD_CORAL_FAN_IDS);
    public override miningWay(origin: BlockPermutation, perm: BlockPermutation): MiningWay {
        if (this.isEquivalentTo(origin, perm)) {
            return MiningWay.MineRegularly;
        }
        else if (this.#bonusIDs.has(perm.typeId)) {
            // This is not ideal because the direction of the coral fan is
            // not taken into account. We don't know whether the coral
            // block this particular fan is attaching to is being mined or
            // not.
            return MiningWay.MineAsABonus;
        }
        else {
            return MiningWay.LeaveAlone;
        }
    }
}

// Coral (non-solid)
for (const id of CORAL_IDS)
    blockProps.addBlockProps(id, CoralProperties);

// Dead Coral (non-solid)
for (const id of DEAD_CORAL_IDS)
    blockProps.addBlockProps(id, CoralProperties);

// Coral Fan
for (const id of CORAL_FAN_IDS)
    blockProps.addBlockProps(id, CoralProperties);

// Dead Coral Fan
for (const id of DEAD_CORAL_FAN_IDS)
    blockProps.addBlockProps(id, CoralProperties);

// Coral Block
for (const id of CORAL_BLOCK_IDS) {
    blockProps.addBlockProps(id, CoralBlockProperties);
}

// Dead Coral Block
for (const id of DEAD_CORAL_BLOCK_IDS)
    blockProps.addBlockProps(id, CoralBlockProperties);
