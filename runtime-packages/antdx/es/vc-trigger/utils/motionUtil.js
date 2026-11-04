export function getMotion({
  prefixCls,
  animation,
  transitionName
}) {
  if (animation) {
    return {
      name: `${prefixCls}-${animation}`
    };
  }
  if (transitionName) {
    return {
      name: transitionName
    };
  }
  return {};
}