export default class Frame {
  constructor(texture, x, y, width, height, offsetX = 0, offsetY = 0, sourceWidth = width, sourceHeight = height) {
    const tWidth = texture.source.width;
    const tHeight = texture.source.height;
    this.texture = texture;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.u0 = x / tWidth;
    this.v0 = y / tHeight;
    this.u1 = (x + width) / tWidth;
    this.v1 = (y + height) / tHeight;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.sourceWidth = sourceWidth;
    this.sourceHeight = sourceHeight;
    this.key = '';
  }
}
