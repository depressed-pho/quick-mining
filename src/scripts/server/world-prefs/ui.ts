import { Player } from "cicada-lib/player.js";
import { ModalFormData } from "cicada-lib/ui.js";
import { world } from "cicada-lib/world.js";
import { worldPrefs } from "../world-prefs.js";
import * as PB from "../world-prefs_pb.js";

export class WorldPrefsUI {
    public static async open(player: Player): Promise<void> {
        const form = new ModalFormData()
            .title({translate: "ui.quick-mining.admin.title"})
            .slider(
                "timeBudgetInMsPerTick",
                {translate: "ui.quick-mining.admin.timeBudgetInMsPerTick"},
                0, 50, 5, worldPrefs.timeBudgetInMsPerTick)
            .slider(
                "maxHorizontalDistance",
                {translate: "ui.quick-mining.admin.maxHorizontalDistance"},
                0, 64, 4, worldPrefs.maxHorizontalDistance)
            .slider(
                "maxVerticalDistance",
                {translate: "ui.quick-mining.admin.maxVerticalDistance"},
                0, 256, 16, worldPrefs.maxVerticalDistance);

        const res = await form.show(player, {retryWhenBusy: true});
        if (res.formValues) {
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
