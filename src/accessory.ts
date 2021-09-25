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

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  api.registerAccessory("Adafruit VEML7700", Veml7700Accessory);
};

class Veml7700Accessory implements AccessoryPlugin {
  private readonly log: Logging;
  private readonly name: string;
  private readonly hap: HAP;

  private currentValue: number = 0;
  private contactDetected: boolean = false;
  
  private readonly contactService?: Service;
  private readonly lightService?: Service;
  private readonly informationService: Service;

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log = log;
    this.name = config.name;
    this.hap = api.hap;

    if (config.contactSensor) {
      this.contactService = new this.hap.Service.ContactSensor(this.name + " Contact Sensor");
      this.contactService.getCharacteristic(this.hap.Characteristic.ContactSensorState)
        .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
          log.info("Current state of the sensor was returned: " + (this.contactDetected ? "DETECTED": "NOT_DETECTED"));
          callback(undefined, this.contactDetected);
        });  
    }

    if (config.lightSensor) {
      this.lightService = new this.hap.Service.LightSensor(this.name + "Light Sensor");
      this.lightService.getCharacteristic(this.hap.Characteristic.CurrentAmbientLightLevel)
        .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
          this.currentValue = 0.0001;        
          log.info("Current state of the sensor was returned: " + this.currentValue);

          callback(undefined, this.currentValue);
        });
    }

    this.informationService = new this.hap.Service.AccessoryInformation()
      .setCharacteristic(this.hap.Characteristic.Manufacturer, "Adafruit Industries")
      .setCharacteristic(this.hap.Characteristic.Model, "VEML7700");

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
    let services: Service[] = [];
    services.push(this.informationService);
    
    if (this.contactService) {
      services.push(this.contactService);
    }

    if (this.lightService) {
      services.push(this.lightService);
    }

    return services;
  }
}
