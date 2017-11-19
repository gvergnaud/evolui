import { Observable } from 'rxjs';

export class CreateElement {
  constructor(name) {
    this.name = name;
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

export class CloseElement {}

export class Variable {}

const interpret = (op, node) => {
  switch (op.constructor) {
    case CreateElement: {
      const element = document.createElement(op.name);
      return {
        node: node instanceof HTMLElement
          ? node.appendChild(element)
          : node.insertBefore(element, node.nextSibling)
      };
    }
    case CreateTextNode: {
      const element = node instanceof HTMLElement
        ? node : node.parentElement;
      return {
        node: element.appendChild(
          document.createTextNode(op.content)),
      };
    }
    case UpdateTextNode:
      node.textContent = op.content;
      return { node };
    case ReplaceByTextNode:
      const x = document.createTextNode(op.content)
      node.parentElement.replaceChild(x, node);
      return { node: x };
    case RemoveTextNode:
      node.parentElement.removeChild(node);
      return { node: node.parentElement };
    case CloseElement:
      return { node: node.parentElement };
    case Variable:
      const value = function* () {
        let current = node;
        while (true) {
          const { node, value } = interpret(yield, current);
          current = node;
          if (value && typeof value[Symbol.iterator] === 'function') {
            render(value, element);
          }
        }
      }();
      value.next();
      return { node, value };
  }
};

export const render = (ops, element) => {
  const fragment = document.createDocumentFragment();
  let state = { node: fragment };
  for (let res = ops.next(); !res.done; res = ops.next(state.value)) {
    state = interpret(res.value, state.node);
  }
  element.appendChild(fragment);
};

export const html = function* (fragments, ...variables) {
  for (const [index, fragment] of fragments.entries()) {
    yield* fragment;
    const variable = variables[index];
    if (variable) {
      const handle = yield new Variable();
      Observable.from(variable)
        .scan(([prev], value) => [value, prev], [])
        .subscribe({
          next: ([value, prev]) => {
            if (typeof value === 'string' || value instanceof String) {
              if (prev === undefined) handle.next(new CreateTextNode(value));
              else if (value === undefined) handle.next(new RemoveTextNode());
              else if (typeof prev === 'string' || prev instanceof String) {
                handle.next(new UpdateTextNode(value));
              } else handle.next(new ReplaceByTextNode(value));
            } else {
              handle.next(value);
            }
          },
          error: handle.throw.bind(handle),
          complete: handle.return.bind(handle),
        });
    }
  }
};
