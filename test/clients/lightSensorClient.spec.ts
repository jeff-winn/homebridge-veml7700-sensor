import { Mock, It } from 'moq.ts';
import { Response } from 'node-fetch';

import { Logger } from '../../src/diagnostics/logger';
import { LightSensorClientImplSpy } from './lightSensorClient.spy';

describe('LightSensorClientImpl', () => {
    let url;
    let log: Mock<Logger>;
    let target: LightSensorClientImplSpy;

    beforeEach(() => {
        url = 'http://localhost:8080/api/sensor/16';
        log = new Mock<Logger>();

        target = new LightSensorClientImplSpy(url, log.object());
    });

    it('should throw an error when empty response', async () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny(), It.IsAny())).returns(undefined);

        const r = new Response('', {
            headers: { },
            size: 0,
            status: 404,
            statusText: 'NOT_FOUND',
            timeout: 0,
            url: url
        });

        target.response = r;        

        await expect(target.inspect()).rejects.toThrowError();
    });

    it('should throw an error when not ok undefined response', async () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny(), It.IsAny())).returns(undefined);

        const r = new Response(undefined, {
            headers: { },
            size: 0,
            status: 500,
            statusText: 'INTERNAL_SERVER_ERROR',
            timeout: 0,
            url: url
        });

        target.response = r;        

        await expect(target.inspect()).rejects.toThrowError();
    });

    it('should return a lux response', async () => {
        log.setup(o => o.debug(It.IsAny(), It.IsAny(), It.IsAny())).returns(undefined);

        const r = new Response('{ "lux": 3.25, "whiteLight": 25.50 }', {
            headers: { },
            size: 0,
            status: 200,
            statusText: 'OK',
            timeout: 0,
            url: url
        });

        target.response = r;        

        await expect(target.inspect()).resolves.toEqual({
            lux: 3.25,
            whiteLight: 25.50
        });
    });
});