import { MutationConfig } from "./mutation";

export class Individual<T> {
    constructor(public value: T, public score: number = 0.0) {}
}

export interface Mutable {
    mutated(config: MutationConfig): Mutable;
}

export class Generation<T extends Mutable> {
    private population: Individual<T>[];
    private populationSize: number;
    private mutationConfig: MutationConfig;
    public fittest: Individual<T> | null = null;

    constructor(
        base: T,
        mutationConfig: MutationConfig = new MutationConfig(),
        populationSize: number = 5.0,
    ) {
        this.populationSize = populationSize;
        this.mutationConfig = mutationConfig;
        this.population = this.createPopulation(base);
    }

    private createPopulation(base: T): Individual<T>[] {
        const population = new Array(this.populationSize);
        for (let i = 0; i < this.populationSize; i++) {
            population[i] = new Individual(base.mutated(this.mutationConfig));
        }
        return population;
    }

    validate(evaluator: (individual: Individual<T>) => void): Generation<T> {
        this.population.forEach(evaluator);
        return this;
    }

    validatePositiveHits<InType, OutType>(
        inputs: InType[],
        outputs: OutType[],
        forwardFunction: (individual: Individual<T>, input: InType) => OutType,
    ): Generation<T> {
        return this.validate((individual) => {
            for (let i = 0; i < inputs.length; i++) {
                const result = forwardFunction(individual, inputs[i]!);
                if (result === outputs[i]) individual.score++;
            }
        });
    }

    newGeneration(): Generation<T> {
        let startIndex = 0;
        if (this.fittest == null) {
            this.fittest = this.population[startIndex++]!;
        }

        for (let i = startIndex; i < this.population.length; i++) {
            if (this.population[i]!.score > this.fittest.score) {
                this.fittest = this.population[i]!;
            }
        }

        this.population = this.createPopulation(this.fittest.value);

        return this;
    }
}
