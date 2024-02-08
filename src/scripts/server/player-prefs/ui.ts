import { Player } from "cicada-lib/player.js";
import { ModalFormData } from "cicada-lib/ui.js";
import { PlayerPrefs, QuickMiningMode } from "../player-prefs.js";
import * as PB from "../player-prefs_pb.js";

// This has to be kept in sync with ../player-prefs.ts
const PROTECTION = [
    "abortBeforeNamedToolBreaks",
    "keepGroundFromQuickMined",
    "keepBuddingAmethystFromBroken",
];

// This has to be kept in sync with ../player-prefs.ts
const LOOTS = [
    "autoCollect",
];

// This has to be kept in sync with ../player-prefs.ts
const COVERAGE = [
    "clayLike",
    "crystals",
    "dirtLike",
    "glowstoneLike",
    "iceLike",
    "leaves",
    "logs",
    "mushrooms",
    "obsidian",
    "ores",
    "plants",
    "rocksCommon",
    "rocksUncommon",
    "sandLike",
    "sculkFamily",
    "soulSandLike",
    "terracotta",
    "wartBlocks",
];

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

            form.toggle(
                prot,
                {translate: "ui.quick-mining.prefs.protection." + prot},
                current);
        }

        // Loots
        if (LOOTS.length != Object.entries(prefs.loots).length)
            throw new Error("Internal error: LOOTS not in sync with proto");
        for (const loots of LOOTS) {
            // @ts-ignore: TypeScript obviously doesn't like this
            const current: boolean|undefined = prefs.loots[loots];
            if (current == undefined)
                throw new Error(`Internal error: unknown loots: ${loots}`);

            form.toggle(
                loots,
                {translate: "ui.quick-mining.prefs.loots." + loots},
                current);
        }

        // Mode
        form.dropdown(
            "mode", {translate: "ui.quick-mining.prefs.mode.label"},
            [ [ QuickMiningMode.WhenSneaking,
                {translate: "ui.quick-mining.prefs.mode.item.whenSneaking"}
              ],
              [ QuickMiningMode.UnlessSneaking,
                {translate: "ui.quick-mining.prefs.mode.item.unlessSneaking"}
              ],
              [ QuickMiningMode.AlwaysEnabled,
                {translate: "ui.quick-mining.prefs.mode.item.alwaysEnabled"}
              ],
              [ QuickMiningMode.AlwaysDisabled,
                {translate: "ui.quick-mining.prefs.mode.item.alwaysDisabled"}
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

            form.toggle(
                cover,
                {translate: "ui.quick-mining.prefs.coverage." + cover},
                current);
        }

        const res = await form.show(player, {retryWhenBusy: true});
        if (res.formValues) {
            // Protection
            for (const prot of PROTECTION) {
                const value = res.formValues.getBoolean(prot);

                // @ts-ignore: TypeScript obviously doesn't like this
                prefs.protection[prot] = value;
            }

            // Loots
            for (const loots of LOOTS) {
                const value = res.formValues.getBoolean(loots);

                // @ts-ignore: TypeScript obviously doesn't like this
                prefs.loots[loots] = value;
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
