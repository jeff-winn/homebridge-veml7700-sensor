import { Veml7700Accessory } from '../src/accessory';
import { AccessoryServiceFactory } from '../src/primitives/accessoryServiceFactory';

export class Veml7700AccessorySpy extends Veml7700Accessory {
    public factory?: AccessoryServiceFactory;

    protected getServiceFactory(): AccessoryServiceFactory {
        if (this.factory !== undefined) {
            return this.factory;
        }

        return super.getServiceFactory();
    }

    public unsafeEnsureInitialized(): void {
        this.ensureInitialized();
    }

    public unsafeOnFinishedLaunching(): void {
        this.onFinishedLaunching();
    }

    public unsafeOnShutdown(): void {
        this.onShutdown();
    }
}