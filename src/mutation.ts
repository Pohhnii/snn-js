export class MutationConfig {
    constructor(public rate: number = 0.7, public strength: number = 1.0) {}
}

export class MutationHelper {
    static randomGaussian(mean = 1, stddev = 1) {
        // SOURCE: https://stackoverflow.com/a/36481059
        const u = 1 - Math.random(); // Converting [0,1) to (0,1]
        const v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        // Transform to the desired mean and standard deviation:
        return z * stddev + mean;
    }

    static mutate(original: number, config: MutationConfig) {
        if (Math.random() >= config.rate) return original;
        return this.randomGaussian(original, config.strength);
    }
}
