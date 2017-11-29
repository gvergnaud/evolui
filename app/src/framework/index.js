import Rx from 'rxjs';

export class OpenComponent {
  constructor(name) {
    this.name = name;
  }
}
export class CloseComponent {}

export class OpenElement {
  constructor(name) {
    this.name = name;
  }
}
export class CloseElement {}

export class SetAttribute {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }
}
export class RemoveAttribute {
  constructor(name) {
    this.name = name;
  }
}

export class ToggleClassName {
  constructor(className, force = false) {
    this.className = className;
    this.force = force;
  }
}

export class CreateTextNode {
  constructor(content) {
    this.content = content;
  }
}
export class UpdateTextNode {
  constructor(content) {
    this.content = content;
  }
}
export class ReplaceByTextNode {
  constructor(content) {
    this.content = content;
  }
}
export class RemoveTextNode {}

export class Bind {
  constructor(expr) {
    this.expr = expr;
  }
}

export class Component {
  constructor(props = {}) {
    this.props = props;
  }
  async *render() {}
}

class DroppedError extends Error {
  constructor() {
    super('Dropped');
  }
}

class ClosedError extends Error {
  constructor() {
    super('Closed');
  }
}

class AsyncQueue {
  constructor({ capacity = 2**32 - 1 } = {}) {
    this.pushes = [];
    this.shifts = [];
    this.capacity = capacity;
    this.isClosed = false;
    this.closed = new Promise((resolve, reject) => {
      this._resolveClosedPromise = resolve;
      this._rejectClosedPromise = reject;
    });
  }

  get length() {
    return this.pushes.length;
  }

  close(reason = new ClosedError()) {
    if (this.isClosed) return;

    while (this.shifts.length > 0) {
      this.shifts.shift().reject(reason);
    }

    this.isClosed = true;
    if (reason instanceof ClosedError) {
      this._resolveClosedPromise();
    } else {
      this._rejectClosedPromise(reason);
    }
  }

  pushSync(value) {
    if (this.isClosed) {
      throw new ClosedError();
    } else if (this.shifts.length > 0) {
      this.shifts.shift().resolve(value);
    } else {
      if (this.pushes.length === this.capacity) {
        this.pushes.shift().reject(new DroppedError());
      }
      this.pushes.push({ value });
    }
  }

  push(value) {
    if (this.isClosed) {
      return Promise.reject(new ClosedError());
    } else if (this.shifts.length > 0) {
      this.shifts.shift().resolve(value);
      return Promise.resolve();
    } else {
      if (this.pushes.length === this.capacity) {
        this.pushes.shift().reject(new DroppedError());
      }
      return new Promise((resolve, reject) => {
        this.pushes.push({ value, resolve, reject });
      });
    }
  }

  shift() {
    if (this.pushes.length > 0) {
      const push = this.pushes.shift();
      if (push.resolve) push.resolve();
      return Promise.resolve(push.value);
    } else if (this.isClosed) {
      return Promise.reject(new ClosedError());
    } else {
      return new Promise((resolve, reject) => {
        this.shifts.push({ resolve, reject });
      });
    }
  }

  async *[Symbol.asyncIterator]() {
    let value;

    while (true) {
      try {
        value = await this.shift();
      } catch (reason) {
        switch (reason.constructor) {
          case DroppedError: continue;
          case ClosedError: return;
          default: throw reason;
        }
      }

      yield value;
    }
  }
}

const pipe = async (inbound, outbound) => {
  let value;

  while (true) {
    try { value = await inbound.shift() }
    catch (reason) {
      switch (reason.constructor) {
        case DroppedError: continue;
        case ClosedError: return;
        default: throw reason;
      }
    }

    try { await outbound.push(value) }
    catch (reason) { return inbound.close(reason) }
  }
};

const closestElement = node => {
  return (
    node instanceof HTMLElement ||
    node instanceof DocumentFragment
  ) ? node : closestElement(node.parentNode);
};
const interpret = (op, currentNode) => {
  switch (op && op.constructor) {
    case OpenComponent:
    case CloseComponent:
      return currentNode;

    case OpenElement: {
      const element = currentNode.ownerDocument.createElement(op.name);
      return closestElement(currentNode).appendChild(element);
    }
    case CloseElement:
      return currentNode.parentNode;

    case SetAttribute: {
      const element = closestElement(currentNode);
      element.setAttribute(op.name, op.value);
      return currentNode;
    }
    case RemoveAttribute: {
      const element = closestElement(currentNode);
      element.removeAttribute(op.name);
      return currentNode;
    }

    case ToggleClassName: {
      const element = closestElement(currentNode);
      element.classList.toggle(op.className, op.force);
      return currentNode;
    }

    case CreateTextNode: {
      const node = currentNode.ownerDocument.createTextNode(op.content);
      return closestElement(currentNode).appendChild(node);
    }
    case UpdateTextNode:
      currentNode.textContent = op.content;
      return currentNode;
    case ReplaceByTextNode: {
      const node = currentNode.ownerDocument.createTextNode(op.content)
      currentNode.parentNode.replaceChild(node, currentNode);
      return node;
    }
    case RemoveTextNode:
      currentNode.parentNode.removeChild(currentNode);
      return currentNode.parentNode;

    default:
      throw new TypeError(); // TODO
  }
};

export const mount = async (proc, root) => {
  let iteration = await proc.next(), currentNode = root;
  while (!iteration.done) {
    if (iteration.value instanceof Bind) {
      const inbound = new AsyncQueue();
      mount(inbound[Symbol.asyncIterator](), closestElement(currentNode));
      iteration = await proc.next(inbound);
      if (iteration.done) break;
    }
    currentNode = interpret(iteration.value, currentNode);
    iteration = await proc.next();
  }
  return iteration.value;
};

const Generator = (function* () {}).prototype;
const AsyncGenerator = (async function* () {}).prototype;

const yieldsConstant = async function* (constant) {
  yield new CreateTextNode(constant);
};
const yieldsComponent = async function* (component) {
  yield new OpenComponent(component.constructor.name);
  const subprogram = component.render();
  const subprocess = (
    Generator.isPrototypeOf(subprogram) ||
    AsyncGenerator.isPrototypeOf(subprogram) || (
      typeof subprogram.next === 'function' &&
      typeof subprogram.throw === 'function' &&
      typeof subprogram.return === 'function'
    )
  ) ? subprogram : yields(subprogram);
  yield* subprocess;
  yield new CloseComponent();
};
const yieldsMany = async function* (programs) {
  for (const program of programs) {
    yield* yields(program);
  }
};
const yieldsVariable = async function* (variable) {
  const inbound = new AsyncQueue({ capacity: 1 });
  const unsubscribe = Rx.Observable.from(variable).subscribe({
    next: value => inbound.pushSync(value),
    error: reason => inbound.close(reason),
    complete: () => inbound.close(),
  });

  try {
    const iterator = inbound[Symbol.asyncIterator]();
    let iteration = await iterator.next();
    while (!iteration.done) {
      yield* yields(iteration.value);
    }
  } finally {
    if (!inbound.isClosed) {
      unsubscribe();
    }
  }
};
const yields = program => {
  if (typeof program === 'string' || program instanceof String) {
    return yieldsConstant(program);
  } else if (program instanceof Component) {
    return yieldsComponent(program);
  } else if (Array.isArray(program)) {
    return yieldsMany(program);
  } else if (typeof program[Rx.Symbol.observable] === 'function') {
    return yieldsVariable(program);
  } else {
    throw new TypeError(); // TODO
  }
};

export const render = (component, root) => {
  return mount(yieldsComponent(component), root);
};

const diff = ({ value, prev }) => {
  const wasString = typeof prev === 'string' || prev instanceof String;
  const isString = typeof value === 'string' || value instanceof String;
  if (prev === undefined && isString) {
    return new CreateTextNode(value);
  } else if (wasString && value === undefined) {
    return new RemoveTextNode();
  } else if (wasString && isString) {
    return new UpdateTextNode(value);
  } else if (prev !== value) {
    throw new TypeError(); // TODO
  }
};

const enqueueConstant = async (outbound, expr) => {
  await outbound.push(new CreateTextNode(expr));
};
const enqueueComponent = async (outbound, expr) => {
  const proc = yieldsComponent(expr);
  let iteration = await proc.next();
  while (!iteration.done) {
    await outbound.push(iteration.value);
    iteration = await proc.next(outbound);
  }
};
const enqueueMany = async (outbound, expr) => {
  for (const sub of expr) {
    await enqueue(outbound, sub);
  }
};
const enqueueVariable = async (outbound, expr) => {
  const inbound = new AsyncQueue({ capacity: 1 });
  const observable = Rx.Observable.from(expr)
    .scan(({ value: prev }, value) => ({ value, prev }), {});
  const unsubscribe = observable.subscribe({
    next: ({ value, prev }) => {
      const op = diff({ value, prev });
      if (op) inbound.pushSync(op);
    },
    error: reason => {
      // TODO
    },
    complete: () => {
      // TODO
    },
  });
  pipe(inbound, outbound).then(unsubscribe, unsubscribe);
};
const enqueue = (outbound, expr) => {
  if (typeof expr === 'string' || expr instanceof String) {
    return enqueueConstant(outbound, expr);
  } else if (expr instanceof Component) {
    return enqueueComponent(outbound, expr);
  } else if (Array.isArray(expr)) {
    return enqueueMany(outbound, expr);
  } else if (typeof expr[Rx.Symbol.observable] === 'function') {
    return enqueueVariable(outbound, expr);
  } else {
    return Promise.reject(new TypeError()); // TODO
  }
};

export const html = async function* (fragments, ...exprs) {
  for (const [index, fragment] of fragments.entries()) {
    yield* fragment;
    if (index < exprs.length) {
      const expr = exprs[index];
      const outbound = yield new Bind(expr);
      await enqueue(outbound, expr);
    }
  }
};
