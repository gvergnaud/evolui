## roadmap


### support async generator interpolation
    - iterate them at request animation frame

```js
import html from 'evolui';

export default () => html`
    <div>
        ${async function*() {
          let i = 0;
          while (true) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            yield ++i;
          }
        }}
    </div>
`;
```

### md tag

```js
import { md } from 'evolui';

export default () => md`
    # Title ${Observable.interval(1000)}
    cool **right** ?
`;
```


### react
Objectifs:
- Pouvoir être utilisé dans un component react direct.
- que ça importe pas virtualdom
- Pouvoir composer des components evolui avant de mettre le tout dans un component react

```js
import {render} from 'react-dom';
import html from 'evolui/react';

const Comp = props$ => html`
    <div>
        Blablabla ${props$.map(p => p.name)}
    </div>
`;

render(<Comp name="Gabriel" />, document.body)
```
pour avoir cette api => html doit retourner un react element. chiant pour la composition

Or

```js
import React from 'react';
import {render} from 'react-dom';
import {createHtml} from 'evolui';

const html = createHtml(React.createElement)

const Comp = () => html`
    <div>
        Blablabla
    </div>
`;

render(<Comp />, document.body)
```
Or
```js
import React from 'react';
import {render} from 'react-dom';
import html, {toReact} from 'evolui';

const Comp = () => html`
    <div>
        Blablabla
    </div>
`;

const ReactComp = toReact(React, Comp)

render(<ReactComp />, document.body)
```
pour cette Api il faudrait que la function String -> VirtalDOM soit injectée à la fin
