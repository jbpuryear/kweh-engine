const square = x => x * x;
const cube = x => x * x * x;


export const linear = x => x;


export const quadIn = square;

export const quadOut = x => 1 - quadIn(1 - x);

export const quadInOut = x => x < 0.5 ? 2 * quadIn(x) : 1 - quadIn(-2 * x + 2) / 2;


export const cubicIn = x => cube(x);

export const cubicOut = x => 1 - cubicIn(1 - x);

export const cubicInOut = x => x < 0.5 ? 4 * cubicIn(x) : 1 - cubicIn(-2 * x + 2) / 2;


export const quartIn = x => x * x * x * x;

export const quartOut = x => 1 - quartIn(1 - x);

export const quartInOut = x => x < 0.5 ? 8 * quartIn(x) : 1 - quartIn(-2 * x + 2) / 2;


export const quintIn = x => x * x * x * x * x;

export const quintOut = x => 1 - quintIn(1 - x);

export const quintInOut = x => x < 0.5 ? 16 * quintIn(x) : 1 - quintIn(-2 * x + 2) / 2;


export const expoIn = x => x === 0 ? 0 : Math.pow(2, 10 * x -10);

export const expoOut = x => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);

export const expoInOut = x => {
  if (x === 0) { return 0; }
  if (x === 1) { return 1; }
  if (x < 0.5) { return Math.pow(2, 20 * x - 10); }
  return 1 - Math.pow(2, -20 * x + 10) / 2;
}


export const sineIn = x => 1 - Math.cos(x * Math.PI / 2);

export const sineOut = x => Math.sin(x * Math.PI / 2);

export const sineInOut = x => -(Math.cos(x * Math.PI) - 1) / 2;


export const circIn = x => 1 - Math.sqrt(1 - x * x);

export const circOut = x => Math.sqrt(1 - square(x - 1));

export const circInOut = x => x < 0.5 ? (1 - Math.sqrt(1 - square(2 * x))) / 2 : (Math.sqrt(1 - square(-2 * x + 2)) + 1) / 2;


const back1 = 1.70158;
const back2 = back1 * 1.525;
const back3 = back1 + 1;

export const backIn = x => back3 * cube(x) - back1 * square(x);

export const backOut = x => 1 + back3 * cube(x - 1) + back1 * square(x - 1);

export const backInOut = x => x < 0.5
  ? square(2 * x) * ((back2 + 1) * 2 * x - back2) / 2
  : (square(2 * x - 2) * ((back2 + 1) * (x * 2 - 2) + back2) + 2) / 2;


const elastic1 = Math.PI * 2 / 3;
const elastic2 = Math.PI * 2 / 4.5;

export const elasticIn = x => {
  if (x === 0) { return 0; }
  if (x === 1) { return 1; }
  return -Math.pow(2, 10 * x -10) * Math.sin((x * 10 - 10.75) * elastic1);
}

export const elasticOut = x => {
  if (x === 0) { return 0; }
  if (x === 1) { return 1; }
  return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * elastic1) + 1;
}

export const elasticInOut = x => {
  if (x === 0) { return 0; }
  if (x === 1) { return 1; }
  if (x < 0.5) { return -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * elastic2)) / 2; }
  return Math.pow(2, -20 * x + 10) * Math.sin((20 * x -11.125) * elastic2) / 2 + 1;
}


const bounce1 = 7.5625;
const bounce2 = 2.75;

export const bounceIn = x => 1 - bounceOut(1 - x);

export const bounceOut = x => {
  if (x === 0) { return 0; }
  if (x === 1) { return 1; }

  if (x < 1 / bounce2) {
    return bounce1 * square(x);
  } else if (x < 2 / bounce2) {
    x -= 1.5 / bounce2;
    return bounce1 * square(x) + 0.75;
  } else if (x < 2.5 / bounce2) {
    x -= 2.25 / bounce2;
    return bounce1 * square(x) + 0.9375;
  } else { 
    x -= 2.625 /  bounce2;
    return bounce1 * square(x) + 0.984375;
  }
}

export const bounceInOut = x => x < 0.5 ? (1 - bounceOut(1 - 2 * x)) / 2 : (1 + bounceOut(2 * x - 1)) / 2;
