// manipulate canvas using center mode
export default class PaintCanvas {
  constructor (domID, options = {}) {
    const dom = document.getElementById('game')
    const {
      width = dom.clientWidth,
      height = dom.clientWidth,
    } = options

    const canvas = document.createElement('canvas')
    this.id = canvas.id = this._generateID()
    canvas.width = width
    canvas.height = height
    dom.appendChild(canvas)

    const ctx = canvas.getContext('2d')

    this.context = ctx
    this.elem = dom
  }

  clear (color = 'black') {
    this.context.fillStyle = color
    const [ canvasWidth, canvasHeight ] = this.canvasSize()
    this.context.fillRect(0, 0, canvasWidth, canvasHeight)
  }

  strokeRect (x, y, width, height) {
    this.context.strokeRect(x, y, width, height)
  }

  fillRect (x, y, width, height) {
    this.context.fillRect(x, y, width, height)
  }

  fillText (text, x, y, maxWidth) {
    this.context.textAlign = 'center'
    this.context.fillText(text, x, y, maxWidth)
  }

  strokeText (text, x, y, maxWidth) {
    this.context.textAlign = 'center'
    this.context.strokeText(text, x, y, maxWidth)
  }

  font (config) {
    this.context.font = config
  }

  strokeStyle (color) {
    this.context.strokeStyle = color
  }

  fillStyle (color) {
    this.context.fillStyle = color
  }

  canvasSize () {
    const canvas = this.context.canvas

    return [ canvas.width, canvas.height ]
  }

  _generateID () {
    return 'canvas-' + Math.floor(Math.random() * 65535).toString(16)
  }
}
