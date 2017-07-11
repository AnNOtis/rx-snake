import COLORS from 'constants/colors'

class GameDrawer {
  constructor (paintCanvas, unit) {
    this.pc = paintCanvas
    this.unit = unit
    this.width = paintCanvas.width / unit // game world width
    this.height = paintCanvas.height / unit // game world height
    this.canvas = paintCanvas.context.canvas
    this.resetScene = this.resetScene.bind(this)
  }

  drawScore (score) {
    this.pc.font('14px sans-serif')
    this.pc.fillStyle(COLORS.yellow)
    this.pc.context.textAlign = 'right'
    this.pc.context.fillText(`$ ${score}`, this.canvas.width - 10, 20)
  }

  drawSnakeJoint (x, y) {
    const unit = this.unit
    this.pc.strokeStyle('green')
    this.pc.strokeRect(x * unit, y * unit, unit, unit)
  }

  resetScene () {
    this.pc.clear(COLORS.bg.gaming)
  }

  drawEggs (eggs) {
    const unit = this.unit
    eggs.forEach((egg, _) => {
      this.pc.fillStyle(COLORS.yellow)
      this.pc.strokeStyle(COLORS.yellow)
      this.pc.fillRect(egg[0] * unit, egg[1] * unit, unit, unit)
      this.pc.strokeRect(egg[0] * unit, egg[1] * unit, unit, unit)
    })
  }

  drawSnake (snakeBody) {
    snakeBody.forEach((position) => {
      this.drawSnakeJoint(position[0], position[1])
    })
  }

  fadeOutThan (afterFinishFadeOut) {
    this.pc.context.globalAlpha = 0.2
    let count = 8
    const fadeOutTimer = setInterval(() => {
      this.pc.clear(COLORS.bg.menu)
      count--

      if (count === 0) {
        clearInterval(fadeOutTimer)
        this.pc.context.globalAlpha = 1
        this.pc.clear(COLORS.bg.menu)
        afterFinishFadeOut()
      }
    }, 100)
  }

  drawGameOver (score, highestScore = 0) {
    const canvas = this.canvas
    const titleSize = canvas.width / 6
    const subtitleSize = canvas.width / 20
    this.pc.clear(COLORS.bg.menu)

    this.pc.font(`bold ${titleSize}px monospace`)
    this.pc.fillStyle(COLORS.yellow)
    this.pc.fillText('Game Over', canvas.width / 2, canvas.height * 0.4, canvas.width)

    this.pc.font(`${subtitleSize}px monospace`)
    this.pc.fillStyle(COLORS.green)
    this.pc.fillText(`your score: ${score}`, canvas.width / 2, canvas.height * 0.6, canvas.width)
    this.pc.fillText(`highest score: ${highestScore}`, canvas.width / 2, canvas.height * 0.7, canvas.width)
  }

  drawMenu () {
    const canvas = this.canvas

    this.pc.clear(COLORS.bg.menu)
    this.pc.font(`bold ${canvas.width / 5}px monospace`)
    this.pc.fillStyle(COLORS.yellow)
    this.pc.fillText('Snake', canvas.width / 2, canvas.height * 0.4, canvas.width)

    this.pc.font(`${canvas.width / 20}px monospace`)
    this.pc.fillStyle(COLORS.green)
    this.pc.fillText('press "space" to start', canvas.width / 2, canvas.height * 0.6, canvas.width)
  }

}

export default GameDrawer
