import fetch from 'node-fetch';

import { LightSensorClient } from "../LightSensorClient";
import { LuxResponse } from "../LuxResponse";

export class LightSensorClientImpl implements LightSensorClient {
    constructor(private url: string) {
    }

    async inspect(): Promise<LuxResponse | undefined> {       
        let response = await fetch(this.url);
        return await response.json() as LuxResponse;
    }
}