import Attribute from './Attribute.js';


export default class Shader {
  constructor(renderer, vSource, fSource, attributes) {
    this.renderer = renderer;
    this.vertexSource = vSource;
    this.fragmentSource = fSource;
    this.program = null;
    this.attributes = attributes.map(attrib => Object.assign(new Attribute(), attrib));

    renderer.on('webglcontextrestored', this._init, this);

    this._init(renderer);
  }


  destroy() {
    this.renderer.off('webglcontextrestored', this._init, this);
    this.renderer.deleteProgram(this.program);
    this.renderer = null;
    this.program = null;
  }


  _init(renderer) {
    const program = renderer.createProgram(this.vertexSource, this.fragmentSource);
    this.program = program;

    for (const attrib of this.attributes) {
      attrib.location = renderer.gl.getAttribLocation(program, attrib.name);
    }
  }
}
