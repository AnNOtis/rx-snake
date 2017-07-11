import './index.css'
import './github_corner.css'

import PaintCanvas from './paint_canvas'
import gamePlay from 'scene/game_play'

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 400

const preparedCanvas = new PaintCanvas(
  'game',
  { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
)
gamePlay(preparedCanvas)
