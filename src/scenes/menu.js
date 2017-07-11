import Rx from 'rxjs/Rx'

export default function menu ({ drawer, done }) {
  drawer.drawMenu()

  const keyup$ = Rx.Observable.fromEvent(document, 'keyup')
    .pluck('code')
    .filter(code => code === 'Space')
    .first()

  keyup$.subscribe(done)
}
