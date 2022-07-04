import { Service } from 'hap-nodejs';
import { API, Logging } from 'homebridge';
import { Mock, It, Times } from 'moq.ts';

import { AccessoryServiceFactory } from '../src/primitives/accessoryServiceFactory';
import { AccessoryInformation } from '../src/services/accessoryInformation';
import { RainSensor } from '../src/services/rainSensor';
import { Veml7700AccessorySpy } from './accessory.spy';

describe('Veml7700Accessory', () => {
    let log: Mock<Logging>;
    let api: Mock<API>;
    let target: Veml7700AccessorySpy;

    beforeEach(() => {
        log = new Mock<Logging>();
        api = new Mock<API>();

        api.setup(o => o.on(It.IsAny(), It.IsAny<() => void>())).returns(api.object());

        target = new Veml7700AccessorySpy(log.object(), {
            accessory: 'test',
            name: 'test'            
        }, api.object());
    });

    it('should be constructed correctly', () => {
        expect(target).toBeDefined();
    });

    it('should initialize and return all services', () => {
        const accessoryInformationService = new Mock<Service>();

        const accessoryInformation = new Mock<AccessoryInformation>();
        accessoryInformation.setup(o => o.init()).returns(undefined);
        accessoryInformation.setup(o => o.getUnderlyingService()).returns(accessoryInformationService.object());

        const rainSensorService = new Mock<Service>();

        const rainSensor = new Mock<RainSensor>();
        rainSensor.setup(o => o.init()).returns(undefined);
        rainSensor.setup(o => o.getUnderlyingService()).returns(rainSensorService.object());

        const factory = new Mock<AccessoryServiceFactory>();
        factory.setup(o => o.createAccessoryInformation()).returns(accessoryInformation.object());
        factory.setup(o => o.createRainSensor()).returns(rainSensor.object());

        target.factory = factory.object();

        const services = target.getServices();
        
        expect(services).toContain(rainSensorService.object());
        expect(services).toContain(accessoryInformationService.object());
    });

    it('should initialize and not return any services', () => {
        const accessoryInformation = new Mock<AccessoryInformation>();
        accessoryInformation.setup(o => o.init()).returns(undefined);
        accessoryInformation.setup(o => o.getUnderlyingService()).returns(undefined);

        const rainSensor = new Mock<RainSensor>();
        rainSensor.setup(o => o.init()).returns(undefined);
        rainSensor.setup(o => o.getUnderlyingService()).returns(undefined);

        const factory = new Mock<AccessoryServiceFactory>();
        factory.setup(o => o.createAccessoryInformation()).returns(accessoryInformation.object());
        factory.setup(o => o.createRainSensor()).returns(rainSensor.object());

        target.factory = factory.object();

        const services = target.getServices();
        
        expect(services).toHaveLength(0);
    });

    it('should not stop the sensor when initialized on shutdown', () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        target.unsafeOnShutdown();

        log.verify(o => o.info(It.IsAny()), Times.Once());
    });

    it('should stop the sensor on shutdown when initialized', () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        const accessoryInformation = new Mock<AccessoryInformation>();
        accessoryInformation.setup(o => o.init()).returns(undefined);

        const rainSensor = new Mock<RainSensor>();
        rainSensor.setup(o => o.init()).returns(undefined);
        rainSensor.setup(o => o.start()).returns(undefined);
        rainSensor.setup(o => o.stop()).returns(undefined);

        const factory = new Mock<AccessoryServiceFactory>();
        factory.setup(o => o.createAccessoryInformation()).returns(accessoryInformation.object());
        factory.setup(o => o.createRainSensor()).returns(rainSensor.object());

        target.factory = factory.object();
        target.unsafeOnFinishedLaunching();

        target.unsafeOnShutdown();

        rainSensor.verify(o => o.stop(), Times.Once());
    });    

    it('should initialize the accessory on did finished launching', () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        const accessoryInformation = new Mock<AccessoryInformation>();
        accessoryInformation.setup(o => o.init()).returns(undefined);

        const rainSensor = new Mock<RainSensor>();
        rainSensor.setup(o => o.init()).returns(undefined);
        rainSensor.setup(o => o.start()).returns(undefined);

        const factory = new Mock<AccessoryServiceFactory>();
        factory.setup(o => o.createAccessoryInformation()).returns(accessoryInformation.object());
        factory.setup(o => o.createRainSensor()).returns(rainSensor.object());

        target.factory = factory.object();
        target.unsafeOnFinishedLaunching();

        accessoryInformation.verify(o => o.init(), Times.Once());
        rainSensor.verify(o => o.init(), Times.Once());
        rainSensor.verify(o => o.start(), Times.Once());
        log.verify(o => o.info(It.IsAny()), Times.Once());
    });

    it('should not initialize more than once', () => {
        const accessoryInformation = new Mock<AccessoryInformation>();
        accessoryInformation.setup(o => o.init()).returns(undefined);

        const rainSensor = new Mock<RainSensor>();
        rainSensor.setup(o => o.init()).returns(undefined);
        rainSensor.setup(o => o.start()).returns(undefined);

        const factory = new Mock<AccessoryServiceFactory>();
        factory.setup(o => o.createAccessoryInformation()).returns(accessoryInformation.object());
        factory.setup(o => o.createRainSensor()).returns(rainSensor.object());

        target.factory = factory.object();

        target.unsafeEnsureInitialized();
        target.unsafeEnsureInitialized();

        accessoryInformation.verify(o => o.init(), Times.Once());
        rainSensor.verify(o => o.init(), Times.Once());
    });
});