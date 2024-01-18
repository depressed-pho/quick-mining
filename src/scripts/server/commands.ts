import { command, subcommand } from "cicada-lib/command.js";
import { Player } from "cicada-lib/player.js";

type QuickMineSubCommand = QuickMineConfigCommand /* | ... */;

@subcommand("configure")
class QuickMineConfigCommand {}

@command("qmine", {aliases: ["qm"]})
// @ts-ignore: TypeScript thinks this is unused while it's not.
class QuickMineCommand {
    @subcommand([QuickMineConfigCommand])
    // @ts-ignore: TypeScript thinks this is unused while it's not.
    readonly #sub!: QuickMineSubCommand;

    public run(runner: Player) {
        console.log(`FIXME: open configuration UI for player ${runner.name}`);
    }
}
