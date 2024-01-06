import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";

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

export abstract class BlockProperties {
    public readonly origPerm: BlockPermutation;

    public constructor(perm: BlockPermutation) {
        this.origPerm = perm;
    }

    /** The ID of the sound to be played when breaking this block.
     */
    public abstract readonly breakingSoundId: string;

    /** See if a quick mining should be initiated by mining the block using
     * a given tool.
     */
    public abstract isToolSuitable(tool: ItemStack): boolean;

    /** Determine if or how a given block should be quick-mined as a
     * consequence of mining the block that initiated a quick mining.
     */
    public miningWay(perm: BlockPermutation): MiningWay {
        // Most blocks are considered equivalent if their block types and
        // block states match. We cannot ignore their states because some
        // blocks (such as leaves) share the same block IDs.
        return perm.equals(this.origPerm)
            ? MiningWay.MineRegularly
            : MiningWay.LeaveAlone;
    }
}

class DefaultBlockProperties extends BlockProperties {
    public get breakingSoundId(): string {
        throw new Error(`The block ${this.origPerm.typeId} isn't meant to be quick-mined`);
    }

    public isToolSuitable(_tool: ItemStack): boolean {
        return false;
    }

    public override miningWay(_perm: BlockPermutation): MiningWay {
        throw new Error(`The block ${this.origPerm.typeId} isn't meant to be quick-mined`);
    }
}

export type BlockPropertiesConstructor =
    new (perm: BlockPermutation) => BlockProperties;

export class BlockPropertyRegistry {
    readonly #tags: Map<string, BlockPropertiesConstructor>;
    readonly #blocks: Map<string, BlockPropertiesConstructor>;

    private constructor() {
        this.#tags = new Map();
        this.#blocks = new Map();
    }

    public addTaggedProps(tag: string, propClass: BlockPropertiesConstructor): this {
        if (this.#tags.has(tag))
            throw new Error(`Tagged properties redefined for tag ${tag}`);
        else
            this.#tags.set(tag, propClass);
        return this;
    }

    public addBlockProps(blockId: string, propClass: BlockPropertiesConstructor): this {
        if (this.#blocks.has(blockId))
            throw new Error(`Block properties redefined for block ID ${blockId}`);
        else
            this.#blocks.set(blockId, propClass);
        return this;
    }

    public "get"(perm: BlockPermutation): BlockProperties {
        // Block tags are always preferred over individual IDs.
        for (const tag of perm.tags) {
            const propClass = this.#tags.get(tag);
            if (propClass)
                return new propClass(perm);
        }

        const propClass = this.#blocks.get(perm.typeId);
        if (propClass)
            return new propClass(perm);

        // Having no specific block properties means that the block cannot
        // be quick-mined.
        return new DefaultBlockProperties(perm);
    }
}

// @ts-ignore: Intentionally calling a private constructor.
export const blockProps = new BlockPropertyRegistry();
