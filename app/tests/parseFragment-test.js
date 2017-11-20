import expect from 'expect'
import parseFragment from '../src/framework/parseFragment'
import allHTMLAttributes from './allHTMLAttributes.json'

describe('parseFragment', () => {
  it('should successfully parse any tagName', () => {
    expect(parseFragment('<')).toEqual([{type: 'OpenCarret', value: '<'}])
    expect(parseFragment('>')).toEqual([{type: 'CloseCarret', value: '>'}])
    expect(parseFragment('/>')).toEqual([
      {type: 'SelfClosingTagCarret', value: '/>'}
    ])
    expect(parseFragment('</')).toEqual([
      {type: 'ClosingTagCarret', value: '</'}
    ])

    expect(parseFragment('<div>')).toEqual([
      {type: 'OpenCarret', value: '<'},
      {type: 'TagName', value: 'div'},
      {type: 'CloseCarret', value: '>'}
    ])
  })

  it('should successfully parse attributes tokens', () => {
    expect(parseFragment('<div class="hello" />')).toEqual([
      {type: 'OpenCarret', value: '<'},
      {type: 'TagName', value: 'div'},
      {type: 'AttrName', value: 'class'},
      {type: 'Equal', value: '='},
      {type: 'AttrValue', value: 'hello'},
      {type: 'SelfClosingTagCarret', value: '/>'}
    ])
  })

  it('should parse any number of attributes', () => {
    expect(parseFragment('<div class="hello" id="yes" />')).toEqual([
      {type: 'OpenCarret', value: '<'},
      {type: 'TagName', value: 'div'},
      {type: 'AttrName', value: 'class'},
      {type: 'Equal', value: '='},
      {type: 'AttrValue', value: 'hello'},
      {type: 'AttrName', value: 'id'},
      {type: 'Equal', value: '='},
      {type: 'AttrValue', value: 'yes'},
      {type: 'SelfClosingTagCarret', value: '/>'}
    ])

    expect(
      parseFragment('<div class="hello" id="yes" data-lol="cool" />')
    ).toEqual([
      {type: 'OpenCarret', value: '<'},
      {type: 'TagName', value: 'div'},
      {type: 'AttrName', value: 'class'},
      {type: 'Equal', value: '='},
      {type: 'AttrValue', value: 'hello'},
      {type: 'AttrName', value: 'id'},
      {type: 'Equal', value: '='},
      {type: 'AttrValue', value: 'yes'},
      {type: 'AttrName', value: 'data-lol'},
      {type: 'Equal', value: '='},
      {type: 'AttrValue', value: 'cool'},
      {type: 'SelfClosingTagCarret', value: '/>'}
    ])
  })

  it('should parse all html attributes', () => {
    Object.values(allHTMLAttributes).forEach(attr => {
      expect(parseFragment(`<div ${attr}="cool" />`)).toEqual([
        {type: 'OpenCarret', value: '<'},
        {type: 'TagName', value: 'div'},
        {type: 'AttrName', value: attr},
        {type: 'Equal', value: '='},
        {type: 'AttrValue', value: 'cool'},
        {type: 'SelfClosingTagCarret', value: '/>'}
      ])
    })
  })
})
