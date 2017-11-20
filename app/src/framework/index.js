import { Observable } from 'rxjs'
import {
  CreateElement,
  CreateTextNode,
  UpdateTextNode,
  ReplaceByTextNode,
  RemoveTextNode,
  CloseElement,
  Variable
} from './Operation'

class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

class Take extends Deferred {}
class Put extends Deferred {
  constructor(value) {
    super();
    this.value = value;
  }
}

class ClosedError extends Error {
  constructor() {
    super('Closed');
  }
}

class Maybe {}
class Nothing extends Maybe {
  fold(f, _) {
    return f();
  }
}
class Just extends Maybe {
  constructor(value) {
    this.value = value;
  }

  fold(_, g) {
    return g(this.value);
  }
}

class Either {
  constructor(value) {
    this.value = value;
  }
}
class Left extends Either {
  fold(f, _) {
    return f(this.value);
  }
}
class Right extends Either {
  fold(_, g) {
    return g(this.value);
  }
}

class Channel {
  constructor() {
    this.puts = [];
    this.takes = [];
    this.closed = false;
  }

  close(reason = new ClosedError()) {
    if (this.closed) return false;
    do {
      this.takes.shift().reject(reason);
    } while (this.takes.length > 0);
    this.closed = true;
    return true;
  }

  putSync(value) {
    if (this.closed) throw new ClosedError();
    if (this.takes.length === 0) {
      const put = new Put(value);
      this.puts.push(put);
      return new Just(put);
    } else {
      const take = this.takes.shift();
      take.resolve(value);
      return new Nothing();
    }
  }

  put(value) {
    try {
      return this.putSync(value).fold(
        () => Promise.resolve(),
        put => put.promise
      );
    } catch(exception) {
      return Promise.reject(exception);
    }
  }

  takeSync() {
    if (this.puts.length === 0) {
      if (this.closed) throw new ClosedError();
      const take = new Take();
      this.takes.push(take);
      return new Right(take);
    } else {
      const put = this.puts.shift();
      put.resolve();
      return new Left(put.value);
    }
  }

  take() {
    try {
      return this.takeSync().fold(
        value => Promise.resolve(value),
        take => take.promise
      );
    } catch (exception) {
      return Promise.reject(exception);
    }
  }
}

const interpret = ({ req, node }) => {
  switch (req && req.constructor) {
    case CreateElement: {
      const element = document.createElement(req.name)
      return {
        node:
          node instanceof HTMLElement
            ? node.appendChild(element)
            : node.insertBefore(element, node.nextSibling)
      }
    }
    case CreateTextNode: {
      const element = node instanceof HTMLElement ? node : node.parentElement
      return {
        node: element.appendChild(document.createTextNode(req.content))
      }
    }
    case UpdateTextNode:
      node.textContent = req.content
      return { node }
    case ReplaceByTextNode:
      const replacement = document.createTextNode(req.content)
      node.parentElement.replaceChild(replacement, node)
      return { node: replacement }
    case RemoveTextNode:
      node.parentElement.removeChild(node)
      return { node: node.parentElement }
    case CloseElement:
      return { node: node.parentElement }
    case Variable:
      const channel = new Channel();
      render(async function* () {
        while (!channel.closed) {
          yield await channel.take();
        }
      }, node);
      return { node, res: channel }
    default:
      return { node }
  }
}

export const render = (process, element) => async () => {
  const fragment = document.createDocumentFragment()
  let state = { node: fragment }
  for (let req = await process.next(); !req.done; req = await process.next(state.res)) {
    state = interpret({ req: req.value, node: state.node })
  }
  element.appendChild(fragment)
}();

const bind = (variable, channel) => {
  if (typeof variable === 'string' || variable instanceof String) {
    channel.put(new CreateTextNode(variable));
    channel.close();
  } else if (Array.isArray(variable)) {
    for (const value of variable) {
      channel.putSync(value);
    }
    channel.close();
  } else if (variable instanceof Observable) {
    variable
      .scan(([prev], value) => [value, prev], [])
      .subscribe({
        next: ([value, prev]) => {
          if (typeof value === 'string' || value instanceof String) {
            if (prev === undefined) channel.put(new CreateTextNode(value))
            else if (value === undefined) channel.put(new RemoveTextNode())
            else if (typeof prev === 'string' || prev instanceof String) {
              channel.put(new UpdateTextNode(value))
            } else channel.put(new ReplaceByTextNode(value))
          } else {
            // TODO
            handle.next(value)
          }
        },
        error: channel.close.bind(channel),
        complete: channel.close.bind(channel)
      });
  } else if (variable && typeof variable[Symbol.iterator] === 'function') {
    for (const req of variable) {
      channel.putSync(req);
    }
    channel.close();
  }
}

export const html = function*(fragments, ...variables) {
  for (const [index, fragment] of fragments.entries()) {
    yield* fragment
    const variable = variables[index]
    if (variable) {
      const channel = yield new Variable()
      bind(variable, channel)
      Observable.from(variable)
        .scan(([prev], value) => [value, prev], [])
        .subscribe({
          next: ([value, prev]) => {
            if (typeof value === 'string' || value instanceof String) {
              if (prev === undefined) handle.next(new CreateTextNode(value))
              else if (value === undefined) handle.next(new RemoveTextNode())
              else if (typeof prev === 'string' || prev instanceof String) {
                handle.next(new UpdateTextNode(value))
              } else handle.next(new ReplaceByTextNode(value))
            } else {
              handle.next(value)
            }
          },
          error: handle.throw.bind(handle),
          complete: handle.return.bind(handle)
        })
    }
  }
}
