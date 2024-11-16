# bitty

[Try it out](https://charlieroberts.github.io/bitty/demos/js)

bitty is a code editor specifically developed for live coding performance. The design goals are:

- Single file for easy include via one `<script>` tag
- Small. bitty is currently ~3 KB minified. Other popular editors (albeit containing many more features) are between 125--350 KB minified.
- No build script (ok, there's optionally one to minify, but it's, like, totally optional)
- Zero dependencies
- Prioritize simplicity over speed
- Code annotations / visualizations (eventually)

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
