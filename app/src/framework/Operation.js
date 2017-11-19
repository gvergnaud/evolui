export class CreateElement {
  constructor(name) {
    this.name = name
  }
}

export class CreateTextNode {
  constructor(content) {
    this.content = content
  }
}

export class UpdateTextNode {
  constructor(content) {
    this.content = content
  }
}

export class ReplaceByTextNode {
  constructor(content) {
    this.content = content
  }
}

export class RemoveTextNode {}

export class CloseElement {}

export class Variable {}
