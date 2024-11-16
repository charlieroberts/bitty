# bitty

[Try it out](https://charlieroberts.github.io/bitty/demos/js)

bitty is a code editor specifically developed for live coding performance. The design goals are:

- Single file for easy include via one `<script>` tag
- Small. bitty is currently ~3KB minified.
- No build script (ok, there's optionally one to minify, but it's like totally optional)
- No Hypescript
- Zero dependencies
- Prioritize simplicity over speed. I don't care about parsing million line (or even thousand line. Not even thinking hundred lines, really...) files. Just keep it simple.

The default keybindings are:

- Ctrl+Enter: Run single line at current cursor location
- Alt+Enter:  Run block surrounding current cursor location. Blocks are delimited by blank lines (including spaces).

## To use
Call `bitty.init()`, maybe with some config options. Then call `bitty.subscribe( 'run', callback )` to register your callback function to be called whenever code is executed. 

Here's the [javascript demo](./demos/js/main.js):

```js
const initialCode = 
`function hello( name ) {
  console.log( name )
}
 
hello( 'bitty' )`

window.onload = function() {
  bitty.init({ 
    flashColor:'red',
    flashTime: 100,
    value: initialCode
  })

  bitty.subscribe( 'run', eval )
}
```

This project is in its early early days, more docs / demos to come.
