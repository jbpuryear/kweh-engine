export default class Uniform {
  constructor(gl, loc, type) {
    this.location = loc;
    this.func = null;
    this.funcv = null;

    switch (type) {
      case gl.BOOL:
      case gl.INT:
      case gl.SAMPLER_2D:
        this.func = gl.uniform1i;
        this.funcv = gl.uniform1iv;
        break;
      case gl.BOOL_VEC2:
      case gl.INT_VEC2:
        this.func = gl.uniform2i;
        this.funcv = gl.uniform2iv;
        break;
      case gl.BOOL_VEC3:
      case gl.INT_VEC3:
        this.func = gl.uniform3i;
        this.funcv = gl.uniform3iv;
        break;
      case gl.BOOL_VEC4:
      case gl.INT_VEC4:
        this.func = gl.uniform4i;
        this.funcv = gl.uniform4iv;
        break;
      case gl.FLOAT:
        this.func = gl.uniform1f;
        this.funcv = gl.uniform1fv;
        break;
      case gl.FLOAT_VEC2:
        this.func = gl.uniform2f;
        this.funcv = gl.uniform2fv;
        break;
      case gl.FLOAT_VEC3:
        this.func = gl.uniform3f;
        this.funcv = gl.uniform3fv;
        break;
      case gl.FLOAT_VEC4:
        this.func = gl.uniform4f;
        this.funcv = gl.uniform4fv;
        break;
      case gl.FLOAT_MAT2:
        this.func = null;
        this.funcv = gl.uniformMatrix2fv;
        break;
      case gl.FLOAT_MAT3:
        this.func = null;
        this.funcv = gl.uniformMatrix3fv;
        break;
      case gl.FLOAT_MAT4:
        this.func = null;
        this.funcv = gl.uniformMatrix4fv;
        break;
    }
  }
}
