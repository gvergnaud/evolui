import expect from 'expect'
import { tokenizer, parser } from '../src/framework/parseFragment'
import {
  CreateElement,
  CreateTextNode,
  UpdateTextNode,
  ReplaceByTextNode,
  RemoveTextNode,
  CloseElement,
  Variable
} from '../src/framework/Operation'
import allHTMLAttributes from './allHTMLAttributes.json'

const openTag = tagName => [
  { type: 'OpenCarret', value: '<' },
  { type: 'TagName', value: tagName },
  { type: 'CloseCarret', value: '>' }
]

const closeTag = tagName => [
  { type: 'ClosingTagCarret', value: '</' },
  { type: 'TagName', value: tagName },
  { type: 'CloseCarret', value: '>' }
]

describe('tokenizer', () => {
  it('should successfully parse any tagName', () => {
    expect(tokenizer('<')).toEqual([{ type: 'OpenCarret', value: '<' }])
    expect(tokenizer('>')).toEqual([{ type: 'CloseCarret', value: '>' }])
    expect(tokenizer('/>')).toEqual([
      { type: 'SelfClosingTagCarret', value: '/>' }
    ])
    expect(tokenizer('</')).toEqual([{ type: 'ClosingTagCarret', value: '</' }])

    expect(tokenizer('<div>')).toEqual([
      { type: 'OpenCarret', value: '<' },
      { type: 'TagName', value: 'div' },
      { type: 'CloseCarret', value: '>' }
    ])
  })

  it('should successfully parse attributes tokens', () => {
    expect(tokenizer('<div class="hello" />')).toEqual([
      { type: 'OpenCarret', value: '<' },
      { type: 'TagName', value: 'div' },
      { type: 'AttrName', value: 'class' },
      { type: 'Equal', value: '=' },
      { type: 'AttrValue', value: 'hello' },
      { type: 'SelfClosingTagCarret', value: '/>' }
    ])
  })

  it('should parse any number of attributes', () => {
    expect(tokenizer('<div class="hello" id="yes" />')).toEqual([
      { type: 'OpenCarret', value: '<' },
      { type: 'TagName', value: 'div' },
      { type: 'AttrName', value: 'class' },
      { type: 'Equal', value: '=' },
      { type: 'AttrValue', value: 'hello' },
      { type: 'AttrName', value: 'id' },
      { type: 'Equal', value: '=' },
      { type: 'AttrValue', value: 'yes' },
      { type: 'SelfClosingTagCarret', value: '/>' }
    ])

    expect(tokenizer('<div class="hello" id="yes" data-lol="cool" />')).toEqual(
      [
        { type: 'OpenCarret', value: '<' },
        { type: 'TagName', value: 'div' },
        { type: 'AttrName', value: 'class' },
        { type: 'Equal', value: '=' },
        { type: 'AttrValue', value: 'hello' },
        { type: 'AttrName', value: 'id' },
        { type: 'Equal', value: '=' },
        { type: 'AttrValue', value: 'yes' },
        { type: 'AttrName', value: 'data-lol' },
        { type: 'Equal', value: '=' },
        { type: 'AttrValue', value: 'cool' },
        { type: 'SelfClosingTagCarret', value: '/>' }
      ]
    )
  })

  it('should parse all html attributes', () => {
    Object.values(allHTMLAttributes).forEach(attr => {
      expect(tokenizer(`<div ${attr}="cool" />`)).toEqual([
        { type: 'OpenCarret', value: '<' },
        { type: 'TagName', value: 'div' },
        { type: 'AttrName', value: attr },
        { type: 'Equal', value: '=' },
        { type: 'AttrValue', value: 'cool' },
        { type: 'SelfClosingTagCarret', value: '/>' }
      ])
    })
  })

  it('should parse nested HTML elements', () => {
    expect(
      tokenizer(`
          <div lol="cool">
            <h1>Hello</h1>
            <div>
                <p>How are you?</p>
                <p>Pewewewe</p>
            </div>
          </div>
      `)
    ).toEqual([
      { type: 'OpenCarret', value: '<' },
      { type: 'TagName', value: 'div' },
      { type: 'AttrName', value: 'lol' },
      { type: 'Equal', value: '=' },
      { type: 'AttrValue', value: 'cool' },
      { type: 'CloseCarret', value: '>' },
      { type: 'OpenCarret', value: '<' },
      { type: 'TagName', value: 'h1' },
      { type: 'CloseCarret', value: '>' },
      { type: 'String', value: 'Hello' },
      { type: 'ClosingTagCarret', value: '</' },
      { type: 'TagName', value: 'h1' },
      { type: 'CloseCarret', value: '>' },
      { type: 'OpenCarret', value: '<' },
      { type: 'TagName', value: 'div' },
      { type: 'CloseCarret', value: '>' },
      { type: 'OpenCarret', value: '<' },
      { type: 'TagName', value: 'p' },
      { type: 'CloseCarret', value: '>' },
      { type: 'String', value: 'How are you?' },
      { type: 'ClosingTagCarret', value: '</' },
      { type: 'TagName', value: 'p' },
      { type: 'CloseCarret', value: '>' },
      { type: 'OpenCarret', value: '<' },
      { type: 'TagName', value: 'p' },
      { type: 'CloseCarret', value: '>' },
      { type: 'String', value: 'Pewewewe' },
      { type: 'ClosingTagCarret', value: '</' },
      { type: 'TagName', value: 'p' },
      { type: 'CloseCarret', value: '>' },
      { type: 'ClosingTagCarret', value: '</' },
      { type: 'TagName', value: 'div' },
      { type: 'CloseCarret', value: '>' },
      { type: 'ClosingTagCarret', value: '</' },
      { type: 'TagName', value: 'div' },
      { type: 'CloseCarret', value: '>' }
    ])
  })

  it('should interpret anything contained in an element as a string', () => {
    expect(
      tokenizer(`
            <p>@lol</p>
        `)
    ).toEqual(
      openTag('p').concat(
        [{ type: 'String', value: '@lol' }].concat(closeTag('p'))
      )
    )

    expect(
      tokenizer(`
            <p>&lol</p>
        `)
    ).toEqual(
      openTag('p').concat(
        [{ type: 'String', value: '&lol' }].concat(closeTag('p'))
      )
    )

    expect(
      tokenizer(`
            <p>&é"!&é"à&é"&çé"&à"u&éçà"u&"çàu&éà"u</p>
        `)
    ).toEqual(
      openTag('p').concat(
        [
          { type: 'String', value: '&é"!&é"à&é"&çé"&à"u&éçà"u&"çàu&éà"u' }
        ].concat(closeTag('p'))
      )
    )
  })

  it('should understand string next to tags', () => {
    expect(
      tokenizer(`
              <p>alacoolausoleil<span>☀️😎</span></p>
          `)
    ).toEqual(
      openTag('p').concat(
        [{ type: 'String', value: 'alacoolausoleil' }]
          .concat(openTag('span'))
          .concat([{ type: 'String', value: '☀️😎' }])
          .concat(closeTag('span'))
          .concat(closeTag('p'))
      )
    )
  })
})

describe('parser', () => {
  it('should understand tag opening', () => {
    expect(openTag('p')).toEqual([new CreateElement('p')])
  })
})
