class ErrorTemplate {
  constructor(type, content) {
    console.error(`${type}: ${content}`);
  }
}

class SyntaxError extends ErrorTemplate {
  constructor(content) {
    super('SyntaxError', content);
  }
}

class ParseError extends ErrorTemplate {
  constructor(content) {
    super('ParseError', content);
  }
}

class Unexpected extends ErrorTemplate {
  constructor(content) {
    super('Unexpected', content);
  }
}

class ProcessError extends ErrorTemplate {
  constructor(content) {
    super('ProcessError', content);
  }
}

module.exports = {
  SyntaxError, ParseError, Unexpected, ProcessError
}
