import { IPlayerSession, Player } from "cicada-lib/player.js";
import { MinerThread } from "./miner-thread.js";
import { PlayerPrefs, populateDefaults } from "./player-prefs.js";
import { PlayerPrefsUI } from "./player-prefs/ui.js";
import { WorldPrefsUI } from "./world-prefs/ui.js";
import * as PB from "./player-prefs_pb.js";

export class PlayerSession implements IPlayerSession {
    public runningMiner: MinerThread|null;
    #player: Player;
    #playerPrefs: PlayerPrefs;
    #playerPrefsUI: Promise<void>|null;
    #worldPrefsUI: Promise<void>|null;

    public constructor(player: Player) {
        this.runningMiner   = null;
        this.#player        = player;
        this.#playerPrefs   = populateDefaults(player.getPreferences(PB.PlayerPrefs));
        this.#playerPrefsUI = null;
        this.#worldPrefsUI  = null;
    }

    public get playerPrefs(): PlayerPrefs {
        return this.#playerPrefs;
    }

    public async openPlayerPrefsUI(): Promise<void> {
        if (!this.#playerPrefsUI) {
            try {
                this.#playerPrefsUI = PlayerPrefsUI.open(this.#player, this.#playerPrefs);
                await this.#playerPrefsUI;
            }
            finally {
                this.#playerPrefsUI = null;
            }
        }
    }

    public async openWorldPrefsUI(): Promise<void> {
        if (!this.#worldPrefsUI) {
            try {
                this.#worldPrefsUI = WorldPrefsUI.open(this.#player);
                await this.#worldPrefsUI;
            }
            finally {
                this.#worldPrefsUI = null;
            }
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
