import GL_CONST from './GL_CONST.js';
const TYPE_SIZE = new Map([
  [ GL_CONST.get('BYTE'), 1 ],
  [ GL_CONST.get('UNSIGNED_BYTE'), 1 ],
//  [ GL_CONST.get('SHORT'), 2 ],
//  [ GL_CONST.get('UNSIGNED_SHORT'), 2 ],
  [ GL_CONST.get('INT'), 4 ],
  [ GL_CONST.get('UNSIGNED_INT'), 4 ],
  [ GL_CONST.get('FLOAT'), 4 ],
]);


export default class Shader {
  constructor(renderer, vSource, fSource, attributes = []) {
    this.renderer = renderer;
    this.program = null;
    this.attributes = attributes;
    this.uniforms = null;
    this.vertexSize = 0;
    this.vertexSource = vSource;
    this.fragmentSource = fSource;

    renderer.on('webglcontextrestored', this._init, this);
    
    this._init(renderer);
  }


  destroy() {
    this.renderer.deleteProgram(this.program);
    this.renderer = null;
    this.program = null;
  }


  _init(renderer) {
    const program = renderer.createProgram(this.vertexSource, this.fragmentSource);
    this.program = program;

    let offset = 0;
    for (const attrib of this.attributes) {
      attrib.offset = offset;
      attrib.location = renderer.gl.getAttribLocation(program, attrib.name);

      // Maintain 32 bit alignment to improve performance.
      // Bytes and byte vectors occupy one 32 bit (4 byte) slot.
      offset += TYPE_SIZE.get(attrib.type) === 4 ? attrib.size * 4 : 4;
    }
    this.vertexSize = offset;
  }
}
