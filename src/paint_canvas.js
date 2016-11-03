// manipulate canvas using center mode
export default class PaintCanvas {
  constructor (dom, options = {}) {
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
  }

  clear (color = 'black') {
    this.context.fillStyle = color
    const [ canvasWidth, canvasHeight ] = this.canvasSize()
    this.context.fillRect(0, 0, canvasWidth, canvasHeight)
  }

  rect (x, y, width, height) {
    this.context.strokeRect(x - width/2, y - height/2, width, height)
  }

  strokeStyle (color) {
    this.context.strokeStyle = color
  }

  canvasSize () {
    const canvas = this.context.canvas

    return [ canvas.width, canvas.height ]
  }

  _generateID () {
    return 'canvas-' + Math.floor(Math.random() * 65535).toString(16)
  }
}
