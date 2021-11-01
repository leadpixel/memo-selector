import expect from 'expect';

import { memoSelector } from '../src/index';

describe('result', () => {
    it('returns the result of the transformation', () => {
        const value = Math.random();
        const selector = memoSelector([], () => value);
        const result = selector();
        expect(result).toEqual(value);
    });

    it('combines multiple lenses', () => {
        const selector = memoSelector(
            [(x) => x.a, (x) => x.b],
            (a, b) => a + b
        );
        const result = selector({ a: 1, b: 2 });
        expect(result).toEqual(3);
    });

    it('uses complex objects as keys (returns same result)', () => {
        const selector = memoSelector([(x) => x], (x) => x);
        const resultA = selector({ key: 'some-key' });
        const resultB = selector({ key: 'some-key' });
        expect(resultA).toEqual(resultB);
    });

    it('uses complex objects as keys (returns different result)', () => {
        const selector = memoSelector([(x) => x], (x) => x);
        const resultA = selector({ key: 'some-key' });
        const resultB = selector({ key: 'other-key' });
        expect(resultA).not.toEqual(resultB);
    });

    it('recalculates if the input object has different values', () => {
        const selector = memoSelector(
            [({ a }) => a, ({ b }) => b],
            (a, b) => a + b
        );

        const resultA = selector({ a: 1, b: 2 });
        const resultB = selector({ a: 1, b: 20 });
        expect(resultA === resultB).toEqual(false);
    });

    it('only uses lens targets to calculate result', () => {
        const selector = memoSelector([({ a }) => a], (x) => x);

        const resultA = selector({ a: 1, b: 2 });
        const resultB = selector({ a: 1, b: 20 });
        expect(resultA === resultB).toEqual(true);
    });

    it.skip('recalculates if the input object is modified', () => {
        const selector = memoSelector(
            [({ a }) => a, ({ b }) => b],
            (a, b) => a + b
        );

        const state = { a: 1, b: 2 };
        const resultA = selector(state);
        state.a = 10;
        const resultB = selector(state);
        expect(resultA === resultB).toEqual(false);
    });
});
