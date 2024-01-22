import { command, subcommand } from "cicada-lib/command.js";
import { Player } from "cicada-lib/player.js";
import { spawn } from "cicada-lib/thread.js";
import { PlayerSession } from "./player-session.js";

type QuickMineSubCommand = QuickMinePrefsCommand;

@subcommand("preferences", {aliases: ["prefs"]})
class QuickMinePrefsCommand {}

@command("qmine", {aliases: ["qm"]})
// @ts-ignore: TypeScript thinks this is unused while it's not.
class QuickMineCommand {
    @subcommand([QuickMinePrefsCommand])
    // @ts-ignore: TypeScript thinks this is unused while it's not.
    readonly #sub!: QuickMineSubCommand;

    public run(runner: Player) {
        // We must open it in a separate thread because we're in the
        // read-only mode right now.
        spawn(async function* () {
            runner.sendMessage({translate: "game.quick-mining.message.close-chat"});
            await runner.getSession<PlayerSession>().openPlayerPrefsUI();
        });
    }
}
