import './index.css'
import './github_corner.css'

import PaintCanvas from 'paint_canvas'
import GameDrawer from 'game_drawer'

import menu from 'scene/menu'
import gamePlay from 'scene/game_play'
import gameOver from 'scene/game_over'

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 400
const UNIT = 10

const preparedCanvas = new PaintCanvas(
  'game',
  { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
)
const drawer = new GameDrawer(preparedCanvas, UNIT)

start()

function start () {
  menu({ drawer, done: startGamePlay })
}

function startGamePlay (data) {
  gamePlay({ drawer, data, done: startGameOver })
}

function startGameOver (data) {
  gameOver({ drawer, data, done: start })
}
