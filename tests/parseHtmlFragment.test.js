import parser, {
  OpenElement,
  CloseElement,
  SetAttribute,
  CreateTextNode
} from '../src/parseHtmlFragment'
import allHTMLAttributes from './allHTMLAttributes.json'

describe('parser', () => {
  it('should successfully parse opened', () => {
    expect([...parser('<div>')]).toEqual([new OpenElement('div')])
  })

  it('should successfully parse any tagName', () => {
    expect([...parser('<div class="name">')]).toEqual([
      new OpenElement('div'),
      new SetAttribute('class', 'name')
    ])
  })

  it('should work for nested dom elements', () => {
    expect([
      ...parser('<div class="name"><lol attro-randome="value hyper chelou">')
    ]).toEqual([
      new OpenElement('div'),
      new SetAttribute('class', 'name'),
      new OpenElement('lol'),
      new SetAttribute('attro-randome', 'value hyper chelou')
    ])
  })

  it('should work with several attributes', () => {
    expect([
      ...parser('<lol attr-one="hola que tal" attr-two="sisisi">')
    ]).toEqual([
      new OpenElement('lol'),
      new SetAttribute('attr-one', 'hola que tal'),
      new SetAttribute('attr-two', 'sisisi')
    ])
  })

  it('should understand closing tag', () => {
    expect([...parser('</lol>')]).toEqual([new CloseElement()])
  })

  it('should understand self closing tag', () => {
    expect([...parser('<lol attr="attrvalue" />')]).toEqual([
      new OpenElement('lol'),
      new SetAttribute('attr', 'attrvalue'),
      new CloseElement()
    ])
  })

  it('should understand simple strings', () => {
    expect([...parser('coucou')]).toEqual([new CreateTextNode('coucou')])
  })

  it('should understand complexe strings', () => {
    const str = 'coucou @azaze aze aozdsk &azeazeo èé§!"è!\'\'"'
    expect([...parser(str)]).toEqual([new CreateTextNode(str)])
  })

  it('should understand juxtaposed element', () => {
    const str = '<div>Du text mec</div><p>Je trouve tout ça très très bien</p>'
    expect([...parser(str)]).toEqual([
      new OpenElement('div'),
      new CreateTextNode('Du text mec'),
      new CloseElement(),
      new OpenElement('p'),
      new CreateTextNode('Je trouve tout ça très très bien'),
      new CloseElement()
    ])
  })

  it('should work with multiline strings', () => {
    const str = `
      <div class="Component">
        <div class="Component-lol">Du text mec</div>
        <p>Je trouve tout ça très très bien</p>
        <input type="text" value="coucou" />
      </div>
    `
    expect([...parser(str)]).toEqual([
      new OpenElement('div'),
      new SetAttribute('class', 'Component'),
      new OpenElement('div'),
      new SetAttribute('class', 'Component-lol'),
      new CreateTextNode('Du text mec'),
      new CloseElement(),
      new OpenElement('p'),
      new CreateTextNode('Je trouve tout ça très très bien'),
      new CloseElement(),
      new OpenElement('input'),
      new SetAttribute('type', 'text'),
      new SetAttribute('value', 'coucou'),
      new CloseElement(),
      new CloseElement()
    ])
  })

  it('should parse all html attributes', () => {
    Object.values(allHTMLAttributes).forEach(attr => {
      expect([...parser(`<div ${attr}="cool" />`)]).toEqual([
        new OpenElement('div'),
        new SetAttribute(attr, 'cool'),
        new CloseElement()
      ])
    })
  })

  it('should parse partial opening tags', () => {
    expect([...parser(`<option `)]).toEqual([
      new OpenElement('option')
    ])
  })

  it('should parse partial opening attrs', () => {
    expect([...parser(`<select onchange="`)]).toEqual([
      new OpenElement('select')
    ])
  })
})
