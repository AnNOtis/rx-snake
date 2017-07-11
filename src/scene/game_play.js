import Rx from 'rxjs/Rx'
import GameDrawer from 'game_drawer'

import {
  levelMapToSpeed,
  isCollideWithWall,
  isSnakeBiteItSelf,
  nextWorld,
  wholeSnake,
  initWorld,
} from 'game_rule'

// Screen
const WIDTH = 40
const HEIGHT = 40

// Game Config
const START_LEVEL = 1
const FRAME_RATE = 20

const VALID_ARROW_KEYS = [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ]
const ARROW_KEY_TO_OFFSET = {
  ArrowUp: [ 0, -1 ],
  ArrowDown: [ 0, 1 ],
  ArrowLeft: [ -1, 0 ],
  ArrowRight: [ 1, 0 ],
}

export default function gamePlay (preparedCanvas) {
  const pressArrowKey$ = Rx.Observable.fromEvent(document, 'keyup')
    .pluck('code')
    .filter((code) => VALID_ARROW_KEYS.indexOf(code) !== -1)

  const snakeManualMove$ = pressArrowKey$
    .map(arrowKey => ARROW_KEY_TO_OFFSET[arrowKey])
    .distinctUntilChanged((keyOne, keyTwo) =>
      keyOne[0] + keyTwo[0] === 0 && keyOne[1] + keyTwo[1] === 0
    )

  const frame$ = Rx.Observable
    .interval(FRAME_RATE, Rx.Scheduler.requestAnimationFrame)
    .share()

  const eatingEggSubject$ = new Rx.Subject()

  const gameLevel$ = Rx.Observable
    .merge(frame$.sampleTime(1000).mapTo(1), eatingEggSubject$.mapTo(20))
    .scan((point, value) => point + value, 0)
    .map(point => START_LEVEL + Math.floor(point / 60))
    .distinctUntilChanged()

  const snakeSpeed$ = gameLevel$
    .map(levelMapToSpeed)
    .distinctUntilChanged()
    .do((v) => console.log('speed', v))

  // 一開始我使用
  // const snakeAutoMove$ = snakeSpeed$.switchMap(speed => Rx.Observable.interval(speed))
  //   .withLatestFrom(snakeManualMove$)
  //   .map(v => v[1])
  // 但如果這樣做的話，當 snakeSpeed$ 數值改變，interval 會馬上重新開始，而不是等該次 interval 跑完
  const snakeAutoMove$ = frame$.withLatestFrom(snakeSpeed$)
    .scan(({ count, emit }, curr) => {
      const speed = curr[1]
      if (count >= speed) {
        return { count: 0, emit: true }
      } else {
        return { count: count + FRAME_RATE, emit: false }
      }
    }, { count: 0, emit: false })
    .filter(({ emit }) => emit)
    .withLatestFrom(snakeManualMove$)
    .map(v => v[1])

  const nextStep$ = Rx.Observable.merge(snakeManualMove$, snakeAutoMove$)

  const initialWorld = initWorld(WIDTH, HEIGHT)
  const worldRunner$ = nextStep$.scan((world, step) => {
    if (isCollideWithWall(world.snake, WIDTH, HEIGHT)) throw new Error('Game Over')
    if (isSnakeBiteItSelf(world.snake)) throw new Error('Game Over')

    return nextWorld(world, step, WIDTH, HEIGHT, {
      onEatingEgg: () => eatingEggSubject$.next(),
    })
  }, initialWorld)

  const UNIT = preparedCanvas.width / WIDTH
  const drawer = new GameDrawer(preparedCanvas, UNIT)

  function draw ({ snake, eggs, score }) {
    drawer.resetScene()
    drawer.drawEggs(eggs)
    drawer.drawSnake(wholeSnake(snake))
    drawer.drawScore(score)
  }

  draw(initialWorld)
  worldRunner$.subscribe(draw)
}
