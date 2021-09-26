import { LightSensorClient } from "../LightSensorClient";
import { LuxResponse } from "../LuxResponse";

export class LightSensorClientImpl implements LightSensorClient {
    constructor(private url: string) {
    }

    inspect(): LuxResponse | undefined {        
        return {
            lux: Math.floor(Math.random() * (20 - 1) + 1),
            whiteLight: 200.01
        };
        
        // var response = await fetch(this.url);
        // var result = await response.json() as LuxResponse;

        // return result;
    }
}