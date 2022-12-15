"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Rounds a uint8 up to the next higher power of two, with zero remaining at
 * zero. About 5x faster than Math.* ops and we abuse this function a lot.
 *
 * From the bit twiddling hacks site:
 * http://graphics.stanford.edu/~seander/bithacks.html#RoundUpPowerOf2
 */
function roundUint8ToNextPowerOfTwo(value) {
    value -= 1;
    value |= value >>> 1;
    value |= value >>> 2;
    value |= value >>> 4;
    value += 1;
    return value;
}
exports.roundUint8ToNextPowerOfTwo = roundUint8ToNextPowerOfTwo;
/**
 * Returns a random integer in the range [0, max)
 */
function randInt(max) {
    return Math.floor(Math.random() * max);
}
exports.randInt = randInt;
/**
 * Choses a random value from the array and returns it.
 */
function pickRandomOne(arr) {
    return arr[randInt(arr.length)];
}
exports.pickRandomOne = pickRandomOne;
function uint32(n) {
    return (n & 0xffffffff) >>> 0;
}
exports.uint32 = uint32;
function uint16(n) {
    return (n & 0xffff) >>> 0;
}
exports.uint16 = uint16;
function uint8(n) {
    return (n & 0xff) >>> 0;
}
exports.uint8 = uint8;
//# sourceMappingURL=math.js.map