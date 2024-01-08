import { IPlayerSession, Player } from "cicada-lib/player.js";
import { DeepRequired } from "cicada-lib/types.js";
import { populateDefaults } from "./player-prefs.js";
import { PlayerPrefs } from "./player-prefs_pb.js";

export class PlayerSession implements IPlayerSession {
    #prefs: DeepRequired<PlayerPrefs>;

    public constructor(player: Player) {
        this.#prefs = populateDefaults(player.getPreferences(PlayerPrefs));
    }

    public get prefs(): DeepRequired<PlayerPrefs> {
        return this.#prefs;
    }

    public destroy() {
        // Do nothing atm
    }
}
