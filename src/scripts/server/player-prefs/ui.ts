import { Player } from "cicada-lib/player.js";
import { ModalFormData } from "cicada-lib/ui.js";
import { PlayerPrefs, QuickMiningMode } from "../player-prefs.js";
import * as PB from "../player-prefs_pb.js";

// This has to be kept in sync with ../player-prefs.ts
const PROTECTION = [
    "abortBeforeToolBreaks",
];

// This has to be kept in sync with ../player-prefs.ts
const COVERAGE = [
    "clayLike",
    "crystals",
    "glowstoneLike",
    "iceLike",
    "leaves",
    "logs",
    "mushrooms",
    "obsidian",
    "ores",
    "plants",
    "sandLike",
    "sculkFamily",
    "soulSandLike",
    "terracotta",
    "tuffLike",
    "wartBlocks",
];

function snakeToKebab(snakeCased: string) {
    return snakeCased.replaceAll(/[A-Z]/g, (match, offset) => {
        if (offset > 0)
            return "-" + match.toLowerCase();
        else
            return match.toLowerCase();
    });
}

function langKeyForProtection(protection: string) {
    return "ui.quick-mining.prefs.protection." + snakeToKebab(protection);
}

function langKeyForCoverage(coverage: string) {
    return "ui.quick-mining.prefs.coverage." + snakeToKebab(coverage);
}

export class PlayerPrefsUI {
    public static async open(player: Player, prefs: PlayerPrefs): Promise<void> {
        const form = new ModalFormData().title({translate: "ui.quick-mining.prefs.title"});

        // Protection
        if (PROTECTION.length != Object.entries(prefs.protection).length)
            throw new Error("Internal error: PROTECTION not in sync with proto");
        for (const prot of PROTECTION) {
            // @ts-ignore: TypeScript obviously doesn't like this
            const current: boolean|undefined = prefs.protection[prot];
            if (current == undefined)
                throw new Error(`Internal error: unknown protection: ${prot}`);

            form.toggle(prot, {translate: langKeyForProtection(prot)}, current);
        }

        // Mode
        form.dropdown(
            "mode", {translate: "ui.quick-mining.prefs.mode.label"},
            [ [ QuickMiningMode.WhenSneaking,
                {translate: "ui.quick-mining.prefs.mode.item.when-sneaking"}
              ],
              [ QuickMiningMode.UnlessSneaking,
                {translate: "ui.quick-mining.prefs.mode.item.unless-sneaking"}
              ],
              [ QuickMiningMode.AlwaysEnabled,
                {translate: "ui.quick-mining.prefs.mode.item.always-enabled"}
              ],
              [ QuickMiningMode.AlwaysDisabled,
                {translate: "ui.quick-mining.prefs.mode.item.always-disabled"}
              ]
            ], prefs.mode);

        // Coverage
        if (COVERAGE.length != Object.entries(prefs.coverage).length)
            throw new Error("Internal error: COVERAGE not in sync with proto");
        for (const cover of COVERAGE) {
            // @ts-ignore: TypeScript obviously doesn't like this
            const current: boolean|undefined = prefs.coverage[cover];
            if (current == undefined)
                throw new Error(`Internal error: unknown coverage: ${cover}`);

            form.toggle(cover, {translate: langKeyForCoverage(cover)}, current);
        }

        const res = await form.show(player, {retryWhenBusy: true});
        if (res.formValues) {
            // Protection
            for (const prot of PROTECTION) {
                const value = res.formValues.getBoolean(prot);

                // @ts-ignore: TypeScript obviously doesn't like this
                prefs.protection[prot] = value;
            }

            // Mode
            prefs.mode = res.formValues.getNumber("mode");

            // Coverage
            for (const cover of COVERAGE) {
                const value = res.formValues.getBoolean(cover);

                // @ts-ignore: TypeScript obviously doesn't like this
                prefs.coverage[cover] = value;
            }

            player.setPreferences(PB.PlayerPrefs, prefs);
        }
    }
}
