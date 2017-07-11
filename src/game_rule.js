import {
  createArray,
  randomInt,
  replaceItem,
  isObject, isArray, isInteger,
} from 'utils'

const SCORE_PER_EGG = 100
const SPEED_LEVELS = [ 500, 400, 300, 250, 200, 150, 125, 100, 75, 50 ]

export function levelMapToSpeed (level) {
  let speedLevel = level - 1
  if (speedLevel < 0) {
    speedLevel = 0
  } else if (speedLevel > SPEED_LEVELS.length - 1) {
    speedLevel = SPEED_LEVELS.length - 1
  }
  return SPEED_LEVELS[speedLevel]
}

export function nextEggs (eggs, deletedEgg, snake, worldWidth, worldHeight) {
  return replaceItem(
    eggs,
    deletedEgg,
    randomEggWithout([ ...eggs, ...wholeSnake(snake) ])
  )

  function randomEggWithout (rejectPoints = []) {
    let result
    let isValidPosition = false
    while (!isValidPosition) {
      result = [ randomInt(0, worldWidth), randomInt(0, worldHeight) ]
      isValidPosition = rejectPoints.every((rejectPoint) => {
        return rejectPoint[0] !== result[0] && rejectPoint[1] !== result[1]
      })
    }

    return result
  }
}

export function safeWorld (snake, eggs, score) {
  if (!isObject(snake)) throw new Error('snake is not a object')
  if (!isArray(snake.head)) throw new Error('snake.head is not a array')
  if (!isArray(snake.body)) throw new Error('snake.body is not a array')
  if (!isArray(eggs)) throw new Error('eggs is not a array')
  if (!isInteger(score)) throw new Error('score is not a integer')

  return {
    snake,
    eggs,
    score,
  }
}

export function nextWorld (world, step, worldWidth, worldHeight, { onEatingEgg }) {
  const eatenEgg = getEatenEgg(world.snake.head, world.eggs, step)

  if (eatenEgg !== null) {
    if (onEatingEgg) { onEatingEgg() }
    return safeWorld(
      nextSnake(world.snake, step, true),
      nextEggs(world.eggs, eatenEgg, world.snake, worldWidth, worldHeight),
      world.score + SCORE_PER_EGG
    )
  } else {
    return safeWorld(
      nextSnake(world.snake, step),
      world.eggs,
      world.score
    )
  }
}

export function nextSnake ({ head, body }, step, keepTail = false) {
  const nextBody = keepTail ? body : body.slice(0, -1)
  return {
    head: [ head[0] + step[0], head[1] + step[1] ],
    body: [ [ -step[0], -step[1] ], ...nextBody ],
  }
}

export function getEatenEgg (head, eggs, step) {
  let eatenEggIndex = null
  const nextHead = [ head[0] + step[0], head[1] + step[1] ]

  eggs.forEach((egg, index) => {
    if (egg[0] === nextHead[0] && egg[1] === nextHead[1]) {
      eatenEggIndex = index
    }
  })

  return eatenEggIndex
}

export function wholeSnake ({ head, body }) {
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

export function isCollideWithWall (snake, worldWidth, worldHeight) {
  const [ headX, headY ] = snake.head
  return headX < 0 || headY < 0 || headX >= worldWidth || headY >= worldHeight
}

export function isSnakeBiteItSelf (snake) {
  const [ headX, headY ] = snake.head
  return wholeSnake(snake)
    .slice(1)
    .some(([ jointX, jointY ]) => jointX === headX && jointY === headY)
}

export function initWorld (worldWidth, worldHeight) {
  return safeWorld(
    {
      head: [ Math.floor(worldWidth / 2), Math.floor(worldHeight / 2) ],
      body: snakeBody(5),
    },
    randomEggs(3),
    0
  )

  function randomEggs (number) {
    return createArray(
      number,
      () => [ randomInt(0, worldWidth), randomInt(0, worldHeight) ]
    )
  }

  function snakeBody (length) {
    return createArray(length, () => [ 0, 1 ])
  }
}
