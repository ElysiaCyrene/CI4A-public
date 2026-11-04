function createRef() {
  const func = node => {
    func.current = node;
  };
  return func;
}
export function fillRef(ref, node) {
  if (typeof ref === 'function') {
    ref(node);
  } else if (typeof ref === 'object' && ref && 'current' in ref) {
    ref.current = node;
  }
}
/**
 * Merge refs into one ref function to support ref passing.
 */
export function composeRef(...refs) {
  return node => {
    refs.forEach(ref => {
      fillRef(ref, node);
    });
  };
}
export default createRef;