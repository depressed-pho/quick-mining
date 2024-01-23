import { DeepRequired } from "cicada-lib/types.js";
import { QuickMiningMode } from "./player-prefs_pb.js";
import * as PB from "./player-prefs_pb.js";

export { QuickMiningMode };

export type PlayerPrefs = DeepRequired<PB.PlayerPrefs>;

// This has to be kept in sync with player-prefs/ui.ts
const DEFAULTS: PlayerPrefs = {
    mode: QuickMiningMode.WhenSneaking,
    protection: {
        abortBeforeToolBreaks: true,
        leaveGroundUntouched:  true,
    },
    loots: {
        autoCollect: true,
    },
    coverage: {
        clayLike:      true,
        crystals:      true,
        glowstoneLike: true,
        iceLike:       true,
        leaves:        true,
        logs:          true,
        mushrooms:     true,
        obsidian:      true,
        ores:          true,
        plants:        true,
        sandLike:      true,
        sculkFamily:   true,
        soulSandLike:  true,
        terracotta:    false,
        tuffLike:      false,
        wartBlocks:    true,
    }
};

// Protobuf sucks because it doesn't allow fields to have default values.
// Cap'n Proto sucks less, but its TypeScript implementation is
// unmaintained. Blah...
export function populateDefaults(prefs: PB.PlayerPrefs): PlayerPrefs {
    return populate(prefs, DEFAULTS);
}

export function populate<T>(prefs: T, defaults: DeepRequired<T>): DeepRequired<T> {
    // @ts-ignore: TypeScript isn't smart enough to typecheck this code,
    // and I don't complain. We would have a hard time writing type-safe
    // code doing this even in PureScript.
    return Object.fromEntries(
        Object.entries(defaults).map(([key, value]) => {
            // @ts-ignore
            if (prefs[key] !== undefined) {
                if (typeof value === "object") {
                    // @ts-ignore
                    return [key, populate(prefs[key], value)];
                }
                else {
                    // @ts-ignore
                    return [key, prefs[key]];
                }
            }
            else {
                return [key, value];
            }
        }));
}
