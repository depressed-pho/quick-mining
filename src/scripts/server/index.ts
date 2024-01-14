import "cicada-lib/shims/console.js";
import { Player } from "cicada-lib/player.js";
import { world } from "cicada-lib/world.js";
import { blockProps } from "./block-properties.js";
import { MinerThread } from "./miner-thread.js";
import { PlayerSession } from "./player-session.js";
import { QuickMiningMode } from "./player-prefs_pb.js";

world.usePlayerSessions(PlayerSession);

world.beforeEvents.playerBreakBlock.subscribe(ev => {
    const player = ev.player;

    // Quick-mining only activates when the player is using a specific kind
    // of tool. It can therefore never be a bare hand.
    const tool = ev.itemStack;
    if (!tool)
        return;

    if (0) { // FIXME
        const block = ev.block;
        console.log(`${player.name} is breaking a block ${block.typeId} using ${tool.typeId}`);

        console.log("Tool tags are:", tool.raw.getTags());
        console.log("Tool components are:", tool.raw.getComponents());

        console.log("Block tags are:", block.raw.permutation.getTags());
        console.log("Block permutation states are:", block.raw.permutation.getAllStates());
    }

    if (!isQuickMiningEnabled(player))
        return;

    const block   = ev.block;
    const perm    = block.permutation;
    const props   = blockProps.get(perm);
    const session = player.getSession<PlayerSession>();
    if (!props.isToolSuitable(perm, tool, session.prefs))
        return;

    // Now we know we should do a quick-mining. We are going to break
    // blocks in our own way, so we first need to cancel the regular
    // breakage before leaving this event handler.
    ev.cancel();

    // We are going to use async/await from here. The event handler itself
    // cannot be asynchronous because it has to call ev.cancel()
    // synchronously.
    (async () => {
        if (session.runningMiner) {
            // The miner thread this player spawned in the past has not
            // finished yet. We don't want to spawn more. Do nothing and
            // forget about this attempt.
        }
        else {
            // There are currently no running miner threads spawned by this
            // player. We can spawn one.
            session.runningMiner = new MinerThread(player, tool, block, perm).start();
            await session.runningMiner.join();
            session.runningMiner = null;
        }
    })();
});

function isQuickMiningEnabled(player: Player): boolean {
    switch (player.getSession<PlayerSession>().prefs.mode) {
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
    }
}
