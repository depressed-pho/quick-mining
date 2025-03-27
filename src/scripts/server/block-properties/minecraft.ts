const MODULES = [
    "./minecraft/bones.js",
    "./minecraft/bookshelves.js",
    "./minecraft/clay.js",
    "./minecraft/crystals.js",
    "./minecraft/dirt.js",
    "./minecraft/fungi.js",
    "./minecraft/glowstone.js",
    "./minecraft/ice.js",
    "./minecraft/leaves.js",
    "./minecraft/minerals.js",
    "./minecraft/moss.js",
    "./minecraft/netherrack.js",
    "./minecraft/obsidian.js",
    "./minecraft/ores.js",
    "./minecraft/plants.js",
    "./minecraft/rocks/abundant.js",
    "./minecraft/rocks/common.js",
    "./minecraft/rocks/uncommon.js",
    "./minecraft/sand.js",
    "./minecraft/sculk-family.js",
    "./minecraft/soul-sand.js",
    "./minecraft/shrooms.js",
    "./minecraft/terracotta.js",
    "./minecraft/trees.js",
];

export async function* load() {
    for (const mod of MODULES) {
        await import(mod);
    }
}
