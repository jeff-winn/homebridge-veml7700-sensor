import { Service, Characteristic } from 'hap-nodejs';
import { AccessoryPlugin, API, HAP } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { LightSensorClient, LuxResponse } from '../../src/clients/lightSensorClient';
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

    it('should update the lux characteristic when checking the sensor', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);

        const luxCharacteristic = new Mock<Characteristic>();
        luxCharacteristic.setup(o => o.updateValue(It.IsAny())).returns(luxCharacteristic.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.CurrentAmbientLightLevel)).returns(luxCharacteristic.object());

        const target = new RainSensorImplSpy('hello', {
            name: 'hello',
            accessory: 'world',
            minimum: 1,
            pollingInterval: 1,
            url: 'http://localhost:8080/api/v1/sensor/16'
        }, timer.object(), client.object(), log.object(), accessory.object(), api.object());

        target.service = service.object();
        target.init();

        const r: LuxResponse = {
            lux: 100,
            whiteLight: 100
        };

        client.setup(o => o.inspect()).returns(Promise.resolve(r));

        await target.unsafeCheckSensor();
        luxCharacteristic.verify(o => o.updateValue(100), Times.Once());
    });

    it('should not update the contact state when the value does not change', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        log.setup(o => o.info(It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny(), It.IsAny())).returns(undefined);

        const luxCharacteristic = new Mock<Characteristic>();
        luxCharacteristic.setup(o => o.updateValue(It.IsAny())).returns(luxCharacteristic.object());

        const contactState = new Mock<Characteristic>();
        contactState.setup(o => o.updateValue(It.IsAny())).returns(contactState.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.ContactSensorState)).returns(contactState.object());
        service.setup(o => o.getCharacteristic(Characteristic.CurrentAmbientLightLevel)).returns(luxCharacteristic.object());

        const target = new RainSensorImplSpy('hello', {
            name: 'hello',
            accessory: 'world',
            minimum: 1,
            pollingInterval: 1,
            url: 'http://localhost:8080/api/v1/sensor/16'
        }, timer.object(), client.object(), log.object(), accessory.object(), api.object());

        target.service = service.object();
        target.init();
        target.unsafeSetLastValue(1);

        const r: LuxResponse = {
            lux: 100,
            whiteLight: 100
        };

        client.setup(o => o.inspect()).returns(Promise.resolve(r));

        await target.unsafePollOnce();        

        contactState.verify(o => o.updateValue(It.IsAny()), Times.Never());
        timer.verify(o => o.start(It.IsAny(), It.IsAny()), Times.Once());
    });
    
    it('should update the contact state when the value changes', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        log.setup(o => o.info(It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny(), It.IsAny())).returns(undefined);

        const contactState = new Mock<Characteristic>();
        contactState.setup(o => o.updateValue(It.IsAny())).returns(contactState.object());

        const luxCharacteristic = new Mock<Characteristic>();
        luxCharacteristic.setup(o => o.updateValue(It.IsAny())).returns(luxCharacteristic.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.ContactSensorState)).returns(contactState.object());
        service.setup(o => o.getCharacteristic(Characteristic.CurrentAmbientLightLevel)).returns(luxCharacteristic.object());

        const target = new RainSensorImplSpy('hello', {
            name: 'hello',
            accessory: 'world',
            minimum: 1,
            pollingInterval: 1,
            url: 'http://localhost:8080/api/v1/sensor/16'
        }, timer.object(), client.object(), log.object(), accessory.object(), api.object());

        target.service = service.object();
        target.init();
        target.unsafeSetLastValue(0);

        const r: LuxResponse = {
            lux: 101,
            whiteLight: 101
        };

        client.setup(o => o.inspect()).returns(Promise.resolve(r));

        await target.unsafePollOnce();        

        contactState.verify(o => o.updateValue(1));
        timer.verify(o => o.start(It.IsAny(), It.IsAny()), Times.Once());
    });

    it('should update the contact state to sensor open when changed from undefined to a value', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        log.setup(o => o.info(It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny(), It.IsAny())).returns(undefined);

        const luxCharacteristic = new Mock<Characteristic>();
        luxCharacteristic.setup(o => o.updateValue(It.IsAny())).returns(luxCharacteristic.object());

        const contactState = new Mock<Characteristic>();
        contactState.setup(o => o.updateValue(It.IsAny())).returns(contactState.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.ContactSensorState)).returns(contactState.object());
        service.setup(o => o.getCharacteristic(Characteristic.CurrentAmbientLightLevel)).returns(luxCharacteristic.object());

        const target = new RainSensorImplSpy('hello', {
            name: 'hello',
            accessory: 'world',
            minimum: 1,
            pollingInterval: 1,
            url: 'http://localhost:8080/api/v1/sensor/16'
        }, timer.object(), client.object(), log.object(), accessory.object(), api.object());

        target.service = service.object();
        target.init();
        target.unsafeSetLastValue(undefined);

        const r: LuxResponse = {
            lux: 100,
            whiteLight: 100
        };

        client.setup(o => o.inspect()).returns(Promise.resolve(r));

        await target.unsafePollOnce();        

        contactState.verify(o => o.updateValue(1));
        timer.verify(o => o.start(It.IsAny(), It.IsAny()), Times.Once());
    });

    it('should update the contact state to sensor closed when changed from undefined to a value', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        log.setup(o => o.info(It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny(), It.IsAny())).returns(undefined);

        const luxCharacteristic = new Mock<Characteristic>();
        luxCharacteristic.setup(o => o.updateValue(It.IsAny())).returns(luxCharacteristic.object());

        const contactState = new Mock<Characteristic>();
        contactState.setup(o => o.updateValue(It.IsAny())).returns(contactState.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.ContactSensorState)).returns(contactState.object());
        service.setup(o => o.getCharacteristic(Characteristic.CurrentAmbientLightLevel)).returns(luxCharacteristic.object());

        const target = new RainSensorImplSpy('hello', {
            name: 'hello',
            accessory: 'world',
            minimum: 1,
            pollingInterval: 1,
            url: 'http://localhost:8080/api/v1/sensor/16'
        }, timer.object(), client.object(), log.object(), accessory.object(), api.object());

        target.service = service.object();
        target.init();
        target.unsafeSetLastValue(undefined);

        const r: LuxResponse = {
            lux: 0,
            whiteLight: 0
        };

        client.setup(o => o.inspect()).returns(Promise.resolve(r));

        await target.unsafePollOnce();        

        contactState.verify(o => o.updateValue(0));
        timer.verify(o => o.start(It.IsAny(), It.IsAny()), Times.Once());
    });

    it('should update the contact state when value is greater than zero', async () => {
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        log.setup(o => o.info(It.IsAny())).returns(undefined);
        timer.setup(o => o.start(It.IsAny(), It.IsAny())).returns(undefined);

        const luxCharacteristic = new Mock<Characteristic>();
        luxCharacteristic.setup(o => o.updateValue(It.IsAny())).returns(luxCharacteristic.object());

        const contactState = new Mock<Characteristic>();
        contactState.setup(o => o.updateValue(It.IsAny())).returns(contactState.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.ContactSensorState)).returns(contactState.object());
        service.setup(o => o.getCharacteristic(Characteristic.CurrentAmbientLightLevel)).returns(luxCharacteristic.object());

        const target = new RainSensorImplSpy('hello', {
            name: 'hello',
            accessory: 'world',
            minimum: undefined,
            pollingInterval: 1,
            url: 'http://localhost:8080/api/v1/sensor/16'
        }, timer.object(), client.object(), log.object(), accessory.object(), api.object());

        target.service = service.object();
        target.init();
        target.unsafeSetLastValue(undefined);

        const r: LuxResponse = {
            lux: 1,
            whiteLight: 1
        };

        client.setup(o => o.inspect()).returns(Promise.resolve(r));

        await target.unsafePollOnce();        

        contactState.verify(o => o.updateValue(1));
        timer.verify(o => o.start(It.IsAny(), It.IsAny()), Times.Once());
    });
});