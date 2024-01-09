import { IPlayerSession, Player } from "cicada-lib/player.js";
import { DeepRequired } from "cicada-lib/types.js";
import { MinerThread } from "./miner-thread.js";
import { populateDefaults } from "./player-prefs.js";
import { PlayerPrefs } from "./player-prefs_pb.js";

export class PlayerSession implements IPlayerSession {
    public runningMiner: MinerThread|null;
    #prefs: DeepRequired<PlayerPrefs>;

    public constructor(player: Player) {
        this.runningMiner = null;
        this.#prefs       = populateDefaults(player.getPreferences(PlayerPrefs));
    }

    public get prefs(): DeepRequired<PlayerPrefs> {
        return this.#prefs;
    }

    public destroy() {
        if (this.runningMiner) {
            this.runningMiner.cancel();
            // No need to join it. The thread takes care of leaving
            // players.
        }
    }
}
