import Frame from './Frame.js';


export default class NineSlice extends Frame {
  constructor(texture, x, y, width, height, mLeft, mTop = mLeft, mRight = mLeft, mBottom = mTop,
      offsetX = 0, offsetY = 0, sourceWidth = width, sourceHeight = height) {
    super(texture, x, y, width, height, offsetX, offsetY, sourceWidth, sourceHeight);
    const tWidth = texture.source.width;
    const tHeight = texture.source.height;
    this.mLeft = mLeft;
    this.mTop = mTop;
    this.mRight = mRight;
    this.mBottom = mBottom;
    this.um0 = this.u0 + mLeft / tWidth;
    this.um1 = this.u1 - mRight / tWidth;
    this.vm0 = this.v0 + mTop / tHeight;
    this.vm1 = this.v1 - mBottom / tHeight;
  }


  static fromFrame(frame, mLeft, mTop, mRight, mBottom) {
    return new NineSlice(frame.texture, frame.x, frame.y, frame.width, frame.height,
      mLeft, mTop, mRight, mBottom, frame.offsetX, frame.offsetY, frame.sourceWidth, frame.sourceHeight
    );
  }
}
