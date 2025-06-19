import "cicada-lib/shims/console.js";
import "cicada-lib/shims/timeout.js";
import { GameMode, Player, PlayerPermissionLevel } from "cicada-lib/player.js";
import { Latch } from "cicada-lib/sync/latch.js";
import { spawn } from "cicada-lib/thread.js";
import { world } from "cicada-lib/world.js";
import * as Fmt from "cicada-lib/fmt-code.js";
import { blockProps } from "./block-properties.js";
import { MinerThread } from "./miner-thread.js";
import { QuickMiningMode } from "./player-prefs.js";
import { PlayerSession } from "./player-session.js";
import { isStandingOn } from "./utils.js";
import pkg from "package.json";
import * as MinecraftProps from "./block-properties/minecraft.js";
import "./commands.js";
import "./commands/legacy.js";

const SHOW_DEBUG_INFO = false;

const propsLoaded = new Latch(1);
world.afterEvents.worldLoad.subscribe(_ev => {
    world.usePlayerSessions(PlayerSession);

    spawn(async function* () {
        yield* MinecraftProps.load();
        propsLoaded.countDown();
    });
});

world.beforeEvents.playerBreakBlock.subscribe(ev => {
    const player  = ev.player;
    const block   = ev.block;
    const tool    = ev.itemStack;
    const props   = blockProps.get(block);
    const session = player.getSession<PlayerSession>();
    const prefs   = session.playerPrefs;

    if (SHOW_DEBUG_INFO) {
        console.debug("==========");
        if (tool)
            console.debug("%s is breaking a block %o using %o", player.name, block.typeId, tool.typeId);
        else
            console.debug("%s is breaking a block %o by hand", player.name, block.typeId);
        console.debug("Block:", block);
        console.debug("Tool:", tool);
    }

    const perm = block.permutation;
    if (props.isProtected(perm, player, prefs)) {
        // This block is not meant to be mined. See below for the reason
        // why we teleport the player.
        ev.cancel();
        if (isStandingOn(player, block)) {
            const loc = player.location;
            setTimeout(() => player.teleport(loc));
        }
        return;
    }

    // Quick-mining only activates when the player is using a specific kind
    // of tool. It can therefore never be a bare hand.
    if (!tool)
        return;

    // Tool protection should happen regardless of whether quick-mining is
    // enabled.
    if (prefs.protection.abortBeforeNamedToolBreaks &&
        player.gameMode !== GameMode.Creative &&
        tool.nameTag !== undefined &&
        (tool.durability?.current ?? Infinity) <= MinerThread.TOOL_PROTECTION_MARGIN) {

        ev.cancel();
        return;
    }

    if (!isQuickMiningEnabled(player))
        return;

    if (!props.isToolSuitable(perm, tool, prefs))
        return;

    // Now we know we should do a quick-mining. We are going to break
    // blocks in our own way, so we first need to cancel the regular
    // breakage before leaving this event handler.
    ev.cancel();

    // When a player initiates a quick-mining by breaking a block they are
    // standing on, the block briefly disappears on the client side
    // (because it's broken) and then the server immediately puts it
    // back. Since the client predicts the movement, this causes the player
    // to start falling and then get pushed to a side and fall after
    // all. Work around the issue by teleporting the player to the location
    // where they initially were.
    if (isStandingOn(player, block)) {
        // But of course we can only do it after exiting the read-only
        // mode.
        const loc = player.location;
        setTimeout(() => player.teleport(loc));
    }

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
    switch (player.getSession<PlayerSession>().playerPrefs.mode) {
        case QuickMiningMode.WhenSneaking:
            return player.isSneaking;

        case QuickMiningMode.UnlessSneaking:
            return !player.isSneaking;

        case QuickMiningMode.AlwaysEnabled:
            return true;

        case QuickMiningMode.AlwaysDisabled:
            return false;
    }
}

world.afterEvents.playerSpawn.subscribe(async ev => {
    if (!ev.initialSpawn)
        return;

    await propsLoaded.wait();

    ev.player.sendMessage([
        Fmt.toString([ Fmt.setColour(Fmt.Colour.Orange) ]),
        "Quick Mining Addon v" + pkg.version,
        Fmt.toString([ Fmt.reset, Fmt.setColour(Fmt.Colour.Green) ]),
        { translate: "game.quick-mining.message.welcome.installed" },
        { translate: (() => {
            switch (ev.player.getSession<PlayerSession>().playerPrefs.mode) {
                case QuickMiningMode.WhenSneaking:
                    return "game.quick-mining.message.welcome.mode.when-sneaking";
                case QuickMiningMode.UnlessSneaking:
                    return "game.quick-mining.message.welcome.mode.unless-sneaking";
                case QuickMiningMode.AlwaysEnabled:
                    return "game.quick-mining.message.welcome.mode.always-enabled";
                case QuickMiningMode.AlwaysDisabled:
                    return "game.quick-mining.message.welcome.mode.always-disabled";
            }
        })() },
        Fmt.toString([ Fmt.reset ])
    ]);

    ev.player.sendMessage([
        Fmt.toString([ Fmt.setColour(Fmt.Colour.Green) ]),
        { translate: "game.quick-mining.message.welcome.prefs-cmd.0" },
        Fmt.toString([ Fmt.setColour(Fmt.Colour.WarmLightGray) ]),
        "/qmine:prefs",
        Fmt.toString([ Fmt.setColour(Fmt.Colour.Green) ]),
        { translate: "game.quick-mining.message.welcome.prefs-cmd.1" },
        Fmt.toString([ Fmt.reset ])
    ]);

    if (ev.player.permissionLevel >= PlayerPermissionLevel.Operator) {
        ev.player.sendMessage([
            Fmt.toString([ Fmt.setColour(Fmt.Colour.Green) ]),
            { translate: "game.quick-mining.message.welcome.admin-cmd.0" },
            Fmt.toString([ Fmt.setColour(Fmt.Colour.WarmLightGray) ]),
            "/qmine:admin",
            Fmt.toString([ Fmt.setColour(Fmt.Colour.Green) ]),
            { translate: "game.quick-mining.message.welcome.admin-cmd.1" },
            Fmt.toString([ Fmt.reset ])
        ]);
    }
});
