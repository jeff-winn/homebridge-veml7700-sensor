import { API } from "homebridge";
import { Veml7700LightSensor } from './sensors/lightSensor';

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  api.registerAccessory("Adafruit VEML7700 Light Sensor", Veml7700LightSensor);
};