import { AccessoryPlugin, API, Characteristic, Service } from 'homebridge';

/**
 * An abstract class which represents a base accessory service.
 */
export abstract class AbstractAccessoryService {
    protected readonly Characteristic: typeof Characteristic;
    protected readonly Service: typeof Service;

    public constructor(protected accessory: AccessoryPlugin, protected api: API) {
        this.Characteristic = this.api.hap.Characteristic;
        this.Service = this.api.hap.Service;
    }
}