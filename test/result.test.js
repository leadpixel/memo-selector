import expect from 'expect';

import { memoSelector } from '../src/index';
import { mock } from './utils/mock';

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

    it('returns a new value if the input object is modified (1)', () => {
        const state = { a: 1, b: 2 };
        const selector = memoSelector(
            [({ a }) => a, ({ b }) => b],
            (a, b) => a + b
        );

        const resultA = selector(state);
        const resultB = selector({ a: 10, b: 2 });
        expect(resultA === resultB).toEqual(false);
    });

    it('returns a new value if the input object is modified (2)', () => {
        const state = { a: 1, b: 2 };
        const selector = memoSelector(
            [({ a }) => a, ({ b }) => b],
            (a, b) => a + b
        );

        const resultA = selector(state);
        state.a = 10;
        const resultB = selector(state);
        expect(resultA === resultB).toEqual(false);
    });
});
