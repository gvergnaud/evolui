export class OpenComponent {
  constructor(name) {
    this.name = name;
  }
}
export class CloseComponent {}

export class OpenElement {
  constructor(name) {
    this.name = name;
  }
}
export class CloseElement {}

export class SetAttribute {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }
}
export class RemoveAttribute {
  constructor(name) {
    this.name = name;
  }
}

export class ToggleClassName {
  constructor(className, force = false) {
    this.className = className;
    this.force = force;
  }
}

export class CreateTextNode {
  constructor(content) {
    this.content = content;
  }
}
export class UpdateTextNode {
  constructor(content) {
    this.content = content;
  }
}
export class ReplaceByTextNode {
  constructor(content) {
    this.content = content;
  }
}
export class RemoveTextNode {}

export class Binding {}
