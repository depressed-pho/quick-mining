import { lazy } from "cicada-lib/lazy.js";
import { world } from "cicada-lib/world.js";
import { DeepRequired } from "cicada-lib/types.js";
import { populate } from "./player-prefs.js";
import * as PB from "./world-prefs_pb.js";

export type WorldPrefs = DeepRequired<PB.WorldPrefs>;

// This has to be kept in sync with world-prefs/ui.ts
const DEFAULTS: WorldPrefs = {
    timeBudgetInMsPerTick: 30,
    maxHorizontalDistance: 16,
    maxVerticalDistance:   32,
};

export const worldPrefs = lazy(() => {
    const prefs = world.getPreferences(PB.WorldPrefs);
    return populate(prefs, DEFAULTS);
});
