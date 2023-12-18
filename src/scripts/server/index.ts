import "cicada-lib/shims/console.js";
import { Block } from "cicada-lib/block.js";
import { ItemStack } from "cicada-lib/item/stack.js";
import { Player } from "cicada-lib/player.js";
import { world } from "cicada-lib/world.js";
import { MinerThread } from "./miner-thread.js";
import { QuickMiningMode } from "./player-prefs_pb.js";

world.beforeEvents.playerBreakBlock.subscribe(ev => {
    const player = ev.player;

    // Quick-mining only activates when the player is using a specific kind
    // of tool. It can therefore never be a bare hand.
    const tool = ev.itemStack;
    if (!tool) {
        return;
    }

    if (0) { // FIXME
        //console.log(`${player.name} is breaking a block using ${tool.typeId}`);

        console.log("Tool tags are:", tool.raw.getTags());
        console.log("Tool components are:", tool.raw.getComponents());

        const block = ev.block;
        console.log("Block tags are:", block.raw.permutation.getTags());
        console.log("Block permutation states are:", block.raw.permutation.getAllStates());
    }

    if (!isQuickMiningEnabled(player))
        return;

    if (!isToolSuitableForQuicklyMine(tool, ev.block))
        return;

    // Now we know we should do a quick-mining. We are going to break
    // blocks in our own way, so we first need to cancel the regular
    // breakage.
    ev.cancel();

    new MinerThread(player, tool, ev.block).start();
});

function isQuickMiningEnabled(player: Player): boolean {
    // FIXME: This should be configurable.
    const mode = QuickMiningMode.WhenSneaking as QuickMiningMode;

    switch (mode) {
        case QuickMiningMode.WhenSneaking:
            if (player.isSneaking)
                return true;
            else
                return false;

        case QuickMiningMode.UnlessSneaking:
            if (player.isSneaking)
                return true;
            else
                return false;

        case QuickMiningMode.AlwaysEnabled:
            return true;

        case QuickMiningMode.AlwaysDisabled:
            return false;

        default:
            console.error(`Unknown quick mining mode: ${mode}`);
            return false;
    }
}

function isToolSuitableForQuicklyMine(_tool: ItemStack, _block: Block): boolean {
    /*
    if (tool.tags.has("minecraft:is_axe")) {
        // FIXME
    }
    */
    return true;
}
