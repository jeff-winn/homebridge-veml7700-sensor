import fetch, { Response } from 'node-fetch';

/**
 * Describes a lux response.
 */
export interface LuxResponse {
    lux: number;
    whiteLight: number;
}

/**
 * Describes an error response.
 */
export interface ErrorResponse {
    errorMessage: string;
}

/**
 * A client which can inspect the sensor.
 */
export interface LightSensorClient {
    inspect(): Promise<LuxResponse | undefined>;
}

export class LightSensorClientImpl implements LightSensorClient {
    public constructor(private url: string) { }

    public async inspect(): Promise<LuxResponse | undefined> {       
        const response = await fetch(this.url);
        this.throwIfNotOk(response);

        return await response.json() as LuxResponse;
    }

    protected throwIfNotOk(response: Response): void {
        if (!response.ok) {
            throw new Error(`ERR: ${response.status}`);
        }
    }
}