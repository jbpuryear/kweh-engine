import BitmapCharData from './BitmapCharData.js';


export default class BitmapFont {
  constructor() {
    this.texture = null;
    this.glyphs = new Map();
    this.lineHeight = -1;
  }
}


BitmapFont.ASCII = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';


BitmapFont.createMonospace = (texture, chars, charWidth, charHeight,
    cols = 0, rows = 0, x = 0, y = 0, spaceX = 0, spaceY = 0) => {
  const font = new BitmapFont();
  const glyphs = font.glyphs;
  const len = chars.length;
  let curChar = 0;
  let row = 0;
  while (curChar < len && row < rows) {
    let col = 0;
    let startX = x;
    while (curChar < len && col < cols) {
      const c = chars.charAt(curChar);
      curChar += 1;
      glyphs.set(c, new BitmapCharData(texture, startX, y, charWidth, charHeight));
      col += 1;
      startX += charWidth + spaceX;
    }
    row += 1;
    y += charHeight + spaceY;
  }
  font.texture = texture;
  font.lineHeight = charHeight;
  return font;
}
