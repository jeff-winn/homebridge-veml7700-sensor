import { AccessoryPlugin, API, Characteristic, Service } from 'homebridge';
import { Veml7700AccessoryConfig } from '../accessory';
import { LightSensorClient } from '../clients/lightSensorClient';
import { Logger } from '../diagnostics/logger';
import { Timer } from '../primitives/timer';
import { AbstractAccessoryService } from './homebridge/abstractAccessoryService';

/**
 * Defines the value which indicates the contact sensor is open.
 */
const CONTACT_SENSOR_OPEN = 1;

/**
 * Defines the value which indicates the contact sensor is closed.
 */
const CONTACT_SENSOR_CLOSED = 0;

/**
 * Identifies a rain sensor.
 */
export interface RainSensor {
    /**
     * Gets the underlying service.
     */
    getUnderlyingService(): Service | undefined;

    /**
     * Initializes the sensor.
     */
    init(): void;

    /**
     * Starts the sensor.
     */
    start(): void;

    /**
     * Stops the sensor.
     */
    stop(): void;
}

export class RainSensorImpl extends AbstractAccessoryService implements RainSensor {
    private sensorService?: Service;
    private contactState?: Characteristic;

    private lastValue?: number;

    public constructor(private name: string, private config: Veml7700AccessoryConfig, private timer: Timer, 
        private client: LightSensorClient, private log: Logger, protected accessory: AccessoryPlugin, protected api: API) { 
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
        this.startKeepAlive();
    }

    private startKeepAlive(): void {
        this.timer.start(this.pollOnce.bind(this), this.config.pollingInterval * 1000);
    }

    private async pollOnce(): Promise<void> {        
        try {
            const newValue = await this.check();
            if (this.lastValue === undefined || this.lastValue !== newValue) {
                this.lastValue = newValue;
                this.log.info(`Contact state changed: ${newValue === CONTACT_SENSOR_OPEN ? 'OPEN' : 'CLOSED'}`);

                this.contactState?.updateValue(newValue);
            }  
        } catch (err) {
            this.log.error('An error occurred while checking the sensor.', err);
        } finally {
            this.startKeepAlive();
        }
    }

    public stop(): void {
        this.timer.stop();
    }
  
    private async check(): Promise<number> {
        this.log.debug('Checking the state of the sensor...');
  
        let result = false;
  
        const data = await this.client.inspect();
        if (data === undefined) {
            this.log.warn('State of the sensor was not returned.');
        } else {
            const lux = data.lux;
            this.log.debug(`Lux: ${lux}`);
  
            if (this.config.minimum === undefined) {
                result = lux > 0;
            } else {
                result = lux >= this.config.minimum;
            }      
        }
  
        if (result) {
            return CONTACT_SENSOR_OPEN;
        }
  
        return CONTACT_SENSOR_CLOSED;
    }
}