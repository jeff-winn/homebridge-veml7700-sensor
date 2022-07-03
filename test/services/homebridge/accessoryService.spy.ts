import { Characteristic, Service } from 'homebridge';
import { AbstractAccessoryService } from '../../../src/services/homebridge/abstractAccessoryService';

export class AccessoryServiceSpy extends AbstractAccessoryService {
    public unsafeGetCharacteristic(): typeof Characteristic {
        return this.Characteristic;
    }

    public unsafeGetService(): typeof Service {
        return this.Service;
    }
}