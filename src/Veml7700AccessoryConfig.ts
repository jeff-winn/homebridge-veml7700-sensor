import { AccessoryConfig } from "homebridge";

export interface Veml7700AccessoryConfig extends AccessoryConfig {
    mode: AccessoryMode | undefined,  
    url: string;
    contact: ContactConfig | undefined
}

export interface ContactConfig {
    min: number | undefined;
    max: number | undefined;
}

export enum AccessoryMode {
    contact = 1,
    light
}