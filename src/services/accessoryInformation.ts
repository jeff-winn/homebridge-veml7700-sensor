import { Service } from 'homebridge';
import { AbstractAccessoryService } from './homebridge/abstractAccessoryService';

/**
 * A mechanism which manages accessory information displayed within HomeKit.
 */
export interface AccessoryInformation {
    /**
     * Initializes the service.
     */
    init(): void;

    /**
     * Gets the underlying service.
     */
    getUnderlyingService(): Service | undefined;
}

export class AccessoryInformationImpl extends AbstractAccessoryService implements AccessoryInformation {
    private informationService?: Service;

    public init(): void {
        this.informationService = this.createService()
            .setCharacteristic(this.Characteristic.Manufacturer, 'Jeff Winn')
            .setCharacteristic(this.Characteristic.Model, 'VEML7700');
    }
    
    protected createService(): Service {
        return new this.Service.AccessoryInformation();
    }

    public getUnderlyingService(): Service | undefined {            
        return this.informationService;
    }
}