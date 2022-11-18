# ION-PARSER

ion-parser is the fastest and lightest Javascript parser for TOML and ION files.

TOML stands for **T**om's **O**bvious and **M**inimal **L**anguage and it is an awesome language for your configuration files, better than JSON and YAML on many aspects. [Learn here](https://github.com/toml-lang/toml) what is TOML and how to use it (it's definitely worth the ten minutes learning).

ION stands for **I**ntuitive **O**bject **N**otation. It is 90% inspired by TOML and, compared to TOML, facilitate the creation of arrays and completely remove the need to use commas. Any TOML file is a valid ION file, although the opposite is not true.

See [below](#ion) the differences between TOML and ION.


## Usage
First, install ion-parser : `npm i ion-parser`.

Then, let's suppose we have the following ION / TOML file :

```
# myFile.toml
title = 'Hey universe'

[soundOptions]
volume = 68
soundName = 'Hey universe'
file = 'sounds/hey-universe.mp3'
```

We read the file and transform it into a javascript object this way :

```javascript
const ION = require('ion-parser')
const fs = require('fs')

const data = ION.parse(fs.readFileSync('myFile.toml'))
console.log(data.title)  // 'Hey universe'
console.log(data.soundOptions.volume)  // 68
```

### ION.parseFile
If you want to read from a file, you can directly use the `ION.parseFile` function :

```javascript
const ION = require('ion-parser')

// sync (will throw an error in case of bad syntax or bad file reading)
const data = ION.parseFile('myFile.toml')
console.log(data)

// async
ION.parseFile('myFile.ion', (err, data) => {
  console.log(err || data)
})
```


### Javascript template strings
You also can use the parser with Javascript template strings :

```javascript
const ION = require('ion-parser')
const data = ION `
  title = 'Hey universe'

  [soundOptions]
  volume = 68
  soundName = 'Hey universe'
  file = 'sounds/hey-universe.mp3'
`
console.log(data.title)  // 'Hey universe'
console.log(data.soundOptions.volume)  // 68
```


### Using in browser
You can download the browser version of ion-parser [here](https://github.com/Lepzulnag/ion-parser/blob/master/%40lepzulnag-browser/ion-parser.js). 

Just add the file to your project and require it with a script tag. You can then use the globally defined `ION` object.


## Speed and size comparison with other parsers
Here is the comparison between **ion-parser** and the other 0.5.0-compliant TOML parsers for Javascript :

- [Iarna](https://www.npmjs.com/package/@iarna/toml)'s Toml
- [LongTengDao](https://www.npmjs.com/package/@ltd/j-toml)'s Toml
- [Bombadil](https://www.npmjs.com/package/@sgarciac/bombadil) (wich use the *Chevrotain Parser Building Toolkit*)

*(All time values are milliseconds)*

|                                                                 | ion-parser | Iarna's toml | LongTengDao's j-toml | Bombadil |
|-----------------------------------------------------------------|------------|--------------|----------------------|----------|
| Require                                                         | 2.375      | 14.720       | 5.969                | 196.741  |
| First round                                                     | 9.489      | 13.911       | 12.267               | 69.970   |
| One-use (require+first round)                                   | 11.864     | 28.631       | 18.236               | 266.711  |
| Warm round                                                      | 1.483      | 7.275        | 1.420                | 34.878   |
| Hot round                                                       | 0.501      | 0.604        | 0.627                | 6.639    |
| Package size (Including other modules, readme, sourcemaps, ...) | 20.9 Ko    | 93.1 Ko      | 261 Ko               | +3000 Ko |


The comparison has been made in a Node 11.2.0 environment with this medium-size [sample TOML file](https://gist.github.com/robmuh/7966da29024c075349a963840e2298b2), which covers about all the different ways to use TOML.

The comparison has been made in three rounds because of the way Javascript works :

* For the first round, the Javascript engine has done no compilation yet. The functions are directly interpreted when evaluated.
* After a fisrt round, the Javascript engine will do some light compilation called *warming*. That's why the second call is faster than the first.
* If a function is called many times, the Javascript engine will do *hot* compilation optimisations so that the function runs super-fast.

Bombadil is so big and slow compared to others parsers because it uses a third-party library (Chevrotain) - even though Chevrotain is describing itself as 'blazing fast'.

`ion-parser` is also robust. Errors are prettily handled, giving you informations about any bad syntax.



## <a name="ion"></a>Differences between ION and TOML
There are not so many differences between ION and TOML. Basically, every TOML file is a valid ION file. Still, ION improves TOML on the following points :

### 1. Unnecessary commas
Adding commas before every end of line is not always pleasant and not necessary for neither a computer nor a human to understand the code. What must be written this way in TOML :

```
# TOML
point = {
  x = 12,
  y = 152
}
colors = [
  'red',
  'green',
  'pink',
]
```
can be written this way with ION files :
```
# ION
point = {
  x = 12
  y = 152
}
colors = [
  'red'
  'green'
  'pink'
]

# This is the same as :
colors = [
  'red', 'green'
  'pink'
]
```

### 2. Intelligent array creation
There is another way to create array with ION files. Let's use our previous exemple :

```
# TOML
colors = [
  'red',
  'green',
  'pink',
]
```

```
# ION
[colors]
'red'
'green'
'pink'
```

Any value without a key will be considered as an array's element.


### 3. String values with no quotation marks
A human know what is a number and what is not. Obviously. And so does ion-parser.

Using quotation marks is not necessary with `.ion` files, although it is always a good practice and should be used in any case of ambiguity.

This is valid :

```
# ION
title = Hey universe 

[colors]
red
green
pink
```
