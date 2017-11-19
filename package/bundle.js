'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault$1(ex) {
  return ex && (typeof ex === 'undefined' ? 'undefined' : _typeof(ex)) === 'object' && 'default' in ex ? ex['default'] : ex;
}

var hyperx = _interopDefault$1(require('hyperx'));
var virtualDom = require('virtual-dom');
var createElement = _interopDefault$1(require('virtual-dom/create-element'));
var fp = require('lodash/fp');

function _toConsumableArray$1(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }return arr2;
  } else {
    return Array.from(arr);
  }
}

var Nothing = 'Nothing';

var init = function init(xs) {
  return xs.slice(0, xs.length - 1);
};
var last = function last(xs) {
  return xs[xs.length - 1];
};
var compose = function compose() {
  for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  return function (x) {
    return fns.reduceRight(function (value, f) {
      return f(value);
    }, x);
  };
};
var pipe = function pipe() {
  for (var _len2 = arguments.length, fs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    fs[_key2] = arguments[_key2];
  }

  return fs.reduce(function (acc, f) {
    return function (x) {
      return f(acc(x));
    };
  }, function (x) {
    return x;
  });
};

var createOperators = function createOperators(Observable) {
  var fromPromise = function fromPromise(p) {
    return new Observable(function (observer) {
      p.then(function (x) {
        return observer.next(x);
      });
    });
  };

  var toObservable = function toObservable(x) {
    return x instanceof Observable ? x : x instanceof Promise ? fromPromise(x) : Observable.of(x);
  };

  var startWith = fp.curry(function (initalValue, stream) {
    return new Observable(function (observer) {
      observer.next(initalValue);
      return stream.subscribe(observer);
    });
  });

  var combineLatest = function combineLatest() {
    for (var _len3 = arguments.length, xs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      xs[_key3] = arguments[_key3];
    }

    var observables = init(xs);
    var combiner = last(xs);

    return new Observable(function (observer) {
      var values = observables.map(function () {
        return Nothing;
      });
      var active = observables.map(function () {
        return true;
      });

      var subs = observables.map(function (obs, index) {
        return obs.subscribe({
          error: function error(x) {
            return observer.error(x);
          },
          complete: function complete() {
            active[index] = false;
            if (active.every(function (x) {
              return x === false;
            })) observer.complete();
          },
          next: function next(x) {
            values[index] = x;

            if (values.every(function (x) {
              return x !== Nothing;
            })) {
              var result = void 0;
              try {
                result = combiner.apply(undefined, _toConsumableArray$1(values));
              } catch (err) {
                console.error(err);
              }
              observer.next(result);
            }
          }
        });
      });

      return {
        unsubscribe: function unsubscribe() {
          subs.forEach(function (s) {
            return s.unsubscribe();
          });
        }
      };
    });
  };

  var map = fp.curry(function (mapper, stream) {
    return new Observable(function (observer) {
      return stream.subscribe({
        error: function error(e) {
          return observer.error(e);
        },
        next: function next(x) {
          return observer.next(mapper(x));
        },
        complete: function complete() {
          return observer.complete();
        }
      });
    });
  });

  var switchMap = fp.curry(function (switchMapper, stream) {
    var subscription = void 0;

    return new Observable(function (observer) {
      return stream.subscribe({
        next: function next(x) {
          if (subscription) subscription.unsubscribe();
          subscription = switchMapper(x).subscribe({
            error: function error(e) {
              return observer.error(e);
            },
            next: function next(x) {
              return observer.next(x);
            },
            complete: function complete() {}
          });
        },
        error: function error(e) {
          return observer.error(e);
        },
        complete: function complete() {
          return observer.complete();
        }
      });
    });
  });

  var sample = fp.curry(function (sampleStream, stream) {
    var none = Symbol('None');
    return new Observable(function (observer) {
      var latestValue = none;
      var sub = stream.subscribe({
        next: function next(value) {
          latestValue = value;
        },
        complete: function complete() {},
        error: function error(err) {
          return observer.error(err);
        }
      });

      var sampleSub = sampleStream.subscribe({
        next: function next() {
          if (latestValue !== none) {
            observer.next(latestValue);
            latestValue = none;
          }
        },
        complete: function complete() {
          return observer.complete();
        },
        error: function error(err) {
          return observer.error(err);
        }
      });

      return {
        unsubscribe: function unsubscribe() {
          sub.unsubscribe();
          sampleSub.unsubscribe();
        }
      };
    });
  });

  var all = function all(obs) {
    return obs.length ? combineLatest.apply(undefined, _toConsumableArray$1(obs).concat([function () {
      for (var _len4 = arguments.length, xs = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        xs[_key4] = arguments[_key4];
      }

      return xs;
    }])) : Observable.of([]);
  };

  return {
    sample: sample,
    map: map,
    switchMap: switchMap,
    all: all,
    combineLatest: combineLatest,
    startWith: startWith,
    toObservable: toObservable,
    fromPromise: fromPromise,
    compose: compose,
    pipe: pipe
  };
};

var createRaf = function createRaf(Observable) {
  return new Observable(function (observer) {
    var isSubscribed = true;

    var loop = function loop() {
      if (isSubscribed) {
        observer.next();
        window.requestAnimationFrame(loop);
      }
    };

    window.requestAnimationFrame(loop);

    return {
      unsubscribe: function unsubscribe() {
        isSubscribed = false;
      }
    };
  });
};

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }return arr2;
  } else {
    return Array.from(arr);
  }
}

var hx = hyperx(virtualDom.h);

var createHtml = function createHtml(Observable) {
  var _createOperators = createOperators(Observable),
      pipe = _createOperators.pipe,
      compose = _createOperators.compose,
      map = _createOperators.map,
      startWith = _createOperators.startWith,
      toObservable = _createOperators.toObservable,
      all = _createOperators.all,
      switchMap = _createOperators.switchMap,
      sample = _createOperators.sample;

  var raf = createRaf(Observable);

  // data Variable a = a | Observable (Variable a) | [Variable a]
  // toAStream :: Variable a -> Observable a
  var toAStream = function toAStream(variable) {
    return Array.isArray(variable) ? all(variable.map(toAStream)) : variable instanceof Observable ? compose(startWith(''), switchMap(toAStream))(variable) : compose(startWith(''), toObservable)(variable);
  };

  // html :: [String] -> ...[Variable a] -> Observable VirtualDOM
  var html = function html(strings) {
    for (var _len = arguments.length, variables = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      variables[_key - 1] = arguments[_key];
    }

    return pipe(toAStream, map(function (variables) {
      return hx.apply(undefined, [strings].concat(_toConsumableArray(variables)));
    }), sample(raf))(variables);
  };

  return html;
};

// render :: Observable VirtualDOM -> DOMElement -> Subscription
var render = function render(component, element) {
  var tree = void 0;
  var rootNode = void 0;

  return component.forEach(function (newTree) {
    if (!tree) {
      rootNode = createElement(newTree);
      element.appendChild(rootNode);
    } else {
      var patches = virtualDom.diff(tree, newTree);
      rootNode = virtualDom.patch(rootNode, patches);
    }

    tree = newTree;
  });
};

exports['default'] = createHtml;
exports.render = render;
