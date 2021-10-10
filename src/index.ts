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
import { Veml7700AccessoryConfig } from "./Veml7700AccessoryConfig";

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  api.registerAccessory("veml7700", Veml7700Accessory);
};

class Veml7700Accessory implements AccessoryPlugin {
  private readonly config: Veml7700AccessoryConfig;
  private readonly name: string;
  private readonly hap: HAP;
  private readonly pollingInterval: number;
  private readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  private readonly sensorService: Service;
  private readonly informationService: Service;
  private readonly client: LightSensorClient;
  
  private contactState: number;

  constructor(private log: Logging, c: AccessoryConfig, private api: API) {
    this.config = c as Veml7700AccessoryConfig;
    this.name = this.config.name;
    this.hap = api.hap;
    this.pollingInterval = this.config.pollingInterval * 1000;
    
    this.client = new LightSensorClientImpl(this.config.url);
    this.contactState = this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;

    this.sensorService = new this.hap.Service.ContactSensor(this.name);
    this.sensorService.getCharacteristic(this.Characteristic.ContactSensorState)
      .on(CharacteristicEventTypes.GET, this.onContactSensorGetCallback.bind(this));

    this.informationService = new this.hap.Service.AccessoryInformation()
      .setCharacteristic(this.Characteristic.Manufacturer, "Adafruit Industries")
      .setCharacteristic(this.Characteristic.Model, "VEML7700");

    log.info("Sensor finished initializing!");
  }
  
  private beginPollingContactSensorState(): void {
    setTimeout(this.monitorContactSensorState.bind(this), this.pollingInterval);
  }

  private async monitorContactSensorState(): Promise<void> {
    var newValue = await this.checkContactSensorState();
    if (newValue != this.contactState) {
      this.contactState = newValue;
      this.log.info("Contact: " + (this.contactState == this.Characteristic.ContactSensorState.CONTACT_DETECTED ? 
        "DETECTED" : "NOT_DETECTED"));

      this.sensorService.getCharacteristic(this.Characteristic.ContactSensorState)
        .updateValue(this.contactState);
    }

    this.beginPollingContactSensorState();
  }
  
  private onContactSensorGetCallback(callback: CharacteristicGetCallback): void {
      callback(undefined, this.contactState);  
  }

  private async checkContactSensorState(): Promise<number> {
    var result = false;

    var data = await this.client.inspect();
    if (data === undefined) {
      this.log.warn("State of the sensor was not returned.");  
    }
    else {
      var lux = data.lux;
      this.log.debug("Lux: " + lux);

      if (this.config.minimum === undefined) {
        result = lux > 0;
      }
      else {
        result = lux >= this.config.minimum;
      }      
    }

    if (result) {
      return this.Characteristic.ContactSensorState.CONTACT_DETECTED;
    }

    return this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
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
