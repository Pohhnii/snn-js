import { type MutationConfig, MutationHelper } from "./mutation";
import type { Spike } from "./spike";

export class Neuron {
    private static readonly THRESHOLD = 1.0;
    private static readonly RESET_POTENTIAL = -0.1;
    private static readonly LEAKING_RATE = 0.99;

    private potential: number = 0.0;
    private lastPreSpikeTiming: number = 0.0;
    private weights: number[];

    /**
     * Default constructor of a spiking neuron.
     * @param weights Weights of the neuron
     */
    constructor(weights: number[]) {
        this.weights = weights;
    }

    static create(inputs: number) {
        const weights = new Array(inputs);
        for (let i = 0; i < inputs; i++) {
            weights[i] = 0.0;
        }
        return new Neuron(weights);
    }

    /**
     * Forwards a spike through the neuron.
     * @param spike Input spike
     * @returns whether the neuron fires
     */
    forward(spike: Spike): boolean {
        const delay = spike.timing - this.lastPreSpikeTiming;
        this.potential = this.potential * Math.pow(Neuron.LEAKING_RATE, delay) +
            this.weights[spike.inputIndex]!;

        if (this.potential < Neuron.THRESHOLD) return false;

        this.potential = Neuron.RESET_POTENTIAL;
        this.lastPreSpikeTiming = spike.timing;

        return true;
    }

    /**
     * Resets the neuron. Potential and last pre-spike timings are set to 0.
     */
    reset() {
        this.potential = 0.0;
        this.lastPreSpikeTiming = 0.0;
    }

    copy(): Neuron {
        return new Neuron([...this.weights]);
    }

    mutated(config: MutationConfig): Neuron {
        const mutatedWeights = this.weights.map((w) =>
            MutationHelper.mutate(w, config)
        );
        return new Neuron(mutatedWeights);
    }
}
