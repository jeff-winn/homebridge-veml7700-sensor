import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import { v4 as uuid } from 'uuid';

import { Logger } from '../diagnostics/logger';

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
    inspect(): Promise<LuxResponse>;
}

export class LightSensorClientImpl implements LightSensorClient {
    public constructor(private url: string, private log: Logger) { }

    public async inspect(): Promise<LuxResponse> {
        const response = await this.executeCore(uuid(), this.url);
        this.throwIfNotOk(response);

        return await response.json() as LuxResponse;
    }
    
    protected async executeCore(id: string, url: RequestInfo, init?: RequestInit): Promise<Response> {
        this.log.debug('Sending request: %s\r\n', id, JSON.stringify({
            url: url,
            method: init?.method,
            headers: init?.headers,
            body: init?.body        
        }));

        const response = await this.doFetch(url, init);
        const buffer = await response.buffer();

        let body: string | undefined;

        const b = buffer.toString('utf-8');
        if (b !== undefined && b !== '') {
            body = JSON.parse(b);
        }

        this.log.debug('Received response: %s\r\n', id, JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            headers: response.headers.raw,
            body: body
        }));

        // Recreate the response since the buffer has already been used.
        return new Response(buffer, {
            headers: response.headers,
            size: response.size,
            status: response.status,
            statusText: response.statusText,
            timeout: response.timeout,
            url: response.url
        });
    }

    protected doFetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
        return fetch(url, init);
    }

    protected throwIfNotOk(response: Response): void {
        if (!response.ok) {
            throw new Error(`ERR: ${response.status}`);
        }
    }
}