import { Spike } from "./spike";

export interface Converter<InType, OutType> {
    convert(input: InType): OutType;
}

export const Converters = {
    create<I, O>(converterFunction: (input: I) => O): Converter<I, O> {
        return { convert: converterFunction };
    },
};

export interface InputConverter<T> extends Converter<T, Spike[]> {
}

export const InputConverters = {
    create<I>(converterFunction: (input: I) => Spike[]): InputConverter<I> {
        return Converters.create(converterFunction);
    },

    serialIndexedPosition(
        timingIntervals: number = 10,
    ): InputConverter<number[]> {
        return this.create((inputs) =>
            inputs.map((value, index) =>
                new Spike(value, index * timingIntervals)
            )
        );
    },
};

export interface OutputConverter<T> extends Converter<Spike[], T> {
}

export const OutputConverters = {
    create<O>(converterFunction: (output: Spike[]) => O): OutputConverter<O> {
        return Converters.create(converterFunction);
    },

    anySpike(outputs?: number[]): OutputConverter<boolean> {
        if (!outputs) return this.create((outs) => outs.length > 0);
        const outputSet = new Set(outputs);
        return this.create((outs) =>
            outs.some((spike) => outputSet.has(spike.inputIndex))
        );
    },
};
