import Frame from '../render/Frame.js';
import Vec2 from '../math/Vec2.js';


export default class BitmapCharData extends Frame {
  constructor(texture, x, y, width, height, offX = 0, offY = 0) {
    super(texture, x, y, width, height);
    this.offset = new Vec2(offX, offY);
  }
}
