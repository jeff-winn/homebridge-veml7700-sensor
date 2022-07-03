import {
    AccessoryConfig, AccessoryPlugin, API, APIEvent, Logging, Service
} from 'homebridge';
import { LightSensorClientImpl } from './clients/lightSensorClient';
import { TimerImpl } from './primitives/timer';

import { AccessoryInformation, AccessoryInformationImpl } from './services/accessoryInformation';
import { RainSensor, RainSensorImpl } from './services/rainSensor';

export interface Veml7700AccessoryConfig extends AccessoryConfig {
    pollingInterval: number;
    url: string;
    minimum: number | undefined;
}

export class Veml7700Accessory implements AccessoryPlugin {
    private readonly config: Veml7700AccessoryConfig;

    private accessoryInformation?: AccessoryInformation;
    private rainSensor?: RainSensor;
  
    public constructor(private log: Logging, c: AccessoryConfig, private api: API) {
        this.config = c as Veml7700AccessoryConfig;

        api.on(APIEvent.DID_FINISH_LAUNCHING, this.onFinishedLaunching.bind(this));
        api.on(APIEvent.SHUTDOWN, this.onShutdown.bind(this));
    }

    private onFinishedLaunching(): void {
        this.rainSensor?.start();

        // log.info('Sensor finished initializing!');
    }

    private onShutdown(): void {
        this.rainSensor?.stop();
    }
  
    /* While named get services, this is actually what initalizes the
       accessory given that it's called before any events get executed. */
    public getServices(): Service[] {
        const result: Service[] = [];

        this.accessoryInformation = this.createAccessoryInformation();
        this.accessoryInformation.init();

        const accessoryInformationService = this.accessoryInformation.getUnderlyingService();
        if (accessoryInformationService !== undefined) {
            result.push(accessoryInformationService);
        }

        this.rainSensor = this.createRainSensor();
        this.rainSensor.init();

        const rainSensorService = this.rainSensor.getUnderlyingService();        
        if (rainSensorService !== undefined) {
            result.push(rainSensorService);
        }

        return result;        
    }

    protected createAccessoryInformation(): AccessoryInformation {
        return new AccessoryInformationImpl(this, this.api);
    }

    protected createRainSensor(): RainSensor {
        return new RainSensorImpl(this.config.name, new TimerImpl(), new LightSensorClientImpl(this.config.url), this, this.api);
    }
}