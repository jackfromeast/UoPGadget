'use strict'

let source, position
let fs  // we don't require the fileSystem yet because : 1. it may not be used, 2. it won't work on browsers


function parse(src) {
	if (typeof src != 'string')
		src = String(src)
	const scope = new Scope
	const inlineTypes = []

	source = src
	position = 0
	let key = ''
	let val = ''
	let start, end, stop
	let c = source[0]
	let defineKey = true  // first define key, then value
	let data = {}
	let mustAssign = false

	// add a key[/val] to the data
	const addKey = () => {
		if (defineKey) {
			if (key)
				scope.push(trueValue(key.trimEnd()))
		}
		else {
			if (!val)
				throw error("Expecting value after =")
			scope.set(key.trimEnd(), trueValue(val.trimEnd()))
		}

		key = ''
		val = ''
		defineKey = true
	}



	// let's start to parse
	do switch (c) {
		// useless whitespace
		case ' ':
			if (defineKey) {
				if (key)
					key += c
			}
			else if (val)
				val += c
		case '\t':
		case '\r':
		continue


		// comment
		case '#':
			position = source.indexOf('\n', position+1) - 1
			if (position == -2)
				position = Infinity
		continue



		case '"':
		case "'":
			if (!defineKey && val) {
				val += c
				continue
			}

			let triple = (source[position+1] == c && source[position+2] == c)
			end = fragment(source, position, true)

			if (defineKey) {
				if (key)
					throw error('Unexpected '+c)
				if (triple)
					key += source.slice(position+2, end-2)
				else
					key += source.slice(position, end)
				position = end
			}

			else {
				// else, we define the val
				val = source.slice(position, end)

				position = end
				if (triple) {
					val = val.slice(2, -2)
					if (val[1] == '\n')
						val = val[0] + val.slice(2)
					else if (val[1] == '\r' && val[2] == '\n')
						val = val[0] + val.slice(3)
				}
			}

			// we then skip whitespaces
			position = skipWhiteSpaces(source, position)
			c = source[position]

			// and make sure we meet a valid character
			if (c && c != ',' && c != '\n' && c !='#' && c !='}' && c !=']' && c != '=')
				throw error("Unexpected character after end of string")

			position--
		continue


		// new key
		case '\n':
		case ',':
		case undefined:
			addKey()
		continue


		// new scope
		case '[':
		case '{':
			stop = (c == '[' ? ']' : '}')

			// use global scope
			if (defineKey && !inlineTypes.length) {
				if (key)
					throw error("Unexpected "+c)
				end = fragment(source, position)
				
				if (source[position+1] == c) {  // case '[[' -> array of table
					if (source[end-2] != stop)
						throw error("Missing "+stop+stop)
					scope.useArray(source.slice(position+2, end-2))
				}
				else
					scope.use(source.slice(position+1, end-1))

				position = end
			}

			// enter inline scope inside inline scope (without value)
			else if (defineKey) {
				if (key)
					throw error("Unexpected "+c)
				scope.enterArray(c == '[')
				inlineTypes.push(stop)
			}
			
			// enter inline scope
			else {
				if (val)
					throw error("Unexpected "+c)
				scope.enter(key, c == '[')
				inlineTypes.push(stop)
				key = ''
				defineKey = true
			}

		continue


		// exit an inline scope
		case ']':
		case '}':
			// we add the last element
			if (key)
				addKey()

			if (inlineTypes.pop() != c)
				throw error("Unexpected "+c)
			scope.exit()

			position = skipWhiteSpaces(source, position+1)
			c = source[position]

			if (c && c != ',' && c != '\n' && c !='#' && c !='}' && c !=']')
				throw error("Unexpected character after end of scope")
			position--

		continue

		// assignment
		case '=':
			if (defineKey) {
				if (!key)
					throw error("Missing key before "+c)
				defineKey = false
			}
			else
				throw error("Unexpected "+c)
		continue



		// other character
		default:
			if (defineKey)
				key += c
			else
				val += c

	} while ((c = source[++position]) || key)

	// missing } or ]
	if (inlineTypes.length)
		throw error("Missing "+inlineTypes.pop())

	return scope.data
}


/**
* Skip whitespaces : [ \t\r]
*/
function skipWhiteSpaces(str, x=0) {
	let c
	while ((c = str[x++]) && (c == ' ' || c == '\t' || c == '\r'));
	return x - 1
}




/**
* Return the offset of the closing part of the string fragment.
* A string fragment is opened by any character among <[({'"``
* The closing characters are respectively >])}'"`
* @param swim - indicates if sub-opening and sub-closing characters must me ignored.
* For '(())', with swim=false -> '(()', with swim=true -> '(())' 
* @return - the offset of the closing character + 1
*/
function fragment(str, x=0, allowTriple=false) {
	let c = str[x]
	let end
	let start = c, stop = c
	let swim = true
	let errorOnLineBreak = false
	

	switch (c) {
		case '"':
		case "'":
			end = x+1
			if (allowTriple && str[x+1] == c && str[x+2] == c) {
				stop = c + c + c
				end += 2
			}
			else {
				errorOnLineBreak = true
			}

			// if it's a ' we don't look for escape
			if (c == "'") {
				end = str.indexOf(stop, end) + 1
			}

			// if it's a " we do look for escape
			else while (end = str.indexOf(stop, end)+1) {
				let free = true
				let s = end - 1
				while (str[--s] == '\\')
					free = !free
				if (free)
					break
			}

			if (!end)
				throw error("Missing " + stop + " closer")

			if (c != stop)
				end += 2
			else if (errorOnLineBreak) {
				let nextLineBreak = str.indexOf('\n', x+1) +1
				if (nextLineBreak && nextLineBreak < end) {
					position = nextLineBreak - 2
					throw error("Forbidden end-of-line character in single-line string")
				}
			}

		return end  // 0 if the end has not been found

		case '(':
			stop = ')'
			break
		case '{':
			stop = '}'
			break
		case '[':
			stop = ']'
			break
		case '<':
			stop = '>'
			break
		default:
			swim = false
	}

	// on trouve le délimiteur de stop
	let depth=0
	while (c = str[++x]) {
		if (c == stop) {
			if (depth == 0)
				return x + 1
			depth--
		}

		else if (c == '"' || c == "'") {
			let end = fragment(str, x, allowTriple)  // we go to the end of the string
			x = end - 1
			// else  // should we throw?
			// 	throw "Missing "+c  // at position : x
		}
		else if (swim && c == start)
			depth++
	}

	throw error("Missing "+stop)
}




/**
* The class used to manipulate the data
*/
class Scope {
	constructor(data={}) {
		this.data = data
		this.scopeList = []
	}

	
	// return the last scope
	getCurrentScope() {
		return this.scopeList[this.scopeList.length-1]
	}

	
	// merge all scope elements together
	getFullScope(extra=null) {
		let result = []
		for (let scope of this.scopeList)
			result = result.concat(scope.elements)
		if (extra)
			result = result.concat(extra)
		return result
	}


	// set a value to the data
	set(key, val) {
		let keyElements = splitElements(key)
		key = keyElements.pop()
		let elements = this.getFullScope(keyElements)
		let data = getTable(this.data, elements)
		if (typeof data == 'string')
			return data
		data[key] = val
	}

	// push a value to the data
	// (transform the mother into an array if it was an object)
	push(val) {
		// if we add directly to the main data
		if (!this.scopeList.length) {
			if (!Array.isArray(this.data)) {
				let data = this.data
				this.data = []
				Object.assign(this.data, data)
			}
			this.data.push(val)
			return this.data
		}

		let elements = this.getFullScope()
		let momName = elements.pop()
		let data = getTable(this.data, elements)
		
		// we check there is no error
		if (typeof data == 'string')
			return data

		let mom = data[momName]

		switch (typeof mom) {
			case 'object':
				if (Array.isArray(mom))
					break
			case undefined:
				data[momName] = Array()
				Object.assign(data[momName], mom)
				mom = data[momName]
			break

			default:
				return '["'+ elements.join('"].["') +'"].["'+momName+'"] must be an object'
		}
		mom.push(val)
		return mom
	}


	// use a global scope
	use(raw) {
		const scope = globalScope(raw)
		const currentScope = this.getCurrentScope()
		if (currentScope && currentScope.isGlobal)
			this.scopeList.pop()
		this.scopeList.push(scope)

		// we create the table if it does not exist
		getTable(this.data, this.getFullScope())
	}

	// use a global array scope
	useArray(raw) {
		this.use(raw)
		let mom = this.push({})
		let index = mom.length - 1
		this.use(raw+'.'+index)
	}


	// enter an inline scope
	enter(raw, isArray=false) {
		this.scopeList.push(inlineScope(raw.trimEnd()))
	
		// we create the data
		let elements = this.getFullScope()
		let baby = elements.pop()
		let mom = getTable(this.data, elements)
		
		if (!(baby in mom))
			mom[baby] = isArray ? [] : {}
	}

	// push and enter an inline array scope
	enterArray(isArray=false) {
		let array = this.push(isArray? [] : {})  // we push an empty object
		this.scopeList.push(inlineScope(array.length - 1))  // we point to the last element
	}


	// exit an inline scope
	exit() {
		let scope
		while ((scope = this.scopeList.pop()) && scope.isGlobal);
	}
}







/**
* Create a globalScope or an inlineScope object
*/
const globalScope = raw =>({
	isGlobal: true,
	elements: splitElements(raw)
})

const inlineScope = raw =>({
	isInline: true,
	elements: splitElements(raw)
})







/**
* Split a string scope into elements
*/
function splitElements(raw) {
	if (typeof raw != 'string')
		raw = String(raw)
	let x = -1
	let elt = ''
	let elements = []
	let end
	let c

	while (c = raw[++x]) switch (c) {
		case '.':
			if (!elt)
				throw error('Unexpected "."')
			elements.push(elt)
			elt = ''
		continue

		case '"':
		case "'":
			end = fragment(raw, x)
			if (end == x+2)
				throw error('Empty string key')
			elt += raw.slice(x+1, end-1)
			x = end-1
		continue

		default:
			elt += c
	}

	// we add the last one
	if (elt)
		elements.push(elt)

	return elements
}



/**
* Return the given object in data
* The result will/must be an object
*/
function getTable(data, elements=[]) {

	for (let elt of elements) {

		if (!(elt in data))
			data[elt] = {}

		else if (typeof data[elt] != 'object') {
			let path = '["'+elements.slice(0, elements.indexOf(elt)+1).join('"].["')+'"]'
			throw error(path + ' must be an object')
		}

		data = data[elt]
	}

	return data
}


/**
* Return a true-typed value from a string value.
*/
function trueValue(val) {
	switch (val[0]) {
		case undefined:
			return ''

		case '"':
			// let's escape characters
			return escape(val.slice(1, -1))
		case "'":
			return val.slice(1, -1)

		case '0':
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
		case '+':
		case '-':
		case '.':
			let num = val
			if (num.indexOf('_') != -1)
				num = num.replace(/_/g, '')
			if (!isNaN(num))
				return (+num)

			if (val[4] == '-' && val[7] == '-') {
				let date = new Date(val)
				if (date.toString() != 'Invalid Date')
					return date
			}
			else if (val[2] == ':' && val[5] == ':' && val.length >= 7) {
				let date = new Date('0000-01-01T'+val+'Z')
				if (date.toString() != 'Invalid Date')
					return date
			}
			return val
	}

	switch (val) {
		case 'true': return true
		case 'false': return false
		
		case 'nan':
		case 'NaN': return false

		case 'null': return null
		
		case 'inf':
		case '+inf':
		case 'Infinity':
		case '+Infinity': return Infinity
		case '-inf':
		case '-Infinity': return -Infinity
	}

	return val
}



/**
* Escape characters from a string
*/
function escape(str) {
	let i, offset = 0
	let result = ''
	let elt

	while (i = str.indexOf('\\', offset) + 1) {
		result += str.slice(offset, i-1)

		switch (str[i]) {
			case '\\':
			result += '\\'
			break

			case '"':
			result += '"'
			break

			case '\r':
			if (str[i+1] == '\n')
				i++
			case '\n':
			break

			case 'b':
			result += '\b'
			break

			case 't':
			result += '\t'
			break

			case 'n':
			result += '\n'
			break

			case 'f':
			result += '\f'
			break

			case 'r':
			result += '\r'
			break

			case 'u':  // small unicode
			result += String.fromCharCode(parseInt(str.substr(i+1, 4), 16))
			i += 4
			break

			case 'U':  // big unicode
			result += String.fromCharCode(parseInt(str.substr(i+1, 8), 16))
			i += 8
			break

			default:
				throw error(str[i])
		}

		offset = i + 1
	}

	return result + str.slice(offset)
}





/**
* Return the {column, line, position, lineContent} location object
* Read from *source* and *position*
*/
function getLocation() {
	let c = source[position]
	let offset = position
	if (c == '\n')
		offset--
	let line = 1
	let i = source.lastIndexOf('\n', offset)
	let stop = source.indexOf('\n', offset)
	if (stop == -1)
		stop = Infinity
	if (c == ',' || c == '\n')
		offset = i + 1

	if (i == -1)
		return {
			line,
			column: offset + 1,
			position: offset,
			lineContent: source.slice(0, stop).trim()
		}

	const column = offset - i + 1
	const lineContent = source.slice(i+1, stop).trim()
	line++

	while ((i = source.lastIndexOf('\n', i-1)) != -1)
		line++

	return {line, column, position: offset, lineContent}
}




/**
* Create an error message with information on the line and the column
*/
function error(msg) {
	let loc = getLocation()
	let lineString = String(loc.line)
	msg += '\n'+lineString+' |  '+loc.lineContent+'\n'
	msg += ' '.repeat(lineString.length + loc.column + 2) + '^'

	return SyntaxError(msg)
}



/**
* Use this function to parse javascript template strings :
* let obj = ION `foo = 12`
*/
function ION() {
	let result = ''
	for (let arg of arguments)
		result += typeof arg == 'string'? arg : arg[0]
	return HUML.parse(result)
}

ION.parse = parse

ION.parseFile = function(file, cb=null) {
	if (!fs)
		fs = require('fs')

	if (cb) {  // async
		fs.readFile(file, (err, data) => {
			if (err)
				cb(err, null)
			else try {
				cb(null, parse(data))
			}
			catch (err) {
				cb(err, null)
			}
		})
	}
	else  // sync
		return parse(fs.readFileSync(file))
}


module.exports = ION
