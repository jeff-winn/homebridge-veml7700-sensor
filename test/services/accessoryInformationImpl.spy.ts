import { Service } from 'homebridge';
import { AccessoryInformationImpl } from '../../src/services/accessoryInformation';

export class AccessoryInformationImplSpy extends AccessoryInformationImpl {
    public service?: Service;

    protected override createService(): Service {
        if (this.service !== undefined) {
            return this.service;
        }

        return super.createService();
    }
}