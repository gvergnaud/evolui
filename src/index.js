import hyperx from 'hyperx';
import { h, diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import {
  createOperators,
  createRaf,
  isObservable,
  isPromise,
  pipe,
  compose,
  dropRight,
  last
} from './utils';

const hx = hyperx(h);

const {
  map,
  startWith,
  fromPromise,
  toObservable,
  all,
  switchMap,
  sample
} = createOperators(Observable);

const raf = createRaf(Observable);

// data Variable a = a | Observable (Variable a) | [Variable a]
// toAStream :: Variable a -> Observable a
const toAStream = variable =>
  Array.isArray(variable)
    ? all(variable.map(toAStream))
    : isObservable(variable)
      ? compose(startWith(''), switchMap(toAStream))(variable)
      : isPromise(variable)
        ? compose(startWith(''), switchMap(toAStream), fromPromise)(variable)
        : compose(startWith(''), toObservable)(variable);



const addWrappingTag = ([x, ...strings]) => [
  `<div>${x}`,
  ...dropRight(1, strings),
  `${last(strings)}</div>`
];

const isVirtualTextNode = c => c.hasOwnProperty('text')

const removeWrappingTag = ({ children }) => {
  const childElements = children.filter(c => !isVirtualTextNode(c));
  return childElements.length === 1 ? childElements[0] : childElements;
};

// [String] -> ...[a] -> String
const htmlTag = (strings, ...variables) =>
  removeWrappingTag(hx(addWrappingTag(strings), ...variables));

// html :: [String] -> ...[Variable a] -> Observable VirtualDOM
const html = (strings, ...variables) =>
  pipe(
    toAStream,
    map(variables => htmlTag(strings, ...variables)),
    sample(raf)
  )(variables);

// [String] -> ...[a] -> String
const textTag = (strings, ...variables) =>
  strings.reduce(
    (acc, s, i) => acc + s + (variables[i] !== undefined ? variables[i] : ''),
    ''
  );

// text :: [String] -> ...[Variable a] -> Observable String
const text = (strings, ...variables) =>
  pipe(
    toAStream,
    map(variables => textTag(strings, ...variables)),
    sample(raf)
  )(variables);

// render :: Observable VirtualDOM -> DOMElement -> Subscription
const render = (component, element) => {
  let tree;
  let rootNode;

  return component.forEach(newTree => {
    if (!tree) {
      rootNode = createElement(newTree);
      element.appendChild(rootNode);
    } else {
      const patches = diff(tree, newTree);
      rootNode = patch(rootNode, patches);
    }

    tree = newTree;
  });
};

export default html;
export { text, render };
