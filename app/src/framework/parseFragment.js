const Token = {
  OpenCarret: 'OpenCarret',
  CloseCarret: 'CloseCarret',
  ClosingTagCarret: 'ClosingTagCarret',
  SelfClosingTagCarret: 'SelfClosingTagCarret',
  AttrName: 'AttrName',
  AttrValue: 'AttrValue',
  Equal: 'Equal',
  String: 'String',
  TagName: 'TagName'
}

export const tokenizer = input => {
  let current = 0
  const tokens = []

  while (current < input.length) {
    let char = input[current]
    const previousToken = tokens[tokens.length - 1]

    if (char === '<') {
      if (input[current + 1] === '/') {
        tokens.push({
          type: Token.ClosingTagCarret,
          value: '</'
        })

        current += 2
      } else {
        tokens.push({
          type: Token.OpenCarret,
          value: '<'
        })

        current++
      }

      continue
    }

    if (char === '>') {
      tokens.push({
        type: Token.CloseCarret,
        value: '>'
      })

      current++
      continue
    }

    if (char + input[current + 1] === '/>') {
      tokens.push({
        type: Token.SelfClosingTagCarret,
        value: '/>'
      })

      current += 2
      continue
    }

    // If Whitespace, continue
    const WHITESPACE = /\s/
    if (WHITESPACE.test(char)) {
      current++
      continue
    }

    const LETTER =
      previousToken && previousToken.type === Token.CloseCarret
        ? /[^<]/
        : /[a-z0-9-]/i

    if (LETTER.test(char)) {
      let value = ''

      while (LETTER.test(char)) {
        value += char
        char = input[++current]
      }

      if (!previousToken) {
        tokens.push({
          type: Token.String,
          value
        })
      } else if (
        previousToken.type === Token.OpenCarret ||
        previousToken.type === Token.ClosingTagCarret
      ) {
        tokens.push({
          type: Token.TagName,
          value
        })
      } else if (
        previousToken.type === Token.TagName ||
        previousToken.type === Token.AttrValue
      ) {
        tokens.push({
          type: Token.AttrName,
          value
        })
      } else if (previousToken.type === Token.CloseCarret) {
        tokens.push({
          type: Token.String,
          value
        })
      }

      continue
    }

    // Equal
    if (char === '=') {
      tokens.push({
        type: Token.Equal,
        value: '='
      })
      current++
      continue
    }

    // Strings
    if (char === '"' || char === "'") {
      let value = ''

      if (char === '"') {
        char = input[++current]
        while (char !== '"' && char !== undefined) {
          value += char
          char = input[++current]
        }
      } else if (char === "'") {
        char = input[++current]
        while (char !== "'" && char !== undefined) {
          value += char
          char = input[++current]
        }
      }

      if (!previousToken) {
        tokens.push({
          type: Token.String,
          value
        })
      } else if (previousToken.type === Token.Equal) {
        tokens.push({
          type: Token.AttrValue,
          value
        })
      } else {
        tokens.push({
          type: Token.String,
          value
        })
      }

      current++
      continue
    }

    throw new TypeError('I dont know what this character is: ' + char)
  }

  return tokens
}

const Context = {
  Attr: 'Context.Attr',
  Element: 'Context.Element'
}

export const parser = (tokens = []) => tokens

export default function parseFragment(htmlFragment) {
  return parser(tokenizer(htmlFragment))
}
