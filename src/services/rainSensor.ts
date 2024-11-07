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
    private lux?: Characteristic;

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
        this.lux = this.sensorService.getCharacteristic(this.Characteristic.CurrentAmbientLightLevel);
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

    protected async pollOnce(): Promise<void> {   
        try {
            const newValue = await this.checkSensor();
            if (this.lastValue === undefined || this.lastValue !== newValue) {
                this.setLastValue(newValue);
                this.log.info(`Contact state changed: ${newValue === CONTACT_SENSOR_OPEN ? 'OPEN' : 'CLOSED'}`);

                this.contactState!.updateValue(newValue);
            }  
        } catch (err) {
            this.log.error('An error occurred while checking the sensor.', err);
        } finally {
            this.startKeepAlive();
        }
    }

    protected setLastValue(value: number | undefined): void {
        this.lastValue = value;
    }

    public stop(): void {
        this.timer.stop();
    }
  
    protected async checkSensor(): Promise<number> {
        this.log.debug('Checking the state of the sensor...');
  
        let result = false;
  
        const data = await this.client.inspect();
        
        let lux = data.lux;
        if (lux === 0) {
            // The sensor characteristic cannot support a value of zero, set the value to the absolute minimium required.
            // See for more information: https://developers.homebridge.io/#/characteristic/CurrentAmbientLightLevel
            lux = 0.0001;
        }

        this.lux!.updateValue(lux);

        if (this.config.minimum === undefined) {
            result = lux > 0;
        } else {
            result = lux >= this.config.minimum;
        }              
  
        return result ? CONTACT_SENSOR_OPEN : CONTACT_SENSOR_CLOSED;
    }
}