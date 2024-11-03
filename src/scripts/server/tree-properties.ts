import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, MiningWay, blockProps } from "./block-properties.js";
import { IgnoringState } from "./block-properties/mixins.js";
import { PlayerPrefs } from "./player-prefs.js";

export interface ITreeProperties {
    /// Block ID for non-stripped log.
    log?: string;

    /// Block ID for non-stripped wood.
    wood?: string;

    /// Block ID for stripped log.
    strippedLog?: string;

    /// Block ID for non-stripped log.
    strippedWood?: string;

    /// Block ID for roots as in mangrove roots. Most trees don't have
    /// roots though.
    roots?: string;

    /// List of block IDs of possible leaves. Mining logs or wood also mine
    /// non-persistent leaves as a bonus, but not vice versa.
    leaves?: string[];

    /// An optional function to determine if or how `perm` should be
    /// quick-mined as a consequence of initiating a quick mining at
    /// `origin`.
    miningWay?: (origin: BlockPermutation, perm: BlockPermutation, prefs: PlayerPrefs) => MiningWay,

    /// The ID of the sound to be played when its wooden part is broken. If
    /// it's omitted it will be defaulted to `dig.wood`.
    woodSound?: string;

    /// The ID of the sound to be played when its roots are broken. It is
    /// mandatory if `roots` is defined.
    rootsSound?: string;
}

// We consider two wood-like blocks be equivalent as long as their block
// states match, except we ignore their pillar axis.
function WoodLike(tree: ITreeProperties,
                  soundId: string,
                  isCovered: (prefs: PlayerPrefs) => boolean) {

    const leaves: Set<string> = new Set(tree.leaves ?? []);

    class WoodLikeBlockProperties extends IgnoringState(BlockProperties, "pillar_axis") {
        public breakingSoundId(): string {
            return soundId;
        }

        public isToolSuitable(_perm: BlockPermutation, tool: ItemStack, prefs: PlayerPrefs): boolean {
            if (isCovered(prefs))
                return tool.tags.has("minecraft:is_axe");
            else
                return false;
        }

        public override miningWay(origin: BlockPermutation, perm: BlockPermutation, prefs: PlayerPrefs): MiningWay {
            if (leaves.has(perm.typeId) && !perm.states.get("persistent_bit")) {
                return MiningWay.MineAsABonus;
            }
            else if (tree.log !== undefined && perm.typeId === tree.log) {
                if (prefs.coverage.logs)
                    return MiningWay.MineRegularly;
            }
            else if (tree.wood !== undefined && perm.typeId === tree.wood) {
                if (prefs.coverage.wood)
                    return MiningWay.MineRegularly;
            }
            else if (tree.strippedLog !== undefined && perm.typeId === tree.strippedLog) {
                if (prefs.coverage.strippedLogs)
                    return MiningWay.MineRegularly;
            }
            else if (tree.strippedWood !== undefined && perm.typeId === tree.strippedWood) {
                if (prefs.coverage.strippedWood)
                    return MiningWay.MineRegularly;
            }
            else if (tree.roots !== undefined && perm.typeId === tree.roots) {
                if (prefs.coverage.logs)
                    return MiningWay.MineRegularly;
            }
            else if (tree.miningWay !== undefined) {
                return tree.miningWay(origin, perm, prefs);
            }
            return MiningWay.LeaveAlone;
        }
    }
    return WoodLikeBlockProperties;
}

export class TreePropertyRegistry {
    readonly #treeFor: Map<string, ITreeProperties>;

    private constructor() {
        this.#treeFor = new Map();
    }

    /// Register a tree. This also generates and registers block properties
    /// for its `log`, `wood`, `strippedLog`, `strippedWood`, and
    /// `roots`. It does not generate block properties for `leaves`.
    public add(tree: ITreeProperties): this {
        // Validation
        for (const part of ["log", "wood", "strippedLog", "strippedWood", "roots"]) {
            // @ts-ignore: TypeScript of course doesn't like this.
            if (tree[part] !== undefined && this.#treeFor.has(tree[part]))
                // @ts-ignore: TypeScript of course doesn't like this.
                throw new Error(`${tree[part]} has already been registered as a part of another tree`);
        }

        if (tree.roots !== undefined && tree.rootsSound === undefined)
            throw new Error(`If "roots" is defined "rootsSound" must also be defined`);

        // Generate block properties and register them.
        const woodSound: string = tree.woodSound ?? "dig.wood";

        if (tree.log !== undefined) {
            blockProps.addBlockProps(
                tree.log,
                WoodLike(tree, woodSound, prefs => prefs.coverage.logs));
        }

        if (tree.wood !== undefined) {
            blockProps.addBlockProps(
                tree.wood,
                WoodLike(tree, woodSound, prefs => prefs.coverage.wood));
        }

        if (tree.strippedLog !== undefined) {
            blockProps.addBlockProps(
                tree.strippedLog,
                WoodLike(tree, woodSound, prefs => prefs.coverage.strippedLogs));
        }

        if (tree.strippedWood !== undefined) {
            blockProps.addBlockProps(
                tree.strippedWood,
                WoodLike(tree, woodSound, prefs => prefs.coverage.strippedWood));
        }

        if (tree.roots !== undefined) {
            // Roots count as logs as for coverage.
            blockProps.addBlockProps(
                tree.roots,
                WoodLike(tree, tree.rootsSound!, prefs => prefs.coverage.logs));
        }

        return this;
    }
}

// @ts-ignore: Intentionally calling a private constructor.
export const treeProps = new TreePropertyRegistry();
