import Rx from 'rxjs/Rx'

export default function gameOver ({ drawer, data, done }) {
  drawer.fadeOutThan(() => {
    drawer.drawGameOver(data.score, getHighestScore())
    setHighestScore(data.score)

    const keyup$ = Rx.Observable.fromEvent(document, 'keyup')
    .pluck('code')
    .first()

    keyup$.subscribe(done)
  })
}

function getHighestScore () {
  try {
    return parseInt(localStorage.getItem('highestScore'), 10) || 0
  } catch (e) {
    return 0
  }
}

function setHighestScore (score) {
  if (!score) return
  localStorage.setItem('highestScore', score)
}
