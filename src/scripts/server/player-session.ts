import { IPlayerSession, Player } from "cicada-lib/player.js";
import { MinerThread } from "./miner-thread.js";
import { PlayerPrefs, populateDefaults } from "./player-prefs.js";
import { PlayerPrefsUI } from "./player-prefs/ui.js";
import * as PB from "./player-prefs_pb.js";

export class PlayerSession implements IPlayerSession {
    public runningMiner: MinerThread|null;
    #player: Player;
    #playerPrefsUI: Promise<void>|null;
    #playerPrefs: PlayerPrefs;

    public constructor(player: Player) {
        this.runningMiner   = null;
        this.#player        = player;
        this.#playerPrefsUI = null;
        this.#playerPrefs   = populateDefaults(player.getPreferences(PB.PlayerPrefs));
    }

    public get playerPrefs(): PlayerPrefs {
        return this.#playerPrefs;
    }

    public async openPlayerPrefsUI(): Promise<void> {
        if (!this.#playerPrefsUI) {
            this.#playerPrefsUI = PlayerPrefsUI.open(this.#player, this.#playerPrefs);
            await this.#playerPrefsUI;
            this.#playerPrefsUI = null;
        }
    }

    public destroy() {
        if (this.runningMiner) {
            this.runningMiner.cancel();
            // No need to join it. The thread takes care of leaving
            // players.
        }
    }
}
