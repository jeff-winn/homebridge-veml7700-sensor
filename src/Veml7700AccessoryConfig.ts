import { AccessoryConfig } from "homebridge";

export interface Veml7700AccessoryConfig extends AccessoryConfig {
    pollingInterval: number;
    url: string;
    minimum: number | undefined;
}

export enum AccessoryMode {
    contact = 1,
    light
}