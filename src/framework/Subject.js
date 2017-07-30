import Observable from './Observable'

export default class Subject extends Observable {
  constructor() {
    super(observer => {
      this.observer = observer
    })
  }

  next(x) {
    this.observer.next(x)
  }

  complete(x) {
    this.observer.complete(x)
  }

  error(x) {
    this.observer.error(x)
  }
}
