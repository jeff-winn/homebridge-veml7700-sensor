import { API } from 'homebridge';

import { Veml7700Accessory } from './accessory';
import { ACCESSORY_NAME } from '../src/settings';

export default (api: API) => {
    api.registerAccessory(ACCESSORY_NAME, Veml7700Accessory);
};