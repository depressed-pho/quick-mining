import { IPlayerSession, Player } from "cicada-lib/player.js";
import { MinerThread } from "./miner-thread.js";
import { PlayerPrefs, populateDefaults } from "./player-prefs.js";
import * as PB from "./player-prefs_pb.js";

export class PlayerSession implements IPlayerSession {
    public runningMiner: MinerThread|null;
    #prefs: PlayerPrefs;

    public constructor(player: Player) {
        this.runningMiner = null;
        this.#prefs       = populateDefaults(player.getPreferences(PB.PlayerPrefs));
    }

    public get prefs(): PlayerPrefs {
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
