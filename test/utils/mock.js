export function mock() {
    let count = 0;
    let returnValue;
    let operation;

    const calls = [];

    function self() {
        count++;
        calls.push({ args: [...arguments] });
      if (Boolean(operation)) {
        operation()
      }
        return returnValue;
    }

    self.returns = (v) => {
        returnValue = v;
        return self;
    };

    self.executes = (op) => {
      operation = op
        return self;
    };

    self.callCount = () => count;
    self.firstCall = () => calls[0];

    return self;
}
