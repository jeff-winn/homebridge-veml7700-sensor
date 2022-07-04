import { RequestInfo, RequestInit, Response } from 'node-fetch';
import { LightSensorClientImpl } from '../../src/clients/lightSensorClient';

export class LightSensorClientImplSpy extends LightSensorClientImpl {
    public response?: Response;

    protected override doFetch(url: RequestInfo, init?: RequestInit | undefined): Promise<Response> {
        if (this.response !== undefined) {
            return Promise.resolve(this.response);
        }

        return super.doFetch(url, init);
    }
}