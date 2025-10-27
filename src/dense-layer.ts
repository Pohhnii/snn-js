import type { Layer } from "./layer";
import type { MutationConfig } from "./mutation";
import { Neuron } from "./neuron";
import { Spike } from "./spike";

export class DenseLayer implements Layer {
    private neurons: Neuron[];

    constructor(neurons: Neuron[]) {
        this.neurons = neurons;
    }

    reset(): void {
        this.neurons.forEach((neuron) => neuron.reset());
    }

    static create(inputs: number, nodes: number): DenseLayer {
        const neurons = new Array(nodes);
        for (let i = 0; i < nodes; i++) {
            neurons[i] = Neuron.create(inputs);
        }
        return new DenseLayer(neurons);
    }

    copy(): Layer {
        return new DenseLayer(this.neurons.map((neuron) => neuron.copy()));
    }

    mutated(config: MutationConfig): Layer {
        return new DenseLayer(
            this.neurons.map((neuron) => neuron.mutated(config)),
        );
    }

    forward(spike: Spike): Spike[] {
        const postSpikes = [];
        for (let i = 0; i < this.neurons.length; i++) {
            const hasSpiked = this.neurons[i]!.forward(spike);
            if (hasSpiked) postSpikes.push(new Spike(i, spike.timing));
        }
        return postSpikes;
    }
}
