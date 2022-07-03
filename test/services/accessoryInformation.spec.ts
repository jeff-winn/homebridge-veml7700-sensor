import { Characteristic, Service } from 'hap-nodejs';
import { AccessoryPlugin, API, HAP } from 'homebridge';
import { Mock } from 'moq.ts';

import { AccessoryInformationImplSpy } from './accessoryInformationImpl.spy';

describe('AccessoryInformation', () => {
    let accessory: Mock<AccessoryPlugin>;
    let api: Mock<API>;
    let hap: Mock<HAP>;

    let target: AccessoryInformationImplSpy;

    beforeEach(() => {
        accessory = new Mock<AccessoryPlugin>();
        api = new Mock<API>();
        hap = new Mock<HAP>();

        api.setup(x => x.hap).returns(hap.object());
        hap.setup(x => x.Characteristic).returns(Characteristic);
        hap.setup(x => x.Service).returns(Service);

        target = new AccessoryInformationImplSpy(accessory.object(), api.object());
    });

    it('should initialize correctly', () => {
        const service = new Mock<Service>();
        service.setup(x => x.setCharacteristic(Characteristic.Manufacturer, 'Jeff Winn')).returns(service.object());
        service.setup(x => x.setCharacteristic(Characteristic.Model, 'VEML7700')).returns(service.object());    

        target.service = service.object();

        target.init();

        expect(target.getUnderlyingService()).toBe(service.object());
    });
});