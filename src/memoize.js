import { hash } from './hash';
import { mkCache } from './cache';

export function memoize(fn) {
    const cache = mkCache({ limit: 1 });

    return function () {
        const key = arguments;

        if (cache.has(key)) {
            return cache.get(key);
        } else {
            const result = fn.apply(null, arguments);
            return cache.set(key, result);
        }
    };
}
