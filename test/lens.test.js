import expect from 'expect';

import { memoSelector } from '../src/index';
import { mock } from './utils/mock';

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
