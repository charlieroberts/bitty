# bitty

[Try it out](https://charlieroberts.github.io/bitty/demos/js)

bitty is a code editor specifically developed for live coding performance. The design goals are:

- Single file for basic configuration to include via one `<script>` tag
- Small. bitty is currently ~6 KB minified. Other popular editors (albeit containing many more features) are between 125--350 KB minified.
- No build script (ok, there's optionally one to minify, but it's, like, totally optional)
- Zero dependencies
- Prioritize simplicity over speed
- Responsive design / mobile support
- Accessible to alternative reading devices
- Code annotations / visualizations (eventually)

## Key bindings
The default keybindings are:

- `Ctrl+Enter`: Run (and flash) single line at current cursor location
- `Alt+Enter`:  Run (and flash) block surrounding current cursor location. Blocks are delimited by blank lines (including spaces).

## Syntax coloring
bitty tries to be as flexible as possible in enabling you to decide what parts of your syntax should be highlighted and how. `bitty.rules` contains a dictionary of regular expressions associated with syntax categories. Whenever a match for a rule is found, a CSS custom highlight is applied with the same name as the rule. For example, below is the CSS and JS required to make a highlight for numbers.

```css
::highlight(numbers) { background-color:red; color:white; }
```

```js
bitty.rules = {
  numbers: /\b(\d+)/g 
}
```

The [CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API) only supports a small subset of CSS that doesn't affect page layout; this stops the highlights from forcing entire page redraws and instead limits redraw to the highlights alone, improving efficiency. The subset includes:

- `background-color`
- `color`
- `caret-color` (aka cursor color)
- `text-shadow` (not currently supported in Firefox)
- `text-decoration` (not currently supported in Firefox)

To "disable" syntax coloring, just don't specify a value for `bitty.rules`. If you're not comfortable using regular expressions, [here is a great playground to explore](https://regexr.com/).

## To use
Call `bitty.create()`, maybe with some config options, to return a new bitty instance. If you name that instance `b`, call `b.subscribe( 'run', callback )` to register your callback function to be called whenever code is executed. 

Here's the [javascript demo](./demos/js/main.js):

```js
const initialCode = 
`function hello( name ) {
  console.log( name )
}
 
hello( 'bitty' )`

window.onload = function() {
  const b = bitty.create({ 
    flashColor:'red',
    flashTime: 100,
    value: initialCode
  })

  // just eval the code that is passed to the callback
  b.subscribe( 'run', eval )
}
```

## Config options
- *el*: The `contenteditable` `<div>` tag that will be used to present the editor. If no `el` is configured then bitty will use the first `contenteditable` div it finds on the page.
- *value*: A text string to use as the initial code in the editor.
- *flashColor*: A CSS string representing the color text should take when it "flashes" to indicate that it's being run.
- *flashBackground*: A CSS string representing of the background color text should take when it "flashes".
- *flashTime*: The number of milliseconds code is flashed when it is run.

This project is in its early early days, more docs / demos to come.
