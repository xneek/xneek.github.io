const frm = document.getElementById('frm');
const inf = document.getElementById('inf');
const qwr = document.getElementById('qwr');
const inp = document.getElementById('inp');
const btn = document.getElementById('btn');
const res = document.getElementById('res');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Level {
  constructor(min, max, operators, allowNegative) {
    this.min = min;
    this.max = max;
    this.operators = operators;
    this.allowNegative = allowNegative;
  }

  getParts() {
    const a = getRandomInt(this.min, this.max);
    const b = getRandomInt(this.min, this.max);
    const op = this.operators[Math.floor(Math.random() * this.operators.length)];
    return !this.allowNegative && a < b && ['-','/'].includes(op) ? [b, op, a] : [a, op, b];
  }
}

const levels = [
  new Level(1, 9, ['+', '-'], false),
  new Level(10, 99, ['+', '-'], false),
  new Level(100, 999, ['+', '-'], false),
  new Level(1, 9, ['+', '-', '*'], false),
  new Level(1, 99, ['+', '-', '*'], false),
  //new Level(1, 9, ['+', '-', '*', '/'], true),
];

const levelSize = 10;

let cur = -1;

let ms = 0;
let startTime = 0;
let dateStart;
let to;

const run = () => {
  cur += 1;
  const levelIndex = Math.floor(cur / levelSize);
  const lvl = levels[levelIndex];
  const parts = lvl.getParts();
  const res = eval(parts.join(''));
  inp.setAttribute('pattern', res);
  qwr.textContent = (parts.join(' ')+ ' = ?').replace('-', '−').replace('/', '÷').replace('*', '×');
  inf.textContent = `Level: ${levelIndex + 1}/${levels.length}; Question: ${cur + 1}/${levels.length * levelSize};`;
  inp.focus();
  startTime = performance.now();
  if (!dateStart) {
    dateStart = new Date();

  }
}

frm.addEventListener('submit', (e) => {
  e.preventDefault();
  ms += performance.now() - startTime;
  const time = new Date(new Date(ms).getTime() + (new Date().getTimezoneOffset() * 60 * 1000)).toLocaleTimeString();
  res.textContent = time;

  if (cur + 1 === levels.length * levelSize) {
    clearTimeout(to);
    const oldResults = JSON.parse(localStorage.getItem('mathGameResults') || '[]');
    const alertText = 'Done with result\n' + time + '\n================================\n' + oldResults.map((r) => r.join(' ')).join('\n');
    oldResults.push([dateStart, new Date(), time, Math.round(ms)]);
    localStorage.setItem('mathGameResults', JSON.stringify(oldResults));11

    alert(alertText);

    window.location.reload();
  }


  inp.value = '';
  run();
})

const updateTime = () => {
  const time = new Date(new Date(new Date() - dateStart).getTime() + (new Date().getTimezoneOffset() * 60 * 1000)).toLocaleTimeString();
        res.textContent = time;
}

btn.addEventListener('click', () => {
  inp.disabled = false;
  inp.value = '';
  run();
  updateTime();
  to = setInterval(updateTime, 1000);
})
