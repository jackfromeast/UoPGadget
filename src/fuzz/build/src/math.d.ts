/**
 * Rounds a uint8 up to the next higher power of two, with zero remaining at
 * zero. About 5x faster than Math.* ops and we abuse this function a lot.
 *
 * From the bit twiddling hacks site:
 * http://graphics.stanford.edu/~seander/bithacks.html#RoundUpPowerOf2
 */
export declare function roundUint8ToNextPowerOfTwo(value: number): number;
/**
 * Returns a random integer in the range [0, max)
 */
export declare function randInt(max: number): number;
/**
 * Choses a random value from the array and returns it.
 */
export declare function pickRandomOne<T>(arr: T[]): T;
export declare function uint32(n: number): number;
export declare function uint16(n: number): number;
export declare function uint8(n: number): number;
