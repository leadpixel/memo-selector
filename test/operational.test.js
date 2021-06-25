import expect from 'expect';

import { memoSelector } from '../src/index';
import { mock } from './utils/mock';

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
