import Attribute from './Attribute.js';
import Uniform from './Uniform.js';


export default class Shader {
  constructor(renderer, vSource, fSource, attributes) {
    this.renderer = renderer;
    this.vertexSource = vSource;
    this.fragmentSource = fSource;
    this.program = null;
    this.attributes = attributes.map(attrib => Object.assign(new Attribute(), attrib));
    this.uniforms = null;

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
    const gl = renderer.gl;
    const program = renderer.createProgram(this.vertexSource, this.fragmentSource);
    const uniforms = new Map();
    this.uniforms = uniforms;
    this.program = program;

    for (const attrib of this.attributes) {
      attrib.location = renderer.gl.getAttribLocation(program, attrib.name);
    }

    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i += 1) {
      const info = gl.getActiveUniform(program, i);
      if (info) {
        const loc = gl.getUniformLocation(program, info.name);
        if (location !== null) {
          uniforms.set(info.name, new Uniform(gl, loc, info.type));
        }

        const bracket = info.name.indexOf('[0]');
        if (bracket > 0) {
          const name = info.name.substring(0, bracket);
          uniforms.set(name, new Uniform(gl, loc, info.type));
        }
      }
    }
  }
}
