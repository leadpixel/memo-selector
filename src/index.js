import { hash } from './hash';
import { mkCache } from './cache';
import { memoize } from './memoize';

export function memoSelector(selectors, transformer) {
    const cache = mkCache();

    const fs = selectors.map(memoize);

    return memoize((input) => {
        const values = selectors.map((select) => select(input));
        const key = hash(values);

        if (cache.has(key)) {
            return cache.get(key);
        } else {
            const result = transformer(...values);
            return cache.set(key, result);
        }
    });
}
