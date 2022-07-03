import { Service } from 'homebridge';
import { AbstractAccessoryService } from './homebridge/abstractAccessoryService';

export interface RainSensor {
    getUnderlyingService(): Service | undefined;

    init(): void;

    start(): void;

    stop(): void;
}

export class RainSensorImpl extends AbstractAccessoryService implements RainSensor {
    public getUnderlyingService(): Service | undefined {
        return undefined;
    }

    public init(): void {
        // Do nothing.
    }

    public start(): void {
        // Do nothing.
    }

    public stop(): void {
        // Do nothing.
    }
}