export function mock() {
    let count = 0;
    let returnValue;

    const calls = [];

    function x() {
        count++;
        calls.push({ args: [...arguments] });
        return returnValue;
    }

    x.returns = (v) => {
        returnValue = v;
        return x;
    };

    x.callCount = () => count;

    x.firstCall = () => {
        return calls[0];
    };

    return x;
}
