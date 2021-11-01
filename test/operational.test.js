import expect from 'expect';

import { memoSelector } from '../src/index';
import { mock } from './utils/mock';

function measureDuration(op) {
    const start = new Date();
    op();
    const end = new Date();
    return end - start;
}

describe('operational', () => {
    it('runs expensive selectors', () => {
        function longLoop() {
            let i = 100000000; // 100 million
            let j;
            while (i-- > 0) {
                j = i;
            }
            return j;
        }

        const lens = mock().executes(longLoop);
        const selector = memoSelector([lens], () => {});

        const duration = measureDuration(() => {
            selector({ a: 1, b: 2 });
            selector({ a: 1, b: 2 });
        });
        expect(duration).toBeLessThan(250);
    });

    it('measuring performance of cache hit', () => {
        const transformer = mock();
        const lens = mock();
        const state = { a: 1, b: 2 };
        const selector = memoSelector([lens], transformer);

        const duration = measureDuration(() => {
            for (let i = 0; i < 1000000; i++) {
                selector(state);
            }
        });

        expect(duration).toBeLessThan(30);
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
