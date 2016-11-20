import './index.sass'
import { Observable, Scheduler } from 'rx'
import 'rx-dom'
import PaintCanvas from './paint_canvas'
import COLORS from 'constants/colors'
import { randomInt, replaceItem, flow } from 'utils'

const UNIT = 10
const WIDTH = 40
const HEIGHT = 40
const MOVE_RATE = 150
const SCORE_PER_EGG = 100

const CANVAS_WIDTH = WIDTH * UNIT
const CANVAS_HEIGHT = HEIGHT * UNIT

const TITLE_FONT_SIZE = CANVAS_WIDTH / 6
const SUBTITLE_FONT_SIZE = CANVAS_WIDTH / 20

const VALID_ARROW_KEYS = [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ]
const ARROW_KEY_TO_OFFSET = {
  ArrowUp: [ 0, -1 ],
  ArrowDown: [ 0, 1 ],
  ArrowLeft: [ -1, 0 ],
  ArrowRight: [ 1, 0 ],
}
const REVERSED_ARROW_KEY = {
  ArrowUp: 'ArrowDown',
  ArrowDown: 'ArrowUp',
  ArrowLeft: 'ArrowRight',
  ArrowRight: 'ArrowLeft',
}

const INIT_GAME_WORLD =
  {
    head: [ Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2) ],
    body: [
      [ 0, 1 ], [ 0, 1 ], [ 0, 1 ], [ 0, 1 ], [ 0, 1 ],
    ],
    eggs: [
      [ randomInt(0, WIDTH), randomInt(0, HEIGHT) ],
      [ randomInt(0, WIDTH), randomInt(0, HEIGHT) ],
      [ randomInt(0, WIDTH), randomInt(0, HEIGHT) ],
    ],
    isEggBeEaten: false,
    isCollision: false,
    score: 0,
  }

const keyup$ = Observable.fromEvent(document, 'keyup')
  .pluck('code')

const start$ = keyup$
  .filter((value) => value === 'Space')

const pressArrowKey$ = keyup$
  .filter((code) => VALID_ARROW_KEYS.indexOf(code) !== -1)

const manualMove$ = pressArrowKey$
  .skipUntil(start$)
  .distinctUntilChanged(null, (keyOne, keyTwo) => REVERSED_ARROW_KEY[keyOne] === keyTwo)

const intervalMove$ = Observable.interval(MOVE_RATE)
  .withLatestFrom(manualMove$, (_, step) => step)

const nextStep$ = manualMove$
  .merge(intervalMove$)
  .map((arrowKey) => ARROW_KEY_TO_OFFSET[arrowKey])

const worldChange$ = nextStep$
  .scan((world, step) => (
    flow([
      moveSnake(step),
      generateEggIfBeEaten,
      growWhenSnakeEatEgg,
      calculateScore,
      checkCollision,
    ])(world)
  ), INIT_GAME_WORLD)
  .startWith(INIT_GAME_WORLD)

function moveSnake (step) {
  return (world) => {
    const { head, body } = world

    return {
      ...world,
      head: [ head[0] + step[0], head[1] + step[1] ],
      body: [ [ -step[0], -step[1] ], ...body.slice(0, -1) ],
      tail: [ ...body.slice(body.length - 1) ],
    }
  }
}

function generateEggIfBeEaten (world) {
  const { head, eggs } = world

  let isEggBeEaten = false
  let newEggs = eggs

  eggs.forEach((egg, index) => {
    if (egg[0] === head[0] && egg[1] === head[1]) {
      newEggs = replaceItem(eggs, index, randomEggWithout([ ...eggs, ...wholeSnake(world) ]))
      isEggBeEaten = true
    }
  })

  return {
    ...world,
    eggs: newEggs,
    isEggBeEaten,
  }
}

function growWhenSnakeEatEgg (world) {
  const { body, tail, isEggBeEaten } = world

  const newBody = isEggBeEaten ? [ ...body, tail ] : body
  return {
    ...world,
    body: newBody,
  }
}

function calculateScore (world) {
  const { score, isEggBeEaten } = world

  return {
    ...world,
    isEggBeEaten: false,
    score: score + (isEggBeEaten ? SCORE_PER_EGG : 0),
  }
}

function randomEggWithout (rejectPoints = []) {
  let result
  let isValidPosition = false
  while (!isValidPosition) {
    result = [ randomInt(0, WIDTH), randomInt(0, HEIGHT) ]
    isValidPosition = rejectPoints.every((rejectPoint) => {
      return rejectPoint[0] !== result[0] && rejectPoint[1] !== result[1]
    })
  }

  return result
}

function checkCollision (world) {
  const { head, body } = world
  const [ headX, headY ] = head

  const isCollideWithWall = headX < 0 || headY < 0 || headX > WIDTH || headY > HEIGHT
  if (isCollideWithWall) return { ...world, isCollision: true }

  const isSnakeBiteItSelf = wholeSnake({ head, body })
    .slice(1)
    .some(([ jointX, jointY ]) => jointX === headX && jointY === headY)
  if (isSnakeBiteItSelf) return { ...world, isCollision: true }

  return world
}

const updateScene$ = Observable.generate(
    0, (x) => true, (x) => x + 1, (x) => x,
    Scheduler.requestAnimationFrame
  )
  .skipUntil(start$)
  .withLatestFrom(
    worldChange$,
    (_, world) => world
  )

const pc = new PaintCanvas('game', { width: CANVAS_WIDTH, height: CANVAS_HEIGHT })
startGame()

function startGame () {
  drawMenu()
  const startSubscription = start$.subscribe(resetScene)
  const updateSceneSubscription = updateScene$.subscribe(draw)

  window.disposeGame = () => {
    startSubscription.dispose()
    updateSceneSubscription.dispose()
  }
}

function drawMenu () {
  pc.clear(COLORS.bg.menu)
  pc.font(`bold ${CANVAS_WIDTH / 5}px monospace`)
  pc.fillStyle(COLORS.yellow)
  pc.fillText('Snake', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.4, CANVAS_WIDTH)

  pc.font(`${CANVAS_WIDTH / 20}px monospace`)
  pc.fillStyle(COLORS.green)
  pc.fillText('press "space" to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.6, CANVAS_WIDTH)
}

function gameOver (score) {
  if (window.disposeGame) window.disposeGame()

  fadeOutThan(() => {
    drawGameOver(score)
    start$.first().subscribe(startGame)
  })
}

function fadeOutThan (afterFinishFadeOut) {
  pc.context.globalAlpha = 0.2
  let count = 8
  const fadeOutTimer = setInterval(() => {
    pc.clear(COLORS.bg.menu)
    count--

    if (count === 0) {
      clearInterval(fadeOutTimer)
      pc.context.globalAlpha = 1
      pc.clear(COLORS.bg.menu)
      afterFinishFadeOut()
    }
  }, 100)
}

function drawGameOver (score) {
  pc.clear(COLORS.bg.menu)

  pc.font(`bold ${TITLE_FONT_SIZE}px monospace`)
  pc.fillStyle(COLORS.yellow)
  pc.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.4, CANVAS_WIDTH)

  pc.font(`${SUBTITLE_FONT_SIZE}px monospace`)
  pc.fillStyle(COLORS.green)
  pc.fillText(`your score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.6, CANVAS_WIDTH)
}

function draw ({ head, body, eggs, score, isCollision }) {
  if (isCollision) return gameOver(score)

  resetScene()
  drawEggs(eggs)
  drawSnake({ head, body })
  drawScore(score)
}

function resetScene () {
  pc.clear(COLORS.bg.gaming)
}

function drawEggs (eggs) {
  eggs.forEach((egg, _) => {
    pc.fillStyle(COLORS.yellow)
    pc.strokeStyle(COLORS.yellow)
    pc.fillRect(egg[0] * UNIT, egg[1] * UNIT, UNIT, UNIT)
    pc.strokeRect(egg[0] * UNIT, egg[1] * UNIT, UNIT, UNIT)
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
  pc.font('14px sans-serif')
  pc.fillStyle(COLORS.yellow)
  pc.context.textAlign = 'left'
  pc.context.fillText(`$ ${score}`, 10, 20)
}

function drawSnakeJoint (x, y) {
  pc.strokeStyle('green')
  pc.strokeRect(x * UNIT, y * UNIT, UNIT, UNIT)
}
