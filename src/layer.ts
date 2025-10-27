import type { Mutable } from "./evolution";
import type { MutationConfig } from "./mutation";
import type { Spike } from "./spike";

export interface Layer extends Mutable {
    forward(spike: Spike): Spike[];

    reset(): void;

    copy(): Layer;

    mutated(config: MutationConfig): Layer;
}
