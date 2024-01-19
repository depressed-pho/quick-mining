// I initially intended to open the prefs UI when a player swings a pickaxe
// (or shovel, or hoe, or whatever) in the air, only to find out it was
// difficult if not impossible. I then created this decorator-based custom
// command system and found out custom UIs won't open when the player is on
// the chat screen. This forced me back to the first solution.
/*
import { command, subcommand } from "cicada-lib/command.js";
import { Player } from "cicada-lib/player.js";
import { spawn } from "cicada-lib/thread.js";
import { PlayerPrefsUI } from "./player-prefs/ui.js";

type QuickMineSubCommand = QuickMinePrefsCommand;

@subcommand("preferences")
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
            await PlayerPrefsUI.open(runner);
        });
    }
}
*/
