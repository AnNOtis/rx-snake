import './index.sass'
import { Observable, Scheduler } from 'rx'
import 'rx-dom'
import PaintCanvas from './paint_canvas'
import COLORS from 'constants/colors'
import { replaceItem, flow } from 'utils'

const unit = 10
const width = 40
const height = 40
const moveRate = 300
const SCORE_PER_EGG = 100

const BG = {
  menu: '#345',
  gaming: '#333',
}

const INIT_GAME_WORLD =
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
    eggs: [
      [ rand(0, width), rand(0, height) ],
      [ rand(0, width), rand(0, height) ],
      [ rand(0, width), rand(0, height) ],
    ],
    isEggBeEaten: false,
    score: 0,
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

const worldChange$ = nextStep$
  .scan((world, step) => {
    return flow([
      moveSnake(step),
      generateEggIfBeEaten,
      calculateScore,
    ])(world)
  }, INIT_GAME_WORLD)
  .startWith(INIT_GAME_WORLD)

function moveSnake (step) {
  return (world) => {
    const { head, body } = world

    return {
      ...world,
      head: [ head[0] + step[0], head[1] + step[1] ],
      body: [ [ -step[0], -step[1] ], ...body.slice(0, -1) ],
    }
  }
}

function generateEggIfBeEaten (world) {
  const head = world.head
  let eggs = world.eggs
  let isEggBeEaten = false

  eggs.forEach((egg, index) => {
    if (egg[0] === head[0] && egg[1] === head[1]) {
      eggs = replaceItem(eggs, index, randomEggWithout([ ...eggs, ...wholeSnake(world) ]))
      isEggBeEaten = true
    }
  })

  return { ...world, eggs, isEggBeEaten }
}

function calculateScore (world) {
  const {
    score,
    isEggBeEaten,
  } = world

  return {
    ...world,
    isEggBeEaten: false,
    score: score + (isEggBeEaten ? SCORE_PER_EGG : 0),
  }
}

function randomEggWithout (rejectPoints = []) {
  let isAcceptResult = false
  let result
  while (!isAcceptResult) {
    result = [ rand(0, width), rand(0, height) ]
    isAcceptResult = rejectPoints.every((rejectPoint) => {
      return rejectPoint[0] !== result[0] && rejectPoint[1] !== result[1]
    })
  }

  return result
}

const updateScene$ = Observable.generate(
    0,
    function (x) { return true },
    function (x) { return x + 1 },
    function (x) { return x },
    Scheduler.requestAnimationFrame
  )
  .skipUntil(start$)
  .withLatestFrom(
    worldChange$,
    (_, world) => world
  )

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

function draw ({ head, body, eggs, score }) {
  resetScene()
  drawEggs(eggs)
  drawSnake({ head, body })
  drawScore(score)
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
  wholeSnake(snake).forEach((position) => {
    drawSnakeJoint(position[0], position[1])
  })
}

function wholeSnake ({ head, body }) {
  const wholeSnake = []

  ;[ [ 0, 0 ], ...body ].reduce((acc, current) => {
    const position = [
      acc[0] + current[0],
      acc[1] + current[1],
    ]
    wholeSnake.push(position)
    return position
  }, head)

  return wholeSnake
}

function drawScore (score) {
  pc.context.font = '14px sans-serif'
  pc.context.fillStyle = COLORS.yellow
  pc.context.fillText(`$ ${score}`, 10, 20)
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
