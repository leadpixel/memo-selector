import expect from 'expect';

import { memoSelector } from '../src/index';
import { mock } from './utils/mock';

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
        const selector = memoSelector([(x) => x.a, (x) => x.b], transformer);
        selector({ a: 1, b: 2 });
        selector({ a: 1, b: 2 });
        expect(transformer.callCount()).toEqual(1);
    });

    it('can store falsy values', () => {
        const selector = memoSelector([(x) => x.a, (x) => x.b], transformer);
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
