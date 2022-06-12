import GL_CONST from './GL_CONST.js';


export default class Attribute {
  constructor(name, size = 1, type = GL_CONST.get('FLOAT'), normalized = false) {
    this.name = name;
    this.size = size;
    this.type = type;
    this.normalized = normalized;
    this.location = -1;
    this.offset = -1;
  }
}
