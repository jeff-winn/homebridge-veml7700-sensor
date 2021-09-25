import { LuxResponse } from "./LuxResponse";

export interface LightSensorClient {
    inspect(): LuxResponse | undefined;
}