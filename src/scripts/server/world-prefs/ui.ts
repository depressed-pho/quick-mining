import { Player } from "cicada-lib/player.js";
import { ModalFormData } from "cicada-lib/ui.js";
import { world } from "cicada-lib/world.js";
import { worldPrefs } from "../world-prefs.js";
import * as PB from "../world-prefs_pb.js";

export class WorldPrefsUI {
    public static async open(player: Player): Promise<void> {
        const form = new ModalFormData()
            .title({translate: "ui.quick-mining.admin.title"})
            .toggle(
                "consumeHungerBar",
                {translate: "ui.quick-mining.admin.consumeHungerBar"},
                {defaultValue: worldPrefs.consumeHungerBar})
            .slider(
                "timeBudgetInMsPerTick",
                {translate: "ui.quick-mining.admin.timeBudgetInMsPerTick"},
                0, 50,
                { defaultValue: worldPrefs.timeBudgetInMsPerTick,
                  valueStep:    5
                })
            .slider(
                "maxHorizontalDistance",
                {translate: "ui.quick-mining.admin.maxHorizontalDistance"},
                0, 64,
                { defaultValue: worldPrefs.maxHorizontalDistance,
                  valueStep:    4
                })
            .slider(
                "maxVerticalDistance",
                {translate: "ui.quick-mining.admin.maxVerticalDistance"},
                0, 256,
                { defaultValue: worldPrefs.maxVerticalDistance,
                  valueStep:    16
                });

        const res = await form.show(player, {retryWhenBusy: true});
        if (res.formValues) {
            worldPrefs.consumeHungerBar =
                res.formValues.getBoolean("consumeHungerBar");
            worldPrefs.timeBudgetInMsPerTick =
                res.formValues.getNumber("timeBudgetInMsPerTick");
            worldPrefs.maxHorizontalDistance =
                res.formValues.getNumber("maxHorizontalDistance");
            worldPrefs.maxVerticalDistance =
                res.formValues.getNumber("maxVerticalDistance");

            world.setPreferences(PB.WorldPrefs, worldPrefs);
        }
    }
}
