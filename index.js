const {readFileSync} = require('fs')
const {spawnSync} = require('child_process')

const {Unexpected, ProcessError} = require('./error.js')

const log = console.log
const warn = console.warn

class Hust {
  #fileName = "hustfile"

  init() {
    const result = this.#getArg()
    const recipes = this.#lexer(this.#readFile(this.#fileName))
    
      if (!recipes)
        return new Unexpected(`No hustfile in cwd`)

    if (isNaN (result)) {
      const recipe = recipes.filter(rec => rec.name == result)[0]

      if (!recipe)
        return new Unexpected(`"${result}" is not a recipe`)

      return this.#exec(recipe)
    }
    else switch (result) {
      case -1:
        this.#read(recipes)
        break
      case 0:
        this.#show(recipes)
        break
    }
  }

  #getArg() {
    const args = process.argv
    args.shift()
    args.shift()
    return this.#parseArg(args[0] || '-l')
  }

  #parseArg(arg) {
    let result = undefined
    if (arg.startsWith('-')) switch(arg) {
      case '-h': case '--help': default:
        result = 0
        break
      case '-l': case '--list':
        result = -1
        break
    } else result = arg

    return result
  }

  #readFile(fileName) {
    let buffer = ''
    try {
      const str = readFileSync(fileName, 'utf-8')
      return (buffer = str)
    } catch (_) {
      buffer = ''
    }
    return buffer
  }

  #lexer(buffer) {
    const regex = {
      comment: /#.*\n/gm,
    }

    if (!buffer) return undefined

    const lines = buffer
      .replace(regex.comment, '\n')
      .trim()
      .split('\n')
      .filter(s => !!s.length)

    let recipes = []
    let currentCmd = null;

    for (const line of lines) {
      if (line.includes('::')) {
        if (currentCmd) recipes.push(currentCmd)

      const name = line.split('::')[0].trim()
      currentCmd = { name, commands: [] }
      }
      else if (currentCmd && line.startsWith(' ')) {
        currentCmd.commands.push(line.trim())
      }
    }

    if (currentCmd)
      recipes.push(currentCmd)

    return recipes;
  }

  #read(recipes) {
    log('Available recipes:\n')
    recipes.forEach(rec => {
      log('%s ::', rec.name)
      rec.commands.forEach(command =>
        log('   %s', command)
      )
      log()
    })
  }

  #show(recipes) {
    return log(JSON.stringify(recipes, null, 2))
  }

  #exec(recipe) {
    const {name, commands} = recipe

    let i = 0;

    while (i <= commands.length - 1) {
      const command = commands[i];

      warn(`-> ${command}`)

      const s = command.split(' ')
      const cmd = s[0]
      const args = s.slice(1)
      const proc = spawnSync(cmd, args)

      if (proc.status != 0) {
        const stderr = proc.stderr.toString()

        new ProcessError('\n' + stderr.length == 0 
          ? 'while running the last command'
          : stderr
        )
        log('Process exited with status %s', proc.status)
        break;
      }
      const stdout = proc.stdout.toString()
      stdout.length == 0 ? undefined : log('\n' + stdout)

      i++;
    }
  }
 }

const hust = new Hust
hust.init()
