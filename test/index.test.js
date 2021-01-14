import expect from 'expect';

import { memoSelector } from '../src/index';
import { mock } from './mock';

describe('MemoSelector', () => {
    describe('lens', () => {
        it('calls the lens', () => {
            const lens = mock();
            const selector = memoSelector([lens], () => {});
            selector({ a: 1, b: 2 });
            expect(lens.callCount()).toEqual(1);
        });

        it('does not call the lens again for the same arguments (by value)', () => {
            const lens = mock();
            const selector = memoSelector([lens], () => {});
            selector({ a: 1, b: 2 });
            selector({ a: 1, b: 2 });
            expect(lens.callCount()).toEqual(1);
        });

        it('calls the lens again if the arguments change', () => {
            const lens = mock();
            const selector = memoSelector([lens], () => {});
            selector({ a: 1, b: 2 });
            selector({ a: 3, b: 2 });
            expect(lens.callCount()).toEqual(2);
        });
    });

    describe('transformer', () => {
        let transformer;

        beforeEach(() => {
            transformer = mock();
        });

        it('runs the associated transformer on first call', () => {
            const selector = memoSelector([], transformer);
            selector();
            expect(transformer.callCount()).toEqual(1);
        });

        it('does not call the transformer if selectors do not change (no-op)', () => {
            const selector = memoSelector([], transformer);
            selector();
            selector();
            expect(transformer.callCount()).toEqual(1);
        });

        it('does not call the transformer if selectors do not change (identity)', () => {
            const selector = memoSelector([(x) => x], transformer);
            selector('key');
            selector('key');
            expect(transformer.callCount()).toEqual(1);
        });

        it('does not call the transformer if selectors do not change (ignoring input)', () => {
            const selector = memoSelector([], transformer);
            selector('keyA');
            selector('keyB');
            expect(transformer.callCount()).toEqual(1);
        });

        it('calls the transformer if selected inputs change', () => {
            const selector = memoSelector([(x) => x], transformer);
            selector('keyA');
            selector('keyB');
            expect(transformer.callCount()).toEqual(2);
        });

        it('uses the selector function to determine key values (same)', () => {
            const selector = memoSelector([(x) => x.key], transformer);
            selector({ key: 'a' });
            selector({ key: 'a' });
            expect(transformer.callCount()).toEqual(1);
        });

        it('uses the selector function to determine key values (different)', () => {
            const selector = memoSelector([(x) => x.key], transformer);
            selector({ key: 'a' });
            selector({ key: 'b' });
            expect(transformer.callCount()).toEqual(2);
        });

        it('passes the result of the accessors to the transformation function', () => {
            // NOTE: don't use constant functions as selectors
            const selector = memoSelector([() => 1, () => 2], transformer);
            selector();
            expect(transformer.firstCall().args).toEqual([1, 2]);
        });

        it('builds the store key from all selectors', () => {
            const selector = memoSelector(
                [(x) => x.a, (x) => x.b],
                transformer
            );
            selector({ a: 1, b: 2 });
            selector({ a: 1, b: 2 });
            expect(transformer.callCount()).toEqual(1);
        });

        it('can store falsy values', () => {
            const selector = memoSelector(
                [(x) => x.a, (x) => x.b],
                transformer
            );
            selector({ a: false, b: null });
            selector({ a: false, b: null });
            expect(transformer.callCount()).toEqual(1);
        });

        it('stores historic values', () => {
            const selector = memoSelector([(x) => x], transformer);
            selector('keyA');
            selector('keyB');
            selector('keyA');
            expect(transformer.callCount()).toEqual(2);
        });

        it('serializes objects to use as keys', () => {
            const selector = memoSelector([(x) => x], transformer);
            selector({ x: { values: [1, 2, 3] } });
            selector({ x: { values: [1, 2, 3] } });
            expect(transformer.callCount()).toEqual(1);
        });

        it('identifies differences in nested objects', () => {
            const selector = memoSelector([(x) => x], transformer);
            selector({ x: { values: [1, 2, 3] } });
            selector({ x: { values: [1, 2, 4] } });
            expect(transformer.callCount()).toEqual(2);
        });

        it('does not share a store between selectors', () => {
            const selectorA = memoSelector([], transformer);
            const selectorB = memoSelector([], transformer);
            selectorA();
            selectorB();
            expect(transformer.callCount()).toEqual(2);
        });
    });

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

        it('returns a new value if the input object is modified', () => {
            const state = { a: 1, b: 2 };
            const selector = memoSelector(
                [({ a }) => a, ({ b }) => b],
                (a, b) => a + b
            );

            const resultA = selector(state);
            const resultB = selector({ a: 10, b: 2 });
            expect(resultA === resultB).toEqual(false);
        });

        it('returns a new value if the input object is modified', () => {
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

    describe('operational', () => {
        it('performance of cache hit', () => {
            const transformer = mock();
            const lens = mock();
            const state = { a: 1, b: 2 };
            const selector = memoSelector([lens], transformer);

            const start = new Date();
            for (let i = 0; i < 1000000; i++) {
                selector(state);
            }

            const end = new Date();
            console.log(end - start);
            expect(end - start).toBeLessThan(30);
        });

        it.skip('memory usage', () => {
            const state = { a: 1, b: 2 };
            const selector = memoSelector(
                [(obj) => obj.a, (obj) => obj.b],
                (a, b) => a + b
            );

            for (let i = 0; i < 1000; i++) {
                // pre-cache
                selector({ ...state, a: Math.random() });
            }

            let vNew, vOld;
            global.gc();
            const start = process.memoryUsage().heapUsed;
            console.log(process.memoryUsage().heapUsed - start);

            let up = 0;
            let down = 0;
            let same = 0;

            for (let i = 0; i < 1000; i++) {
                selector({ a: Math.random(), b: 2 });

                if (i % 20 === 0) {
                    global.gc();
                    vNew = process.memoryUsage().heapUsed - start;
                    if (vNew > vOld) {
                        up++;
                    } else if (vNew < vOld) {
                        down++;
                    } else {
                        same++;
                    }
                    vOld = vNew;
                }
            }

            console.log({ up, down, same });
            expect(same).toBeLessThan(up + down);
        }).timeout(10000);
    });
});
