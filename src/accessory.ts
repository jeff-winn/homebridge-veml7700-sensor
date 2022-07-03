import {
    AccessoryConfig, AccessoryPlugin, API, APIEvent, Logging, Service
} from 'homebridge';

import { AccessoryServiceFactory, AccessoryServiceFactoryImpl } from './primitives/accessoryServiceFactory';
import { AccessoryInformation } from './services/accessoryInformation';
import { RainSensor } from './services/rainSensor';

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

        this.log.info('Sensor finished initializing.');
    }

    private onShutdown(): void {
        this.rainSensor?.stop();

        this.log.info('Sensor shutdown.');
    }
  
    /* While named get services, this is actually what initalizes the
       accessory given that it's called before any events get executed. */
    public getServices(): Service[] {
        const result: Service[] = [];

        const factory = this.getServiceFactory();

        this.accessoryInformation = factory.createAccessoryInformation();
        this.accessoryInformation.init();

        const accessoryInformationService = this.accessoryInformation.getUnderlyingService();
        if (accessoryInformationService !== undefined) {
            result.push(accessoryInformationService);
        }

        this.rainSensor = factory.createRainSensor();
        this.rainSensor.init();

        const rainSensorService = this.rainSensor.getUnderlyingService();        
        if (rainSensorService !== undefined) {
            result.push(rainSensorService);
        }

        return result;        
    }
    
    private getServiceFactory(): AccessoryServiceFactory {
        return new AccessoryServiceFactoryImpl(this, this.api, this.config);
    }
}