import { DeepRequired } from "cicada-lib/types.js";
import { QuickMiningMode } from "./player-prefs_pb.js";
import * as PB from "./player-prefs_pb.js";

export { QuickMiningMode };

export type PlayerPrefs = DeepRequired<PB.PlayerPrefs>;

// Protobuf sucks because it doesn't allow fields to have default values.
// Cap'n Proto sucks less, but its TypeScript implementation is
// unmaintained. Blah...
export function populateDefaults(p: PB.PlayerPrefs): PlayerPrefs {
    return {
        mode: p.mode ?? QuickMiningMode.WhenSneaking,
        coverage: {
            enableMiningLeaves:     p.coverage?.enableMiningLeaves     ?? true,
            enableMiningLogs:       p.coverage?.enableMiningLogs       ?? true,
            enableMiningMushrooms:  p.coverage?.enableMiningMushrooms  ?? true,
            enableMiningOres:       p.coverage?.enableMiningOres       ?? true,
            enableMiningWartBlocks: p.coverage?.enableMiningWartBlocks ?? true,
        }
    };
}
