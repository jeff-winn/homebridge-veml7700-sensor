import { AccessoryPlugin, API } from 'homebridge';
import { Veml7700AccessoryConfig } from '../accessory';
import { LightSensorClientImpl } from '../clients/lightSensorClient';
import { HomebridgeImitationLogger, Logger } from '../diagnostics/logger';
import { ConsoleWrapperImpl } from '../diagnostics/primitives/consoleWrapper';
import { AccessoryInformation, AccessoryInformationImpl } from '../services/accessoryInformation';
import { RainSensor, RainSensorImpl } from '../services/rainSensor';
import { NodeJsEnvironment } from './environment';
import { TimerImpl } from './timer';

export interface AccessoryServiceFactory {
    createAccessoryInformation(): AccessoryInformation;

    createRainSensor(): RainSensor;
}

export class AccessoryServiceFactoryImpl implements AccessoryServiceFactory {
    public constructor(private accessory: AccessoryPlugin, private api: API, private config: Veml7700AccessoryConfig) { }
    
    public createAccessoryInformation(): AccessoryInformation {
        return new AccessoryInformationImpl(this.accessory, this.api);
    }

    public createRainSensor(): RainSensor {
        const log = this.createLogger();

        return new RainSensorImpl(this.config.name, this.config, 
            new TimerImpl(), 
            new LightSensorClientImpl(this.config.url, log),
            log, this.accessory, this.api);
    }

    protected createLogger(): Logger {
        return new HomebridgeImitationLogger(new NodeJsEnvironment(), this.config.name, undefined, new ConsoleWrapperImpl());
    }   
}