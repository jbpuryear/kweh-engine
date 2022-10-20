import Vec4 from './Vec4.js';


export default class Color extends Vec4 {
  get r() { return this.x; }
  set r(value) { this.x = value; }

  get g() { return this.y; }
  set g(value) { this.y = value; }

  get b() { return this.z; }
  set b(value) { this.z = value; }

  get a() { return this.w; }
  set a(value) { this.w = value; }


  getRgba() {
    return (this.x << 24) | (this.y << 16) | (this.z << 8) | this.w;
  }


  setRgba(value) {
    this.x = (value & 0xff000000) >>> 24;
    this.y = (value & 0xff0000) >>> 16;
    this.z = (value & 0xff00) >>> 8;
    this.w = value & 0xff;
  }
}


Color.CLEAR = new Color(0, 0, 0, 0);
Color.White = new Color(255, 255, 255, 255);
Color.Black = new Color(0, 0, 0, 255);
