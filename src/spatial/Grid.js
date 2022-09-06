import AABB from '../math/AABB.js';


export default class Grid extends AABB {
  constructor(x, y, columns, rows, cellWidth, cellHeight) {
    super(x, y, columns * cellWidth, rows * cellHeight);
    this.columns = columns;
    this.rows = rows;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.cells = new Array(rows * columns);

    this.cells.fill(null);
  }

  getCell(col, row) {
    return this.cells[row * this.columns + col] ?? null;
  }


  getCellAt(x, y) {
    const col = this.getColumn(x);
    const row = this.getRow(y);
    if (col < 0 || col >= this.columns || row < 0 || row >= this.rows) {
      return null;
    }
    return this.getCell(col, row);
  }


  getColumn(x) {
    return Math.floor((x - this.x) / this.cellWidth);
  }


  getRow(y) {
    return Math.floor((y - this.y) / this.cellHeight);
  }


  forOverlaps(aabb, func) {
    const left = Math.max(0, this.getColumn(aabb.x));
    const right = Math.min(this.columns - 1, this.getColumn(aabb.x + aabb.width));
    const top = Math.max(0, this.getRow(aabb.y));
    const bottom = Math.min(this.rows - 1, this.getRow(aabb.y + aabb.height))
    const columns = this.columns;
    const cells = this.cells;
    for (let row = top; row <= bottom; row += 1) {
      for (let col = left; col <= right; col += 1) {
        func(cells[row * columns + col]);
      }
    }
  }
}
