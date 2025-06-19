import { CommandOrigin, CommandResult, ICommand, command } from "cicada-lib/command.js";
import { Player } from "cicada-lib/player.js";
import { spawn } from "cicada-lib/thread.js";
import { PlayerSession } from "./player-session.js";

@command({
    name: "quick-mining:qmine-admin",
    description: "game.quick-mining.command.admin",
    permissionLevel: "admin"
})
// @ts-ignore: TypeScript thinks this is unused while it's not.
class QuickMineAdminCommand implements ICommand {
    public run(origin: CommandOrigin): CommandResult {
        if (origin instanceof Player) {
            // We must open it in a separate thread because we're in the
            // read-only mode right now. The API documentation does not
            // state this clearly.
            spawn(async function* () {
                origin.getSession<PlayerSession>().openWorldPrefsUI();
            });
            return {
                status: "succeeded"
            };
        }
        else {
            throw new Error(`Impossible origin: ${origin}`);
        }
    }
}

@command({
    name: "quick-mining:qmine-prefs",
    description: "game.quick-mining.command.prefs",
    permissionLevel: "any"
})
// @ts-ignore: TypeScript thinks this is unused while it's not.
class QuickMinePrefsCommand implements ICommand {
    public run(origin: CommandOrigin): CommandResult {
        if (origin instanceof Player) {
            spawn(async function* () {
                origin.getSession<PlayerSession>().openPlayerPrefsUI();
            });
            return {
                status: "succeeded"
            };
        }
        else {
            return {
                message: "game.quick-mining.message.not-a-player",
                status: "failed"
            };
        }
    }
}
