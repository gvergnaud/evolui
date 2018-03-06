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
