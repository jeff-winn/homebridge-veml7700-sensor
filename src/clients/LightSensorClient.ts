import { LuxResponse } from "./LuxResponse";

export interface LightSensorClient {
    inspect(): Promise<LuxResponse | undefined>;
}