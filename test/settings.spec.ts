import * as settings from '../src/settings';

describe('Settings', () => {
    it('should be the correct accessory name', () => {
        expect(settings.ACCESSORY_NAME).toEqual('Homebridge VEML7700 Sensor');
    });

    it('should be the correct plugin id', () => {
        expect(settings.PLUGIN_ID).toEqual('homebridge-veml7700-sensor');
    });
});