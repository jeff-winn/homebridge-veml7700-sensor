import { API } from "homebridge";
import { Veml7700Accessory } from "./Veml7700Accessory";

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  api.registerAccessory("Homebridge VEML7700 Sensor", Veml7700Accessory);
};