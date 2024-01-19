import { Player } from "cicada-lib/player.js";
import { ModalFormData } from "cicada-lib/ui.js";
import { PlayerSession } from "../player-session.js";
import * as PB from "../player-prefs_pb.js";

// This has to be kept in sync with ../player-prefs.ts
const COVERAGE = [
    "enableMiningClayLike",
    "enableMiningCrystals",
    "enableMiningGlowstoneLike",
    "enableMiningIceLike",
    "enableMiningLeaves",
    "enableMiningLogs",
    "enableMiningMushrooms",
    "enableMiningObsidian",
    "enableMiningOres",
    "enableMiningPlants",
    "enableMiningSandLike",
    "enableMiningSculkFamily",
    "enableMiningSoulSandLike",
    "enableMiningTuffLike",
    "enableMiningWartBlocks",
];

function langKeyFor(coverage: string) {
    const snakeCased = coverage.slice("enableMining".length);
    return "ui.prefs.coverage." + snakeCased.replaceAll(/[A-Z]/g, (match, offset) => {
        if (offset > 0)
            return "-" + match.toLowerCase();
        else
            return match.toLowerCase();
    });
}

export class PlayerPrefsUI {
    public static async open(player: Player): Promise<void> {
        const prefs = player.getSession<PlayerSession>().prefs;
        const form  = new ModalFormData()
            .title({translate: "ui.prefs.title"})
            .dropdown(
                {translate: "ui.prefs.mode.label"},
                [ {translate: "ui.prefs.mode.item.when-sneaking"},
                  {translate: "ui.prefs.mode.item.unless-sneaking"},
                  {translate: "ui.prefs.mode.item.always-enabled"},
                  {translate: "ui.prefs.mode.item.always-disabled"}
                ], prefs.mode);
        //const coverageOffset = 1; // The number of UI items before the
                                  // coverage toggles.

        if (COVERAGE.length != Object.entries(prefs.coverage).length)
            throw new Error("Internal error: coverage not in sync");
        for (const coverage of COVERAGE) {
            // @ts-ignore: TypeScript obviously doesn't like this
            const current: boolean|undefined = prefs.coverage[coverage];
            if (current == undefined)
                throw new Error(`Internal error: unknown coverage: ${coverage}`);

            form.toggle({translate: langKeyFor(coverage)}, current);
        }

        const resp = await form.show(player);
        if (resp.formValues) {
            prefs.mode = resp.formValues[0] as number;

            // Coverage is always at last.
            const coverageOffset = resp.formValues.length - COVERAGE.length;
            for (let i = coverageOffset; i < resp.formValues.length; i++) {
                // @ts-ignore: TypeScript obviously doesn't like this
                prefs.coverage[COVERAGE[i - coverageOffset]] = resp.formValues[i];
            }
            player.setPreferences(PB.PlayerPrefs, prefs);
        }
    }
}
