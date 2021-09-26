import { 
  AccessoryConfig, 
  AccessoryPlugin, 
  API, 
  Characteristic, 
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

  private contactState?: number;

  constructor(private log: Logging, c: AccessoryConfig, private api: API) {
    this.config = c as Veml7700AccessoryConfig;
    this.name = this.config.name;
    this.hap = api.hap;
    
    this.client = new LightSensorClientImpl(this.config.url);

    this.sensorService = new this.hap.Service.ContactSensor(this.name + " Contact Sensor");
    this.sensorService.getCharacteristic(Characteristic.ContactSensorState)
      .on(CharacteristicEventTypes.GET, this.onContactSensorGetCallback.bind(this));

    this.informationService = new this.hap.Service.AccessoryInformation()
      .setCharacteristic(Characteristic.Manufacturer, "Adafruit Industries")
      .setCharacteristic(Characteristic.Model, "VEML7700");

    log.info("Sensor finished initializing!");
  }
  
  private beginPollingContactSensorState(): void {
    setTimeout(this.monitorContactSensorState.bind(this), this.config.pollingInterval);
  }

  private monitorContactSensorState(): void {
    var newValue = this.checkContactSensorState();
    if (newValue != this.contactState) {
      this.contactState = newValue;
      this.log.info("Contact: " + (this.contactState == Characteristic.ContactSensorState.CONTACT_DETECTED ? 
        "DETECTED" : "NOT_DETECTED"));

      this.sensorService.getCharacteristic(Characteristic.ContactSensorState)
        .updateValue(this.contactState);
    }

    this.beginPollingContactSensorState();
  }
  
  private onContactSensorGetCallback(callback: CharacteristicGetCallback): void {
    var newValue = this.checkContactSensorState();
    if (newValue != this.contactState) {
      this.contactState = newValue;

      this.log.info("Contact: " + (this.contactState == Characteristic.ContactSensorState.CONTACT_DETECTED ?
         "DETECTED" : "NOT_DETECTED"));
      callback(undefined, this.contactState);  
    }
  }

  private checkContactSensorState(): number {
    var result = false;

    var data = this.client.inspect();
    if (data === undefined) {
      this.log.warn("State of the sensor was not returned.");  
    }
    else {
      var lux = data.lux;
      this.log.debug("Lux: " + lux);

      if (this.config.contact === undefined) {
        result = lux > 0;
      }
      else {
        if (this.config.contact.min !== undefined && this.config.contact.max !== undefined) {
          result = lux >= this.config.contact.min && lux <= this.config.contact.max;
        }
        else if (this.config.contact.min !== undefined) {
          result = lux >= this.config.contact.min;
        }
        else if (this.config.contact.max !== undefined) {
          result = lux <= this.config.contact.max;
        }
      }
    }

    if (result) {
      return Characteristic.ContactSensorState.CONTACT_DETECTED;
    }

    return Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
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
    this.beginPollingContactSensorState();

    return [
      this.informationService,
      this.sensorService
    ];
  }
}
