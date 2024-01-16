import { DeepRequired } from "cicada-lib/types.js";
import { QuickMiningMode } from "./player-prefs_pb.js";
import * as PB from "./player-prefs_pb.js";

export { QuickMiningMode };

export type PlayerPrefs = DeepRequired<PB.PlayerPrefs>;

// Protobuf sucks because it doesn't allow fields to have default values.
// Cap'n Proto sucks less, but its TypeScript implementation is
// unmaintained. Blah...
export function populateDefaults(prefs: PB.PlayerPrefs): PlayerPrefs {
    return populate(prefs, DEFAULTS);
}

function populate<T>(prefs: T, defaults: DeepRequired<T>): DeepRequired<T> {
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

const DEFAULTS: PlayerPrefs = {
    mode: QuickMiningMode.WhenSneaking,
    coverage: {
        enableMiningClayLike:      true,
        enableMiningCrystals:      true,
        enableMiningGlowstoneLike: true,
        enableMiningIceLike:       true,
        enableMiningLeaves:        true,
        enableMiningLogs:          true,
        enableMiningMushrooms:     true,
        enableMiningOres:          true,
        enableMiningPlants:        true,
        enableMiningSandLike:      true,
        enableMiningSculkFamily:   true,
        enableMiningWartBlocks:    true,
    }
};
