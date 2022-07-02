import fetch from 'node-fetch';

export interface LuxResponse {
    lux: number;
    whiteLight: number;
}

export interface ErrorResponse {
    errorMessage: string;
}

export interface LightSensorClient {
    inspect(): Promise<LuxResponse | undefined>;
}

export class LightSensorClientImpl implements LightSensorClient {
    public constructor(private url: string) { }

    public async inspect(): Promise<LuxResponse | undefined> {       
        const response = await fetch(this.url);
        return await response.json() as LuxResponse;
    }
}