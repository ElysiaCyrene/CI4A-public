import raf from './raf';
function throttleByAnimationFrame(fn) {
  let requestId;
  const later = args => () => {
    requestId = null;
    fn(...args);
  };
  const throttled = (...args) => {
    if (requestId == null) {
      requestId = raf(later(args));
    }
  };
  throttled.cancel = () => {
    raf.cancel(requestId);
    requestId = null;
  };
  return throttled;
}
export default throttleByAnimationFrame;