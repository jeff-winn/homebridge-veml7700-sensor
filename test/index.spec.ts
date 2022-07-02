import * as index from '../src/index';

import { API } from 'homebridge';
import { Mock, Times } from 'moq.ts';
import { Veml7700Accessory } from '../src/accessory';
import { ACCESSORY_NAME } from '../src/settings';

describe('index', () => {
    let api: Mock<API>;

    beforeEach(() => {
        api = new Mock<API>();
    });

    it('should register the accessory', () => {
        api.setup(x => x.registerAccessory(ACCESSORY_NAME, Veml7700Accessory)).returns(undefined);

        index.default(api.object());

        api.verify(x => x.registerAccessory(ACCESSORY_NAME, Veml7700Accessory), Times.Once());
    });
});
