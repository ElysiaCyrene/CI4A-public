class Keyframe {
  constructor(name, style) {
    this._keyframe = true;
    this.name = name;
    this.style = style;
  }
  getName(hashId = '') {
    return hashId ? `${hashId}-${this.name}` : this.name;
  }
}
export default Keyframe;