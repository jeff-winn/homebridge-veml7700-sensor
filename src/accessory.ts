import { 
  AccessoryConfig, 
  AccessoryPlugin, 
  API, 
  CharacteristicEventTypes, 
  CharacteristicGetCallback, 
  CharacteristicSetCallback, 
  CharacteristicValue, 
  HAP, 
  Logging, 
  Service 
} from "homebridge";

let hap: HAP;

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  hap = api.hap;
  api.registerAccessory("Adafruit VEML7700 Lux Sensor", Veml7700LuxSensor);
};

class Veml7700LuxSensor implements AccessoryPlugin {
  private readonly log: Logging;
  private readonly name: string;
  private contactDetected = false;

  private readonly sensorService: Service;
  private readonly informationService: Service;

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log = log;
    this.name = config.name;

    this.sensorService = new hap.Service.ContactSensor(this.name);
    this.sensorService.getCharacteristic(hap.Characteristic.ContactSensorState)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        log.info("Current state of the sensor was returned: " + (this.contactDetected ? "DETECTED": "NOT_DETECTED"));
        callback(undefined, this.contactDetected);
      });

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, "Adafruit Industries")
      .setCharacteristic(hap.Characteristic.Model, "VEML7700");

    log.info("Sensor finished initializing!");
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify(): void {
    this.log("Identify!");
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.informationService,
      this.sensorService,
    ];
  }
}
