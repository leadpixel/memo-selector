function mkNullStore() {
    return {
        has: () => false,
        get: () => null,
        set: (key, value) => value,
    };
}

function argumentsEqual(prev, next) {
    if (prev === null || next === null || prev.length !== next.length) {
        return false;
    }

    const length = prev.length;
    for (let i = 0; i < length; i++) {
        if (prev[i] !== next[i]) {
            return false;
        }
    }

    return true;
}

function mkSingleStore() {
    let storedKey = null;
    let storedValue = null;

    return {
        has: (key) => argumentsEqual(key, storedKey),
        get: (key) => storedValue,
        set: (key, value) => {
            storedKey = key;
            storedValue = value;
            return value;
        },
    };
}

function mkBoundedStore(limit) {
    const currentKeys = [];
    const keys = {};
    const cache = {};

    return {
        has: (key) => keys[key],
        get: (key) => cache[key],
        set: (key, value) => {
            keys[key] = true;
            cache[key] = value;
            currentKeys.push(key);

            if (currentKeys.length > limit) {
                const k = currentKeys.shift();
                delete keys[k];
                delete cache[k];
            }
            return value;
        },
    };
}

export function mkCache({ limit = 10 } = {}) {
    if (limit < 0) {
        throw new Error(
            'requested limit lower than 0, unable to construct store'
        );
    }

    if (limit === 0) {
        return mkNullStore();
    } else if (limit === 1) {
        return mkSingleStore();
    } else {
        return mkBoundedStore(limit);
    }
}
