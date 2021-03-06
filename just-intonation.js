function primeFactors(n) {
    const factors = {};
    let divisor = 2;

    while (n >= 2) {
        if (n % divisor === 0) {
            if (!(divisor in factors)) {
                factors[divisor] = 0;
            }
            factors[divisor] += 1;
            n = n / divisor;
        } else {
            divisor++;
        }
    }
    return factors;
}

function toRad(deg) {
    return deg/180 * Math.PI;
}

let ROTATOR = 0;

const P2_X = () => Math.cos(toRad(P2_angle) + ROTATOR * Math.log2(2)) * (P2_len);
const P2_Y = () => Math.sin(toRad(P2_angle) + ROTATOR * Math.log2(2)) * (P2_len);
const P3_X = () => Math.cos(toRad(P3_angle) + ROTATOR * Math.log2(3)) * (P3_len);
const P3_Y = () => Math.sin(toRad(P3_angle) + ROTATOR * Math.log2(3)) * (P3_len);
const P5_X = () => Math.cos(toRad(P5_angle) + ROTATOR * Math.log2(5)) * (P5_len);
const P5_Y = () => Math.sin(toRad(P5_angle) + ROTATOR * Math.log2(5)) * (P5_len);
const P7_X = () => Math.cos(toRad(-P7_angle) + ROTATOR * Math.log2(7)) * (P7_len);
const P7_Y = () => Math.sin(toRad(-P7_angle) + ROTATOR * Math.log2(7)) * (P7_len);
const P11_X = () => Math.cos(toRad(-P11_angle) + ROTATOR * Math.log2(11)) * (P11_len);
const P11_Y = () => Math.sin(toRad(-P11_angle) + ROTATOR * Math.log2(11)) * (P11_len);

const dp2drotx = () => -P2_len * Math.log2(2) * Math.sin(toRad(P2_angle) + ROTATOR * Math.log2(2));
const dp2droty = () => P2_len * Math.log2(2) * Math.cos(toRad(P2_angle) + ROTATOR * Math.log2(2));
const dp3drotx = () => -P3_len * Math.log2(3) * Math.sin(toRad(P3_angle) + ROTATOR * Math.log2(3));
const dp3droty = () => P3_len * Math.log2(3) * Math.cos(toRad(P3_angle) + ROTATOR * Math.log2(3));
const dp5drotx = () => -P5_len * Math.log2(5) * Math.sin(toRad(P5_angle) + ROTATOR * Math.log2(5));
const dp5droty = () => P5_len * Math.log2(5) * Math.cos(toRad(P5_angle) + ROTATOR * Math.log2(5));
const dp7drotx = () => -P7_len * Math.log2(7) * Math.sin(toRad(-P7_angle) + ROTATOR * Math.log2(7));
const dp7droty = () => P7_len * Math.log2(7) * Math.cos(toRad(-P7_angle) + ROTATOR * Math.log2(7));
const dp11drotx = () => -P11_len * Math.log2(11) * Math.sin(toRad(-P11_angle) + ROTATOR * Math.log2(11));
const dp11droty = () => P11_len * Math.log2(11) * Math.cos(toRad(-P11_angle) + ROTATOR * Math.log2(11));

class HarmonicCoordinates {
    #p2; #p3; #p5; #p7; #p11;

    constructor(p2, p3, p5, p7, p11) {
        // Note, if USE_OCTAVE_REDUCED_PRIMES is true,
        // p3 represents powers of 3/2,
        // p5 - 5/4,
        // p7 - 7/4
        // p11 - 11/8
        this.#p2 = p2;
        this.#p3 = p3;
        this.#p5 = p5;
        this.#p7 = p7;
        this.#p11 = p11;
    }

    get p2() { return this.#p2; }

    /**
     * The absolute power of the prime 2 in the interval assuming no octave reduced primes.
     * Helpful for performing math calculations.
     */
    get p2absolute() {
        if (USE_OCTAVE_REDUCED_PRIMES)
            return this.#p2 - (this.#p3 + 2 * this.#p5 + 2 * this.#p7 + 3 * this.#p11);
        else
            return this.#p2;
    }
    get p3() { return this.#p3; }
    get p5() { return this.#p5; }
    get p7() { return this.#p7; }
    get p11() { return this.#p11; }

    add(hc) {
        return new HarmonicCoordinates(
            this.p2 + hc.p2,
            this.p3 + hc.p3,
            this.p5 + hc.p5,
            this.p7 + hc.p7,
            this.p11 + hc.p11);
    }

    subtract(hc) {
        return new HarmonicCoordinates(
            this.p2 - hc.p2,
            this.p3 - hc.p3,
            this.p5 - hc.p5,
            this.p7 - hc.p7,
            this.p11 - hc.p11);
    }

    static fromRatio(numerator, denominator) {
        let numFacs = primeFactors(numerator);
        let denFacs = primeFactors(denominator);
        let conjunction = numFacs;
        for (let denPrime in denFacs) {
            if (denPrime in conjunction) {
                conjunction[denPrime] -= denFacs[denPrime];
            } else {
                conjunction[denPrime] = -denFacs[denPrime];
            }
        }

        let p2 = 0,
            p3 = 0,
            p5 = 0,
            p7 = 0,
            p11 = 0;

        for (let prime in conjunction) {
            if (prime == 2)
                p2 = conjunction[prime];
            else if (prime == 3)
                p3 = conjunction[prime];
            else if (prime == 5)
                p5 = conjunction[prime];
            else if (prime == 7)
                p7 = conjunction[prime];
            else if (prime == 11)
                p11 = conjunction[prime];
            else
                throw 'Intervals above 11-limit are not currently supported';
        }
        if (USE_OCTAVE_REDUCED_PRIMES)
            p2 += p3 + p5 * 2 + p7 * 2 + p11 * 3;

        return new HarmonicCoordinates(p2, p3, p5, p7, p11);
    }

    toRatio() {
        let num = 1, den = 1;

        let primes = [2, 3, 5, 7, 11];
        let powers = this.toArrayAbsolute();
        for (let i = 0; i <= 5; i++) {
            if (powers[i] > 0)
                num *= primes[i] ** powers[i];
            else if (powers[i] < 0)
                den *= primes[i] ** (-powers[i]);
        }

        return [num, den]
    }

    toUnscaledCoords() {
        return [
            this.p2 * P2_X() + this.p3 * P3_X() + this.p5 * P5_X() + this.p7 * P7_X() + this.p11 * P11_X(),
            this.p2 * P2_Y() + this.p3 * P3_Y() + this.p5 * P5_Y() + this.p7 * P7_Y() + this.p11 * P11_Y()
        ]
    }

    /**
     * Use this to counter global translation when rotation happens and the
     * key center is far from the origin.
     * @returns {number[]}
     */
    get dUnscaledCoords_dRotation() {
        return [
            this.p2 * dp2drotx() + this.p3 * dp3drotx() + this.p5 * dp5drotx() + this.p7 * dp7drotx() + this.p11 * dp11drotx(),
            this.p2 * dp2droty() + this.p3 * dp3droty() + this.p5 * dp5droty() + this.p7 * dp7droty() + this.p11 * dp11droty()
        ]
    }

    toFrequency(fundamental) {
        return fundamental * 2**this.p2absolute * 3**this.p3 * 5**this.p5 * 7**this.p7 * 11**this.p11;
    }

    /**
     * Monzos always assume non-octave reduced primes.
     * @returns {string}
     */
    toMonzoString() {
        return `[ ${this.toArrayAbsolute().join(" ")} >`;
    }

    toString() {
        return this.toArray().toString();
    }

    toArray() {
        return [this.#p2, this.#p3, this.#p5, this.#p7, this.#p11];
    }

    /**
     * Same as `toArray()` but assuming no octave reduced primes.
     * Helpful for calculations.
     */
    toArrayAbsolute() {
        return [this.p2absolute, this.#p3, this.#p5, this.#p7, this.#p11]
    }

    /**
     * Check if this coordinate can be directly connected
     * to another coordinate in the lattice.
     * @param hc
     * @returns {number} 0 if not adjacent, otherwise, a positive/negative number equivalent to the
     *                   prime number that the two coordinates differ by.
     *                   E.g. if returns -5, that means that `hc` is a major third below `this`.
     */
    checkAdjacent(hc) {
        let diff = hc.subtract(this);
        let diffArr = diff.toArray();

        if (diffArr.some(x => Math.abs(x) > 1))
            return 0;

        let numOnes = 0;
        let prime = 0;
        for (let i = 0; i < diffArr.length; i++) {
            let x = diffArr[i];
            if (x === 1 || x === -1) {
                numOnes++;
                if (i === 0)
                    prime = 2;
                else if (i === 1)
                    prime = 3;
                else if (i === 2)
                    prime = 5;
                else if (i === 3)
                    prime = 7;
                else if (i === 4)
                    prime = 11;

                prime *= x; // invert number if negative.
            }
        }

        if (numOnes === 1)
            return prime;
        else
            return 0;
    }

    /**
     * A heuristic measure to evaluate the distance between two harmonic coordinates.
     * Use this to ensure that the harmonic context doesn't go haywire.
     * @param hc
     */
    harmonicDistance(hc) {
        return hc.subtract(this).harmonicDistanceFromOrigin();
    }

    harmonicDistanceFromOrigin() {
        return Math.abs(this.p2) * Math.log2(2) + Math.abs(this.p3) * Math.log2(3) +
            Math.abs(this.p5) * Math.log2(5) + Math.abs(this.p7) * Math.log2(7) + Math.abs(this.p11) * Math.log2(11);
    }

    equals(hc) {
        return this.p2 === hc.p2 && this.p3 === hc.p3 && this.p5 === hc.p5 && this.p7 === hc.p7 && this.p11 === hc.p11;
    }
}

function arrayOfHarmonicCoordinates(fractions) {
    let x = [];
    for (let [a, b] of fractions)
        x.push(HarmonicCoordinates.fromRatio(a, b));

    return x;
}

// Approximate ratios of 31 edo
// DO NOT MODIFY THE DICT VALUES DURING RUNTIME!!
//
// Currently commatic intervals are commented out for testing purposes
// 'commatic' intervals are assumed to be intervals that one would not instinctively think
// of using when 1/1 is the assumed 'root note'.
const RATIOS31 = {
    // do
    0: [HarmonicCoordinates.fromRatio(1, 1)],
    1: arrayOfHarmonicCoordinates([
        [45, 44],
        [49, 48],
        //[128, 125],
        [36, 35]
    ]),
    2: arrayOfHarmonicCoordinates([
        [25,24], [21,20], [22,21]
    ]),
    3: arrayOfHarmonicCoordinates([
        [16,15] //, [15,14]
    ]),
    4: arrayOfHarmonicCoordinates([
        [12, 11], [11, 10]//, [35, 32]
    ]),
    // re
    5: arrayOfHarmonicCoordinates([
        [9,8], [10,9]//, [28,25]
    ]),
    6: arrayOfHarmonicCoordinates([
        [8,7]//, [144,125]
    ]),
    7: arrayOfHarmonicCoordinates([
        [7,6]//, [75,64]
    ]),
    8: arrayOfHarmonicCoordinates([
        [6,5]//, [25,21]
    ]),
    9: arrayOfHarmonicCoordinates([
        [11,9]//, [27,22], [60, 49], [49, 40]
    ]),
    // mi
    10: arrayOfHarmonicCoordinates([
        [5,4]
    ]),
    11: arrayOfHarmonicCoordinates([
        [9,7], [14,11], [32,25]
    ]),
    12: arrayOfHarmonicCoordinates([
        [21,16]//, [125,96]
    ]),
    // fa
    13: arrayOfHarmonicCoordinates([
        [4,3]
    ]),
    14: arrayOfHarmonicCoordinates([
        [11,8], [15,11]
    ]),
    15: arrayOfHarmonicCoordinates([
        [7,5], [45,32], [25,18]
    ]),
    16: arrayOfHarmonicCoordinates([
        [10,7], [64,45], [36,25]
    ]),
    17: arrayOfHarmonicCoordinates([
        [16,11]//, [22,15]
    ]),
    // so
    18: arrayOfHarmonicCoordinates([
        [3,2]
    ]),
    19: arrayOfHarmonicCoordinates([
        [32,21]//, [192,125]
    ]),
    20: arrayOfHarmonicCoordinates([
        [14,9], [11,7], [25,16]
    ]),
    21: arrayOfHarmonicCoordinates([
        [8,5]
    ]),
    22: arrayOfHarmonicCoordinates([
        [18, 11], [44, 27]//, [49,30], [80,49]
    ]),
    // la
    23: arrayOfHarmonicCoordinates([
        [5,3]//, [42,25]
    ]),
    24: arrayOfHarmonicCoordinates([
        [12,7]//, [128,75]
    ]),
    25: arrayOfHarmonicCoordinates([
        [7,4]//, [125,72]
    ]),
    26: arrayOfHarmonicCoordinates([
        [16,9], [9,5]//, [25,14]
    ]),
    27: arrayOfHarmonicCoordinates([
        [11,6]//, [20,11], [64,35]
    ]),
    // ti
    28: arrayOfHarmonicCoordinates([
        [15,8]
    ]),
    29: arrayOfHarmonicCoordinates([
        [48,25], [40,21], [21,11]
    ]),
    30: arrayOfHarmonicCoordinates([
        [88,45], [96,49],
        //[125,64],
        [35,18]
    ])
};

function convertStepsToPossibleCoord(steps) {
    let octaves = math.floor(steps / 31);
    let dieses = mod(steps, 31);
    // the .add function causes this function to return an entirely new copy of HarmonicCoordinates
    // objects so it is now ok to modify the returned coordinates from this function.
    return RATIOS31[dieses].map(x => x.add(new HarmonicCoordinates(octaves, 0, 0, 0, 0)));
}

const DIESES_TO_FIFTHS_MAP = (() => {
    let x = {};
    let d = 0;
    for (let fifths = 0; fifths < 31; fifths++) {
        x[d] = fifths;
        d = (d + 18) % 31;
    }
    return x;
})();