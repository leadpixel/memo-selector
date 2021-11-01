import expect from 'expect';

import { memoSelector } from '../src/index';
import { mock } from '../test/utils/mock';

describe('lens', () => {
    it('calls the lens', () => {
        const lens = mock();
        const selector = memoSelector([lens], () => {});
        selector({ a: 1, b: 2 });
        expect(lens.callCount()).toEqual(1);
    });

    it('does not call the lens again for the same arguments (by reference)', () => {
        const lens = mock();
        const selector = memoSelector([lens], () => {});
        const obj = { a: 1, b: 2 };
        selector(obj);
        selector(obj);
        expect(lens.callCount()).toEqual(1);
    });

    it('does not call the lens again for the same arguments (by value)', () => {
        const lens = mock();
        const selector = memoSelector([lens], () => {});
        selector({ a: 1, b: 2 });
        selector({ a: 1, b: 2 });
        expect(lens.callCount()).toEqual(1);
    });
});
