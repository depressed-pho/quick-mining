import { BlockPermutation } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { BlockProperties, MiningWay, blockProps } from "../../block-properties.js";
import { LootTable, LootPool } from "../../loot-table.js";
import { treeProps } from "../../tree-properties.js";

// Regular trees.
for (const tree of ["spruce", "birch", "jungle", "acacia", "dark_oak", "cherry", "pale_oak"]) {
    treeProps.add({
        log:          `minecraft:${tree}_log`,
        wood:         `minecraft:${tree}_wood`,
        strippedLog:  `minecraft:stripped_${tree}_log`,
        strippedWood: `minecraft:stripped_${tree}_wood`,
        leaves: [
            `minecraft:${tree}_leaves`
        ]
    });
}

// Nether fungi.
for (const fungus of ["crimson", "warped"]) {
    treeProps.add({
        log:          `minecraft:${fungus}_stem`,
        wood:         `minecraft:${fungus}_hyphae`, // But isn't hyphae a plural form?
        strippedLog:  `minecraft:stripped_${fungus}_stem`,
        strippedWood: `minecraft:stripped_${fungus}_hyphae`,
        // Nether wart blocks don't count as leaves. They aren't
        // bonus-mined, because they require hoes instead of axes.
    });
}

// Oak and Azalea. These are special because they share the same wood type.
treeProps.add({
    log:          "minecraft:oak_log",
    wood:         "minecraft:oak_wood",
    strippedLog:  "minecraft:stripped_oak_log",
    strippedWood: "minecraft:stripped_oak_wood",
    leaves: [
        "minecraft:oak_leaves",
        "minecraft:azalea_leaves",
        "minecraft:azalea_leaves_flowered"
    ]
});

// Mangrove
treeProps.add({
    log:          "minecraft:mangrove_log",
    wood:         "minecraft:mangrove_wood",
    strippedLog:  "minecraft:stripped_mangrove_log",
    strippedWood: "minecraft:stripped_mangrove_wood",
    roots:        "minecraft:mangrove_roots",
    leaves: [
        "minecraft:mangrove_leaves"
    ],
    miningWay: (_origin: BlockPermutation, perm: BlockPermutation) => {
        switch (perm.typeId) {
            case "minecraft:mangrove_propagule":
                // Quick mining should only propagate to hanging ones but
                // ignore their growth stage. This means immature hanging propagules
                // will be mined as a "bonus" but will drop nothing.
                if (perm.states.get("hanging"))
                    return MiningWay.MineAsABonus;
                else
                    return MiningWay.LeaveAlone;

            case "minecraft:moss_carpet":
                return MiningWay.MineAsABonus;

            default:
                return MiningWay.LeaveAlone;
        }
    },
    rootsSound:   "block.mangrove_roots.break"
});

// Mangrove propagule is the only propagule in Minecraft so we define its
// properties here.
blockProps.addBlockProps(
    "minecraft:mangrove_propagule",
    class extends BlockProperties {
        readonly #self = new LootTable()
            .always([
                new LootPool().entry(new ItemStack("minecraft:mangrove_propagule"))
            ]);

        readonly #nothing = new LootTable();

        public breakingSoundId(): string {
            return "dig.grass";
        }

        public override isFragile(): boolean {
            return true;
        }

        public isToolSuitable(): boolean {
            // Nothing is suitable. Quick-mining cannot be initiated
            // originating from propagules.
            return false;
        }

        // We don't override isEquivalentTo(). Quick-mining should
        // propagate to nearby propagules only when their hanging state and
        // growth stage match to that of the origin.

        // Mangrove propagules drop itself when they are in their final
        // growth stage, or when it's not hanging from mangrove leaves.
        public override lootTable(perm: BlockPermutation): LootTable {
            if ((perm.states.get("propagule_stage") ?? 0) == 4 || !perm.states.get("hanging"))
                return this.#self;
            else
                return this.#nothing;
        }
    });
