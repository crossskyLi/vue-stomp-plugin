export const hook = (vm, target, func) => {
  const _hookTarget = vm[target];
  const hookFunc = (...args) => {
    func(vm, ...args);
    return _hookTarget.apply(vm, args)
  }
  vm[target] = hookFunc;
}