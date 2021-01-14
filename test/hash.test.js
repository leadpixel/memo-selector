import expect from 'expect';

import { hash } from '../src/hash';

describe('hash', () => {
    it('returns deterministic output for a given value', () => {
        const value = Math.random();
        const a = hash(value);
        const b = hash(value);
        expect(a).toEqual(b);
    });

    it('returns different outputs for different values', () => {
        const valueA = Math.random();
        const valueB = Math.random();
        const a = hash(valueA);
        const b = hash(valueB);
        expect(a).not.toEqual(b);
    });

    it('returns something reasonable for null', () => {
        const a = hash(null);
        expect(a).not.toEqual(null);
    });

    it('treats falsy values as differnet', () => {
        const a = hash(false);
        const b = hash(0);
        expect(a).not.toEqual(b);
    });

    it('ignores key order', () => {
        const a = hash({ j: 1, k: 2 });
        const b = hash({ k: 2, j: 1 });
        expect(a).toEqual(b);
    });

    it('respects value order', () => {
        const a = hash([1, 2]);
        const b = hash([2, 1]);
        expect(a).not.toEqual(b);
    });

    it('is fast enough', () => {
        const ONE_MILLION = 1000000;
        const input = { k: Math.random() };

        const start = new Date();
        for (let i = 0; i < ONE_MILLION; i++) {
            hash(input);
        }

        const end = new Date();

        console.log(end - start);
    });
});
