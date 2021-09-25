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
import { LightSensorClientImpl } from "./clients/impl/LightSensorClientImpl";
import { LightSensorClient } from "./clients/LightSensorClient";
import { AccessoryMode, Veml7700AccessoryConfig } from "./Veml7700AccessoryConfig";

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  api.registerAccessory("Adafruit VEML7700", Veml7700Accessory);
};

class Veml7700Accessory implements AccessoryPlugin {
  private readonly config: Veml7700AccessoryConfig;
  private readonly name: string;
  private readonly hap: HAP;
  
  private readonly sensorService: Service;
  private readonly informationService: Service;
  private readonly client: LightSensorClient;

  constructor(private log: Logging, c: AccessoryConfig, private api: API) {
    this.config = c as Veml7700AccessoryConfig;
    this.name = this.config.name;
    this.hap = api.hap;
    
    this.client = new LightSensorClientImpl(this.config.url);

    if (this.config.mode == AccessoryMode.light) {
      this.sensorService = new this.hap.Service.LightSensor(this.name + "Light Sensor");
      this.sensorService.getCharacteristic(this.hap.Characteristic.CurrentAmbientLightLevel)
        .on(CharacteristicEventTypes.GET, this.onLightSensorGetCallback.bind(this));
    }
    else {
      this.sensorService = new this.hap.Service.ContactSensor(this.name + " Contact Sensor");
      this.sensorService.getCharacteristic(this.hap.Characteristic.ContactSensorState)
        .on(CharacteristicEventTypes.GET, this.onContactSensorGetCallback.bind(this));
    }

    this.informationService = new this.hap.Service.AccessoryInformation()
      .setCharacteristic(this.hap.Characteristic.Manufacturer, "Adafruit Industries")
      .setCharacteristic(this.hap.Characteristic.Model, "VEML7700");

    log.info("Sensor finished initializing!");
  }
  
  private onContactSensorGetCallback(callback: CharacteristicGetCallback): void {
    var contactDetected = false;

    var data = this.client.inspect();
    if (data === undefined) {
      this.log.warn("State of the sensor was not returned.");  
    }
    else {
      var lux = data.lux;
      this.log.debug("Lux: " + lux);

      if (this.config.contact === undefined) {
        contactDetected = lux > 0;
      }
      else {
        if (this.config.contact.min !== undefined && this.config.contact.max !== undefined) {
          contactDetected = lux >= this.config.contact.min && lux <= this.config.contact.max;
        }
        else if (this.config.contact.min !== undefined) {
          contactDetected = lux >= this.config.contact.min;
        }
        else if (this.config.contact.max !== undefined) {
          contactDetected = lux <= this.config.contact.max;
        }
      }
    }

    this.log.info("Contact: " + contactDetected ? "DETECTED" : "NOT_DETECTED");
    callback(undefined, contactDetected);
  }

  private onLightSensorGetCallback(callback: CharacteristicGetCallback): void {
    var result = this.client.inspect();
    var lux = result?.lux;

    this.log.info("Lux: " + lux);
    callback(undefined, lux);
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
      this.sensorService
    ];
  }
}
