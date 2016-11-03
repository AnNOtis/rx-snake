import './index.sass'
import { Observable } from 'rx'
import PaintCanvas from './paint_canvas'
import COLORS from 'constants/colors'

const unit = 10
const width = 40
const height = 40
const moveRate = 100
const fps = 40

const BG = {
  menu: '#345',
  gaming: '#333',
}

const INIT_SNAKE =
  {
    head: [ Math.floor(width / 2), Math.floor(height / 2) ],
    body: [
      [ 0, 1 ],
      [ 0, 1 ],
      [ 0, 1 ],
      [ 0, 1 ],
      [ 0, 1 ],
      [ 0, 1 ],
      [ 0, 1 ],
      [ 0, 1 ],
    ],
  }

const keyup$ = Observable.fromEvent(document, 'keyup')
  .pluck('code')

const start$ = keyup$
  .filter((value) => value === 'Space')

const pressArrowKey$ = keyup$
  .filter(isValidArrowKeyCode)

const manualMove$ = pressArrowKey$
  .skipUntil(start$)
  .distinctUntilChanged(null, isReversedArrowKey)

const intervalMove$ = Observable.interval(moveRate)
  .withLatestFrom(manualMove$, (_, step) => step)

const nextStep$ = manualMove$
  .merge(intervalMove$)
  .map(mappingCodeToOffset)

const snakeMoved$ = nextStep$
  .scan((snake, step) => {
    const { head, body } = snake

    return {
      head: [ head[0] + step[0], head[1] + step[1] ],
      body: [ [ -step[0], -step[1] ], ...body.slice(0, -1) ],
    }
  }, INIT_SNAKE)
  .startWith(INIT_SNAKE)

const eggs$ = Observable.of([
    [ rand(0, width), rand(0, height) ],
    [ rand(0, width), rand(0, height) ],
    [ rand(0, width), rand(0, height) ],
])

const updateScene$ = Observable.interval(fps)
  .skipUntil(start$)
  .withLatestFrom(snakeMoved$, eggs$, (_, snake, eggs) => [ snake, eggs ])

const pc = prepareCanvas()
drawMenu()

start$.subscribe(resetScene)
updateScene$.subscribe(draw)

function prepareCanvas () {
  return new PaintCanvas(
    document.getElementById('game'),
    { width: unit * width, height: unit * height }
  )
}

function drawMenu () {
  pc.clear(BG.menu)
}

function resetScene () {
  pc.clear(BG.gaming)
}

function draw ([ snake, eggs ]) {
  resetScene()
  drawEggs(eggs)
  drawSnake(snake)
}

function drawEggs (eggs) {
  eggs.forEach((egg, _) => {
    pc.fillStyle(COLORS.red)
    pc.strokeStyle(COLORS.yellow)
    pc.fillRect(egg[0] * unit, egg[1] * unit, unit, unit)
    pc.strokeRect(egg[0] * unit, egg[1] * unit, unit, unit)
  })
}

function drawSnake (snake) {
  const { head, body } = snake

  ;[ [ 0, 0 ], ...body ].reduce((acc, current) => {
    const position = [
      acc[0] + current[0],
      acc[1] + current[1],
    ]
    drawSnakeJoint(position[0], position[1])
    return position
  }, head)
}

function drawSnakeJoint (x, y) {
  pc.strokeStyle('green')
  pc.strokeRect(x * unit, y * unit, unit, unit)
}

function mappingCodeToOffset (code) {
  const mapping = {
    'ArrowUp': [ 0, -1 ],
    'ArrowDown': [ 0, 1 ],
    'ArrowLeft': [ -1, 0 ],
    'ArrowRight': [ 1, 0 ],
  }

  return mapping[code]
}

function isValidArrowKeyCode (code) {
  return [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ].indexOf(code) !== -1
}

function isReversedArrowKey (keyOne, KeyTwo) {
  const reversedKeyMapping = {
    ArrowUp: 'ArrowDown',
    ArrowDown: 'ArrowUp',
    ArrowLeft: 'ArrowRight',
    ArrowRight: 'ArrowLeft',
  }

  return reversedKeyMapping[keyOne] === KeyTwo
}

function rand (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}
