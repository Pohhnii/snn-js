import type { Spike } from "../dist";
import type { Converter } from "./converter";
import type { Model } from "./model";

export interface Job<InType, ParamType, OutType> {
    execute(input: InType, param?: ParamType): OutType;
}

export const Jobs = {
    create<I, P, O>(jobFunction: (input: I, param: P) => O): Job<I, P, O> {
        return { execute: jobFunction };
    },

    convert<InType, OutType>(
        converter: Converter<InType, OutType>,
    ): Job<InType, never, OutType> {
        return this.create((input) => converter.convert(input));
    },

    forwardModel(): Job<Spike[], Model, Spike[]> {
        return this.create((input, model) => model.forwardAll(input));
    },
};

export type PipelineJobArray<InType, OutType> = [
    Job<InType, any, any>,
    ...Job<any, any, any>[],
    Job<any, any, OutType>,
];

export interface PipelineParameter<T> {
    jobIndex: number;
    value: T;
}

export const PipelineParameters = {
    create<T>(jobIndex: number, value: T): PipelineParameter<T> {
        return { jobIndex, value };
    },
};

export class Pipeline<InType, OutType> {
    constructor(public jobs: PipelineJobArray<InType, OutType>) {}

    execute(input: InType, parameters: PipelineParameter<unknown>[]): OutType {
        const paramMap = this.parseParameters(parameters);
        let result: any = input;
        for (let i = 0; i < this.jobs.length; i++) {
            result = this.jobs[i]!.execute(result, paramMap.get(i));
        }
        return result;
    }

    private parseParameters(
        parameters: PipelineParameter<unknown>[],
    ): Map<number, unknown> {
        const paramMap = new Map();
        for (const { jobIndex, value } of parameters) {
            paramMap.set(jobIndex, value);
        }
        return paramMap;
    }
}
