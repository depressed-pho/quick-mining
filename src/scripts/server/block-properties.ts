import { Block, BlockPermutation } from "cicada-lib/block.js";
import { Player } from "cicada-lib/player.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { LootTable, LootPool } from "./loot-table.js";
import { PlayerPrefs } from "./player-prefs.js";

export enum MiningWay {
    /// Don't mine this block.
    LeaveAlone,
    /// Mine the block in the normal way: the tool durability should be
    /// consumed.
    MineRegularly,
    /// Mine the block as a bonus: the tool durability should not be
    /// consumed.
    MineAsABonus,
}

/** A class describing the nature of a specific block type (as opposed to
 * block permutation). This is essentially a class of class but since
 * TypeScript doesn't support abstract static properties these classes are
 * implemented as singletons. See
 * https://github.com/microsoft/TypeScript/issues/34516
 */
export abstract class BlockProperties {
    /** The ID of the sound to be played when the block is broken.
     */
    public abstract breakingSoundId(perm: BlockPermutation): string;

    /** See if the block should be protected from getting mined.
     */
    public isProtected(_perm: BlockPermutation, _player: Player, _prefs: PlayerPrefs): boolean {
        return false;
    }

    /** Dependence level of the block.
     *
     * - Level 0 is a free-standing block that doesn't require any
     *   supporting blocks, such as cobblestone.
     * - Level 1 is a gravity-affected block, such as sand.
     * - Level 2 is a block that requires support from level <2 blocks,
     *   such as leaves.
     * - Level 3 is a block that requires support from level <3 blocks,
     *   such as mangrove propagules.
     */
    public dependence(_perm: BlockPermutation): number {
        return 0;
    }

    /** See if a quick mining should be initiated by mining the block using
     * a given tool.
     */
    public abstract isToolSuitable(perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs): boolean;

    /** Break a block. Most blocks turns into either `minecraft:air` or
     * `minecraft:water` depending on whether it is waterlogged, but there
     * are some special cases like ice.
     */
    public "break"(block: Block, _tool?: ItemStack): void {
        if (block.isWaterlogged)
            block.typeId = "minecraft:water";
        else
            block.typeId = "minecraft:air";
    }

    /** See if mining the block should consume durability of the tool.
     */
    public consumesDurability(_perm: BlockPermutation, _tool: ItemStack): boolean {
        return true;
    }

    /** See if two blocks should be considered equivalent. In most cases
     * this means `pa.equals(pb)`, which is the default implementation, but
     * some blocks (such as leaves) need to ignore certain block states
     * (e.g. `update_bit`).
     */
    public isEquivalentTo(pa: BlockPermutation, pb: BlockPermutation): boolean {
        return pa.equals(pb);
    }

    /** Get the amount of experience yielded by mining the block.
     */
    public experience(_perm: BlockPermutation, _tool: ItemStack): number {
        return 0;
    }

    /** Get the loot table for the block. The default implementation
     * returns a loot table dropping the block itself regardless of how
     * it's broken.
     */
    public lootTable(perm: BlockPermutation): LootTable {
        const stack = perm.getItemStack(1);
        if (stack)
            return new LootTable()
                .always([
                    new LootPool().entry(stack)
                ]);
        else
            // No corresponding items exist for this block. Drop nothing.
            return new LootTable();
    }

    /** Determine if or how `perm` should be quick-mined as a consequence
     * of initiating a quick mining at `origin`.
     */
    public miningWay(origin: BlockPermutation, perm: BlockPermutation, _prefs: PlayerPrefs): MiningWay {
        return this.isEquivalentTo(origin, perm)
            ? MiningWay.MineRegularly
            : MiningWay.LeaveAlone;
    }
}

class DefaultBlockProperties extends BlockProperties {
    public breakingSoundId(perm: BlockPermutation): string {
        throw new Error(`The block ${perm.typeId} isn't meant to be quick-mined`);
    }

    public isToolSuitable(): boolean {
        return false;
    }
}

const DEFAULT_BLOCK_PROPERTIES = new DefaultBlockProperties();

export class BlockPropertyRegistry {
    readonly #tags: Map<string, BlockProperties>;
    readonly #blocks: Map<string, BlockProperties>;
    readonly #cache: Map<string, BlockProperties>;

    private constructor() {
        this.#tags   = new Map();
        this.#blocks = new Map();
        this.#cache  = new Map();
    }

    public addTaggedProps(tag: string, propClass: new () => BlockProperties): this {
        if (this.#tags.has(tag))
            throw new Error(`Tagged properties redefined for tag ${tag}`);
        else
            this.#tags.set(tag, new propClass());
        return this;
    }

    public addBlockProps(blockId: string, propClass: new () => BlockProperties): this {
        if (this.#blocks.has(blockId))
            throw new Error(`Block properties redefined for block ID ${blockId}`);
        else
            this.#blocks.set(blockId, new propClass());
        return this;
    }

    /** This method takes `BlockPermutation` as opposed to `BlockType` only
     * because the latter does not have tags. It's not that the returned
     * `BlockProperties` will retain the permutation.
     */
    public "get"(block: Block|BlockPermutation): BlockProperties {
        let props = this.#cache.get(block.typeId);
        if (!props) {
            props = this.#getUncached(block);
            this.#cache.set(block.typeId, props);
        }
        return props;
    }

    #getUncached(block: Block|BlockPermutation): BlockProperties {
        // Block tags are always preferred over individual IDs.
        for (const tag of block.tags) {
            const props = this.#tags.get(tag);
            if (props)
                return props;
        }

        const props = this.#blocks.get(block.typeId);
        if (props)
            return props;

        // Having no specific block properties means that the block cannot
        // be quick-mined.
        return DEFAULT_BLOCK_PROPERTIES;
    }
}

// @ts-ignore: Intentionally calling a private constructor.
export const blockProps = new BlockPropertyRegistry();
