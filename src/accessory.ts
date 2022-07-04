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
    private initialized = false;
  
    public constructor(private log: Logging, c: AccessoryConfig, private api: API) {
        this.config = c as Veml7700AccessoryConfig;

        api.on(APIEvent.DID_FINISH_LAUNCHING, this.onFinishedLaunching.bind(this));
        api.on(APIEvent.SHUTDOWN, this.onShutdown.bind(this));
    }

    protected onFinishedLaunching(): void {
        this.ensureInitialized();
        
        this.rainSensor!.start();

        this.log.info('Sensor finished initializing.');
    }

    protected onShutdown(): void {
        this.rainSensor?.stop();

        this.log.info('Sensor shutdown.');
    }

    protected ensureInitialized(): void {
        if (this.initialized) {
            return;
        }

        const factory = this.getServiceFactory();

        this.accessoryInformation = factory.createAccessoryInformation();
        this.accessoryInformation.init();

        this.rainSensor = factory.createRainSensor();
        this.rainSensor.init();

        this.initialized = true;
    }
  
    /* While named get services, this is actually what initalizes the
       accessory given that it's called before any events get executed. */
    public getServices(): Service[] {
        this.ensureInitialized();

        const result: Service[] = [];

        const accessoryInformationService = this.accessoryInformation!.getUnderlyingService();
        if (accessoryInformationService !== undefined) {
            result.push(accessoryInformationService);
        }

        const rainSensorService = this.rainSensor!.getUnderlyingService();        
        if (rainSensorService !== undefined) {
            result.push(rainSensorService);
        }

        return result;        
    }
    
    protected getServiceFactory(): AccessoryServiceFactory {
        return new AccessoryServiceFactoryImpl(this, this.api, this.config);
    }
}