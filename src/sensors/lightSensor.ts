import { 
  AccessoryConfig, 
  AccessoryPlugin, 
  API, 
  CharacteristicEventTypes, 
  CharacteristicGetCallback, 
  HAP, 
  Logging, 
  Service 
} from "homebridge";

export class Veml7700LightSensor implements AccessoryPlugin {
  private readonly log: Logging;
  private readonly name: string;
  private readonly hap: HAP;

  private currentValue: number = 0;

  private readonly sensorService: Service;
  private readonly informationService: Service;

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log = log;
    this.name = config.name;
    this.hap = api.hap;

    this.sensorService = new this.hap.Service.LightSensor(this.name);
    this.sensorService.getCharacteristic(this.hap.Characteristic.CurrentAmbientLightLevel)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        this.currentValue = 0.0001;        
        log.info("Current state of the sensor was returned: " + this.currentValue);

        callback(undefined, this.currentValue);
      });

    this.informationService = new this.hap.Service.AccessoryInformation()
      .setCharacteristic(this.hap.Characteristic.Manufacturer, "Adafruit Industries")
      .setCharacteristic(this.hap.Characteristic.Model, "VEML7700");

    log.info("Sensor finished initializing!");
  }

  onGetCurrentAmbientLightLevel(): number {
    this.currentValue = 0.001;
    this.log.info("Current state of the sensor was returned: " + this.currentValue);

    return this.currentValue;
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
