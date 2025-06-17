/*
 * Pre-native custom commands (DEPRECATED)
 */
import { command, subcommand } from "cicada-lib/command/legacy.js";
import { Player } from "cicada-lib/player.js";
import { spawn } from "cicada-lib/thread.js";
import { PlayerSession } from "../player-session.js";

type QuickMineSubCommand = QuickMineAdminCommand|QuickMinePrefsCommand;

@subcommand("administer")
class QuickMineAdminCommand {}

@subcommand("preferences", {aliases: ["prefs"]})
class QuickMinePrefsCommand {}

@command("qmine", {aliases: ["qm"]})
// @ts-ignore: TypeScript thinks this is unused while it's not.
class QuickMineCommand {
    @subcommand([QuickMineAdminCommand, QuickMinePrefsCommand])
    readonly #subcmd!: QuickMineSubCommand;

    public run(runner: Player) {
        if (this.#subcmd instanceof QuickMineAdminCommand) {
            // We must open it in a separate thread because we're in the
            // read-only mode right now.
            spawn(async function* () {
                runner.sendMessage({translate: "game.quick-mining.message.close-chat"});
                await runner.getSession<PlayerSession>().openWorldPrefsUI();
            });
        }
        else if (this.#subcmd instanceof QuickMinePrefsCommand) {
            spawn(async function* () {
                runner.sendMessage({translate: "game.quick-mining.message.close-chat"});
                await runner.getSession<PlayerSession>().openPlayerPrefsUI();
            });
        }
        else {
            throw new Error(`Internal error: unknown subcommand: ${this.#subcmd}`);
        }
    }
}
