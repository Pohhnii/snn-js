import { DenseLayer } from "./dense-layer";
import type { Layer } from "./layer";
import type { MutationConfig } from "./mutation";
import type { Spike } from "./spike";

export class Model implements Layer {
    private layers: Layer[];

    constructor(layers: Layer[]) {
        this.layers = layers;
    }
    reset(): void {
        this.layers.forEach((layer) => layer.reset());
    }

    copy(): Layer {
        return new Model(this.layers.map((layer) => layer.copy()));
    }

    mutated(config: MutationConfig): Layer {
        return new Model(this.layers.map((layer) => layer.mutated(config)));
    }

    forward(input: Spike): Spike[] {
        return this.forwardAll([input]);
    }

    forwardAll(inputs: Spike[]): Spike[] {
        let spikes = [...inputs];
        for (const layer of this.layers) {
            const resultSpikes = [];
            while (spikes.length > 0) {
                const spike = spikes.shift()!;
                const layerResult = layer.forward(spike);
                if (layerResult.length > 0) resultSpikes.push(...layerResult);
            }
            spikes = resultSpikes;
        }
        return spikes;
    }
}

export class ModelBuilder {
    private layers: Layer[] = [];
    private inputs: number;

    constructor(inputs: number) {
        this.inputs = inputs;
    }

    dense(nodes: number): ModelBuilder {
        this.layers.push(DenseLayer.create(this.inputs, nodes));
        this.inputs = nodes;
        return this;
    }

    build(): Model {
        return new Model(this.layers);
    }
}
