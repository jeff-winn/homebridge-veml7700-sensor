import { Characteristic, Service } from 'hap-nodejs';
import { AccessoryPlugin, API, HAP } from 'homebridge';
import { Mock } from 'moq.ts';

import { AccessoryServiceSpy } from './accessoryService.spy';

describe('AbstractAccessoryService', () => {
    let accessory: Mock<AccessoryPlugin>;
    let api: Mock<API>;
    let hap: Mock<HAP>;

    let target: AccessoryServiceSpy;

    beforeEach(() => {
        accessory = new Mock<AccessoryPlugin>();
        api = new Mock<API>();
        hap = new Mock<HAP>();

        api.setup(x => x.hap).returns(hap.object());
        hap.setup(x => x.Characteristic).returns(Characteristic);
        hap.setup(x => x.Service).returns(Service);

        target = new AccessoryServiceSpy(accessory.object(), api.object());
    });

    it('should be constructed correctly', () => {
        expect(target.unsafeGetCharacteristic()).toBeDefined();
        expect(target.unsafeGetService()).toBeDefined();
    });
});