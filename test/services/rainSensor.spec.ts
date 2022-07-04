import { Service, Characteristic } from 'hap-nodejs';
import { AccessoryPlugin, API, HAP } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { LightSensorClient } from '../../src/clients/lightSensorClient';
import { Logger } from '../../src/diagnostics/logger';
import { Timer } from '../../src/primitives/timer';
import { RainSensorImplSpy } from './rainSensor.spy';

describe('RainSensorImpl', () => {
    let timer: Mock<Timer>;
    let client: Mock<LightSensorClient>;
    let log: Mock<Logger>;

    let accessory: Mock<AccessoryPlugin>;
    let api: Mock<API>;
    let hap: Mock<HAP>;

    beforeEach(() => {
        timer = new Mock<Timer>();
        client = new Mock<LightSensorClient>();
        log = new Mock<Logger>();

        accessory = new Mock<AccessoryPlugin>();
        api = new Mock<API>();
        hap = new Mock<HAP>();
        
        api.setup(x => x.hap).returns(hap.object());
        hap.setup(x => x.Characteristic).returns(Characteristic);
        hap.setup(x => x.Service).returns(Service);
    });

    it('should initialize the sensor', () => {
        const contactState = new Mock<Characteristic>();

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.ContactSensorState)).returns(contactState.object());

        const target = new RainSensorImplSpy('hello', {
            name: 'hello',
            accessory: 'world',
            minimum: 1,
            pollingInterval: 100,
            url: 'http://localhost:8080/api/v1/sensor/16'
        }, timer.object(), client.object(), log.object(), accessory.object(), api.object());

        target.service = service.object();
        target.init();

        expect(() => target.getUnderlyingService()).toBeDefined();
    });

    it('should start the timer', () => {
        timer.setup(o => o.start(It.IsAny(), It.IsAny())).returns(undefined);

        const target = new RainSensorImplSpy('hello', {
            name: 'hello',
            accessory: 'world',
            minimum: 1,
            pollingInterval: 1,
            url: 'http://localhost:8080/api/v1/sensor/16'
        }, timer.object(), client.object(), log.object(), accessory.object(), api.object());

        target.start();

        timer.verify(o => o.start(It.IsAny(), 1000), Times.Once());
    });

    it('should stop the timer', () => {
        timer.setup(o => o.stop()).returns(undefined);

        const target = new RainSensorImplSpy('hello', {
            name: 'hello',
            accessory: 'world',
            minimum: 1,
            pollingInterval: 1,
            url: 'http://localhost:8080/api/v1/sensor/16'
        }, timer.object(), client.object(), log.object(), accessory.object(), api.object());

        target.stop();

        timer.verify(o => o.stop(), Times.Once());
    });
});