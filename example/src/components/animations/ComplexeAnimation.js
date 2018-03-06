import { Observable, Subject } from 'rxjs';
import html from 'evolui'
import ease from 'evolui/ease';

const addPosition = e => {
  e.position = e.type.match(/^touch/)
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX, y: e.clientY };

  return e;
};

const mouse$ = Observable.merge(
  Observable.fromEvent(window, 'mousemove').map(addPosition),
  Observable.fromEvent(window, 'touchmove').map(addPosition)
);

const end$ = Observable.merge(
  Observable.fromEvent(window, 'mouseup'),
  Observable.fromEvent(window, 'touchend')
);

const createHandler = names =>
  names.reduce(
    (acc, name) => ({
      ...acc,
      [name]: (() => {
        const sub = new Subject();
        const f = x => sub.next(x);
        f.$ = sub;
        return f;
      })()
    }),
    {}
  );

const createDragHandler = () => {
  const { start } = createHandler(['start']);
  const start$ = start.$.map(addPosition);

  const drag$ = start$.switchMap(({ target, position: initPosition }) => {
    const { left, top } = target.getBoundingClientRect();
    return mouse$
      .map(({ position }) => ({
        left: initPosition.x - left,
        top: initPosition.y - top,
        x: position.x - (initPosition.x - left),
        y: position.y - (initPosition.y - top)
      }))
      .takeUntil(end$);
  })
  .share();

  const isDragging$ =
    start$.map(() => true)
      .merge(end$.map(() => false))
      .startWith(false)

  return {
    start,
    drag$,
    dragStart$: start.$,
    dragEnd$: drag$.switchMap(() => end$),
    isDragging$
  };
};

const Circle = (
  {
    onDragStart,
    position$,
    isDragging$,
    color = 'purple',
    radius = 25,
    stiffness = 120,
    damping = 20,
  } = {}
) => {
  return html`
    <div
      ontouchstart="${onDragStart}"
      onmousedown="${onDragStart}"
      style="
        position: absolute;
        left: 0;
        right: 0;
        width: ${radius * 2}px;
        height: ${radius * 2}px;
        background: ${color};
        border-radius: 100%;
        transform: translate(
          ${position$
            .map(p => p.x)
            .switchMap(ease(stiffness, damping))}px,
          ${position$
            .map(p => p.y)
            .switchMap(ease(stiffness, damping))}px
        );
        cursor: ${isDragging$.map(
          isDraging => (isDraging ? '-webkit-grabbing' : '-webkit-grab')
        )};
        user-select: none;
      ">
    </div>
  `;
};

const rand = (start, end) => start + Math.random() * (end - start)

const GrabbableCircle = ({ exploadEvery, onDragStart, drag$, isDragging$, radius = 25, r, g, b }) => {

  const randomPosition = () =>
    ({ x: rand(.15, .85) * window.innerWidth, y: rand(.1, .85) * window.innerHeight })
  const center = () =>
    ({ x: .5 * window.innerWidth, y: .5 * window.innerHeight })

  const position$ =
      drag$
      .map(drag => ({
        x: drag.x + drag.left,
        y: drag.y + drag.top,
      }))
      .merge(
        isDragging$
          .switchMap(bool =>
            bool
              ? Observable.empty()
              : Observable.interval(900)
                .map(x => x)
                .map(x => x % exploadEvery ? randomPosition() : center())
                .startWith(randomPosition())
          )
      )
      .startWith(center())


  return html`
    <div>
      ${Array(7)
        .fill(0)
        .map((_, i, xs) =>
          Circle({
            onDragStart,
            position$: position$
              .map(({ x, y }) => ({
                x: x - (radius + i),
                y: y - (radius + i),
              })),
            isDragging$,
            stiffness: 120 + 15 * i,
            damping: 25 - i * 2,
            radius: radius + i,
            color: `rgba(${r}, ${g}, ${b}, ${i / xs.length})`
          })
      )}
    </div>
  `;
}

export default () => {
  const { start, drag$, isDragging$ } = createDragHandler();
  return html`
    <div>
      ${GrabbableCircle({
        radius: 50,
        r: 57,
        g: 77,
        b: 255,
        onDragStart: start,
        drag$,
        isDragging$,
        exploadEvery: 2,
      })}
      ${GrabbableCircle({
        radius: 30,
        r: 249,
        g: 0,
        b: 114,
        onDragStart: start,
        drag$,
        isDragging$,
        exploadEvery: 2,
      })}
      ${GrabbableCircle({
        radius: 15,
        r: 5,
        g: 241,
        b: 163,
        onDragStart: start,
        drag$,
        isDragging$,
        exploadEvery: 4,
      })}
    </div>
  `
};
