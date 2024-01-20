import { delay } from "cicada-lib/delay.js";
import { Player } from "cicada-lib/player.js";
import { Timer } from "cicada-lib/timer.js";
import { ModalFormData } from "cicada-lib/ui.js";
import { PlayerPrefs } from "../player-prefs.js";
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
            throw new Error("Internal error: protection not in sync");
        for (const protection of PROTECTION) {
            // @ts-ignore: TypeScript obviously doesn't like this
            const current: boolean|undefined = prefs.protection[protection];
            if (current == undefined)
                throw new Error(`Internal error: unknown protection: ${protection}`);

            form.toggle({translate: langKeyForProtection(protection)}, current);
        }

        // Mode
        form.dropdown(
            {translate: "ui.quick-mining.prefs.mode.label"},
            [ {translate: "ui.quick-mining.prefs.mode.item.when-sneaking"},
              {translate: "ui.quick-mining.prefs.mode.item.unless-sneaking"},
              {translate: "ui.quick-mining.prefs.mode.item.always-enabled"},
              {translate: "ui.quick-mining.prefs.mode.item.always-disabled"}
            ], prefs.mode);

        // Coverage
        if (COVERAGE.length != Object.entries(prefs.coverage).length)
            throw new Error("Internal error: coverage not in sync");
        for (const coverage of COVERAGE) {
            // @ts-ignore: TypeScript obviously doesn't like this
            const current: boolean|undefined = prefs.coverage[coverage];
            if (current == undefined)
                throw new Error(`Internal error: unknown coverage: ${coverage}`);

            form.toggle({translate: langKeyForCoverage(coverage)}, current);
        }

        // When the player is on the chat screen (or probably on the pause
        // screen too?), the game immediately cancels the form without even
        // displaying it. We detect this by measuring the time it takes to
        // cancel the form and retry.
        const timer = new Timer();
        let resp;
        while (true) {
            resp = await form.show(player);
            if (!resp.formValues) {
                if (timer.elapsedMs <= 100) {
                    // It's highly likely that the form didn't even show
                    // up.
                    await delay(0.2);
                    timer.reset();
                    continue;
                }
            }
            break;
        }

        if (resp.formValues) {
            // Protection
            let i = 0;
            const minProt = i;
            const maxProt = i + PROTECTION.length;
            for (; i < maxProt; i++) {
                if (typeof resp.formValues[i] !== "boolean")
                    throw new Error(`Internal error: formValues[${i}] is not a boolean`);

                // @ts-ignore: TypeScript obviously doesn't like this
                prefs.protection[PROTECTION[i - minProt]] = resp.formValues[i];
            }

            // Mode
            if (typeof resp.formValues[i] !== "number")
                throw new Error(`Internal error: formValues[${i}] is not a number`);
            prefs.mode = resp.formValues[i] as number;
            i++;

            // Coverage
            const minCover = i;
            const maxCover = i + COVERAGE.length;
            for (; i < maxCover; i++) {
                if (typeof resp.formValues[i] !== "boolean")
                    throw new Error(`Internal error: formValues[${i}] is not a boolean`);

                // @ts-ignore: TypeScript obviously doesn't like this
                prefs.coverage[COVERAGE[i - minCover]] = resp.formValues[i];
            }

            if (i != resp.formValues.length)
                throw new Error(`Internal error: ${i} != ${resp.formValues.length}`);

            player.setPreferences(PB.PlayerPrefs, prefs);
        }
    }
}
