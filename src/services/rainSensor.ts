import { AccessoryPlugin, API, Characteristic, Service } from 'homebridge';
import { LightSensorClient } from '../clients/lightSensorClient';
import { Timer } from '../primitives/timer';
import { AbstractAccessoryService } from './homebridge/abstractAccessoryService';

export interface RainSensor {
    getUnderlyingService(): Service | undefined;

    init(): void;

    start(): void;

    stop(): void;
}

export class RainSensorImpl extends AbstractAccessoryService implements RainSensor {
    private sensorService?: Service;
    private contactState?: Characteristic;

    public constructor(private name: string, private timer: Timer, private client: LightSensorClient, 
        protected accessory: AccessoryPlugin, protected api: API) { 
        super(accessory, api);
    }    

    public getUnderlyingService(): Service | undefined {
        return this.sensorService;
    }

    public init(): void {        
        this.sensorService = this.createService();
        this.contactState = this.sensorService.getCharacteristic(this.Characteristic.ContactSensorState);
        
        // this.client = new LightSensorClientImpl(this.config.url);

        // this.pollingInterval = this.config.pollingInterval * 1000;
    }

    protected createService(): Service {
        return new this.Service.ContactSensor(this.name);
    }

    public start(): void {
        // Do nothing.

        // this.beginPollingContactSensorState();
    }

    public stop(): void {
        // Do nothing.
    }

    // private beginPollingContactSensorState(): void {
    //     setTimeout(this.monitorContactSensorState.bind(this), this.pollingInterval);
    //     this.log.debug('Restarted timer.');
    // }
  
    // private async monitorContactSensorState(): Promise<void> {
    //     try {
    //         const newValue = await this.checkContactSensorState();
    //         if (newValue !== this.contactState) {
    //             this.contactState = newValue;
    //             this.log.info(`Contact: ${this.contactState === this.Characteristic.ContactSensorState.CONTACT_DETECTED ? 
    //                 'DETECTED' : 'NOT_DETECTED'}@${newValue}`);

    //             this.sensorService.getCharacteristic(this.Characteristic.ContactSensorState).updateValue(this.contactState);
    //         }  
    //     } catch (err) {
    //         this.log.error('An error occurred while checking the sensor.', err);
    //     } finally {
    //         this.beginPollingContactSensorState();
    //     }
    // }
    
    // private onContactSensorGetCallback(callback: CharacteristicGetCallback): void {
    //     callback(undefined, this.contactState);  
    // }
  
    // private async checkContactSensorState(): Promise<number> {
    //     this.log.debug('Checking the state of the sensor...');
  
    //     let result = false;
  
    //     const data = await this.client.inspect();
    //     if (data === undefined) {
    //         this.log.warn('State of the sensor was not returned.');
    //     } else {
    //         const lux = data.lux;
    //         this.log.debug(`Lux: ${lux}`);
  
    //         if (this.config.minimum === undefined) {
    //             result = lux > 0;
    //         } else {
    //             result = lux >= this.config.minimum;
    //         }      
    //     }
  
    //     if (result) {
    //         return this.Characteristic.ContactSensorState.CONTACT_DETECTED;
    //     }
  
    //     return this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
    // }
}