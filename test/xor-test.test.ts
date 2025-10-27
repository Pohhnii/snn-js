import { expect, test } from "bun:test";
import {
    Generation,
    Individual,
    InputConverters,
    Jobs,
    Model,
    ModelBuilder,
    MutationConfig,
    OutputConverters,
    Pipeline,
    PipelineParameters,
    Spike,
} from "..";

test("xor test", () => {
    const xorInputs = [
        [new Spike(0, 0), new Spike(0, 10)],
        [new Spike(1, 0), new Spike(0, 10)],
        [new Spike(0, 0), new Spike(1, 10)],
        [new Spike(1, 0), new Spike(1, 10)],
    ];

    const xorShouldSpike = [false, true, true, false];

    const model = new ModelBuilder(2)
        .dense(5)
        .dense(1)
        .build();

    const epochs = 2000;
    const populationSize = 25;

    const generation = new Generation(
        model,
        new MutationConfig(),
        populationSize,
    );

    const evaluator = (individual: Individual<Model>) => {
        const model = individual.value;
        for (let i = 0; i < xorInputs.length; i++) {
            model.reset();
            const hasSpiked = model.forwardAll(xorInputs[i]!).length > 0;
            if (hasSpiked === xorShouldSpike[i]) individual.score++;
        }
    };

    for (let i = 0; i < epochs; i++) {
        generation.validate(evaluator).newGeneration();
    }

    const fittest = generation.fittest!;
    expect(fittest.score).toBe(4);

    for (let i = 0; i < xorInputs.length; i++) {
        fittest.value.reset();
        const hasSpiked = fittest.value.forwardAll(xorInputs[i]!).length > 0;
        expect(hasSpiked).toEqual(xorShouldSpike[i]!);
    }
});

test("xor test with pipeline", () => {
    const XOR_INPUTS = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
    ];

    const XOR_SHOULD_SPIKE = [false, true, true, false];

    const pipeline = new Pipeline([
        Jobs.convert(InputConverters.serialIndexedPosition()),
        Jobs.forwardModel(),
        Jobs.convert(OutputConverters.anySpike()),
    ]);

    const modelParam = (model: Model) => PipelineParameters.create(1, model);

    const baseModel = new ModelBuilder(2)
        .dense(5)
        .dense(1)
        .build();

    const epochs = 2000;
    const populationSize = 25;

    const generation = new Generation(
        baseModel,
        new MutationConfig(),
        populationSize,
    );

    const forwardPipeline = (
        individual: Individual<Model>,
        input: number[],
    ) => {
        const model = individual.value;
        model.reset();
        return pipeline.execute(input, [modelParam(model)]);
    };

    for (let i = 0; i < epochs; i++) {
        generation.validatePositiveHits(
            XOR_INPUTS,
            XOR_SHOULD_SPIKE,
            forwardPipeline,
        ).newGeneration();
    }

    const fittestIndividual = generation.fittest!;
    expect(fittestIndividual.score).toBe(4);
    const fittest = fittestIndividual.value;

    for (let i = 0; i < XOR_INPUTS.length; i++) {
        fittest.reset();
        const hasSpiked = pipeline.execute(XOR_INPUTS[i]!, [
            modelParam(fittest),
        ]);
        expect(hasSpiked).toEqual(XOR_SHOULD_SPIKE[i]!);
    }
});
