import Rx from 'rxjs/Rx'
import { Howl } from 'howler'

import {
  levelMapToSpeed,
  isCollideWithWall,
  isSnakeBiteItSelf,
  nextWorld,
  wholeSnake,
  initWorld,
} from 'game_rule'

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

export default function gamePlay ({ drawer, done }) {
  const bgSound = new Howl({
    src: [ require('sounds/snake_bg.mp3') ],
    loop: true,
    volume: 0.5,
  })

  const eatingSound = new Howl({
    src: [ require('sounds/blink.mp3') ],
    volume: 0.7,
  })

  const width = drawer.width
  const height = drawer.height

  const pressArrowKey$ = Rx.Observable.fromEvent(document, 'keyup')
    .pluck('code')
    .filter((code) => VALID_ARROW_KEYS.indexOf(code) !== -1)

  const snakeManualMove$ = pressArrowKey$
    .map(arrowKey => ARROW_KEY_TO_OFFSET[arrowKey])
    .distinctUntilChanged((keyOne, keyTwo) =>
      keyOne[0] + keyTwo[0] === 0 && keyOne[1] + keyTwo[1] === 0
    )
    .share()

  snakeManualMove$
    .first()
    .subscribe(() => bgSound.play())

  const frame$ = Rx.Observable
    .interval(FRAME_RATE, Rx.Scheduler.requestAnimationFrame)
    .share()

  const eatingEggSubject$ = new Rx.Subject()

  const gameLevel$ = Rx.Observable
    .merge(frame$.sampleTime(1000).mapTo(1), eatingEggSubject$.mapTo(20))
    .scan((point, value) => point + value, 0)
    .map(point => START_LEVEL + Math.floor(point / 60))
    .distinctUntilChanged()
    .share()

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

  const initialWorld = initWorld(width, height)
  const worldRunner$ = nextStep$.scan((world, step) => {
    if (
      isCollideWithWall(world.snake, width, height) ||
      isSnakeBiteItSelf(world.snake)
    ) {
      const error = new Error('Game Over')
      error.world = world
      throw error
    }

    return nextWorld(world, step, width, height, {
      onEatingEgg: () => eatingEggSubject$.next(),
    })
  }, initialWorld)

  function draw ({ snake, eggs, score, level = START_LEVEL }) {
    drawer.resetScene()
    drawer.drawEggs(eggs)
    drawer.drawSnake(wholeSnake(snake))
    drawer.drawScore(score)
    drawer.drawLevel(level)
  }

  draw(initialWorld)
  eatingEggSubject$.subscribe(() => eatingSound.play())
  worldRunner$
    .withLatestFrom(gameLevel$, (world, level) => ({ ...world, level }))
    .subscribe(draw, err => {
      done(err.world)
      bgSound.fade(0.7, 0, 1000)
    })
}
