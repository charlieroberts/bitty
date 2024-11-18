// started with code from https://zserge.com/posts/js-editor/
window.bitty = {
  config: {
    flashTime:250,
    flashColor:'black',
    flashBackground:'white',
    value:'// itty bitty ide',
  },

  events: {},

  // load rules from external files
  rules: {},

  init( config={} ) {
    let el = null

    if( config.element === undefined ) {
      el = document.querySelector( `div[contenteditable="true"]` )
    }else{
      el = config.element
    }

    bitty.el = el

    Object.assign( bitty.config, config )
    bitty.value = bitty.config.value
    
    bitty.editor( el )
    bitty.publish( 'init', el )

    el.focus()
  },

  set value(v) {
    let code = bitty.process( v, true )
    code = code
      .split('\n')
      .map( l=> l === '' ? '<br/>' : l )
      .map( l=>`<div>${l}</div>`)
      .join('') 

    bitty.el.innerHTML = code
  },

  get value() {
    return bitty.el.innerText
  },
  
  // isString=true is for directly setting value
  // el should represent a node element
  process( el, isString=false ) {
    let s
    const keys = Object.keys( bitty.rules )
    const rules = bitty.rules
    if( isString ) {
      s = el
      for( let key of keys ) {
        s = s.replace( rules[key], `<span class=bitty-${key}>$1</span>` )
      }
    }else{
      for (const node of el.children) {
        s = node.innerText
        for( let key of keys ) {
          s = s.replace( rules[key], `<span class=bitty-${key}>$1</span>` )
        }

        node.innerHTML = s.split('\n').join('<br/>')
      }
    }

    return s
  },

  subscribe( key, fcn ) {
    const events = bitty.events
    if( typeof events[ key ] === 'undefined' ) {
      events[ key ] = []
    }
    events[ key ].push( fcn )
  },

  unsubscribe( key, fcn ) {
    const events = bitty.events
    if( typeof events[ key ] !== 'undefined' ) {
      const arr = events[ key ]

      arr.splice( arr.indexOf( fcn ), 1 )
    }
  },

  publish( key, data ) {
    const events = bitty.events
    if( typeof events[ key ] !== 'undefined' ) {
      const arr = events[ key ]

      arr.forEach( v => v( data ) )
    }
  },

  runBlock() {
    const sel = window.getSelection()
    let str = ''
    let parentEl = sel.anchorNode.parentElement
    let divs = []
   
    while( parentEl.localName !== 'div' ) parentEl = parentEl.parentElement
    
    const pbg = parentEl.style.background
    const pcolor = parentEl.style.color

    while( parentEl.previousSibling !== null && parentEl.previousSibling.innerText !== '\n' ) {
      if( parentEl.previousSibling.localName !== 'div' ) break
      parentEl = parentEl.previousSibling
    }
    
    divs.push( parentEl )

    while( parentEl.nextSibling !== null && parentEl.nextSibling.innerText !== '\n' ) {
      if( parentEl.nextSibling.localName !== 'div' ) break
      parentEl = parentEl.nextSibling
      divs.push( parentEl )
    }

    divs.forEach( d => {
      if( d.style ) {
        d.style.background = bitty.config.flashBackground
        d.style.color = bitty.config.flashColor
      }
    })

    setTimeout( _ => {
      divs.forEach( d => {
        if( d.style ){
          d.style.background = pbg
          d.style.color = pcolor
        }
      })
    }, bitty.config.flashTime )

    str = divs.map( d => d.innerText ).join('\n')

    bitty.publish( 'run', str )
  },

  runSelection() {
    const sel = window.getSelection()
    let str   = sel.toString()

    // single line execution
    if( str === '' ) {
      let parentEl = sel.anchorNode.parentElement

      // each div is a line
      // make sure we're not just selecting a surrounding span or
      // other element and getting all the way to the line div
      while( parentEl.localName !== 'div' ) parentEl = parentEl.parentElement

      str = parentEl.innerText
      const prevBg = parentEl.style.background
      const prevColor = parentEl.style.color
      parentEl.style.background = bitty.config.flashBackground
      parentEl.style.color = bitty.config.flashColor

      setTimeout( ()=> {
        parentEl.style.background = prevBg
        parentEl.style.color = prevColor
      }, bitty.config.flashTime )

    }else{
      // flash selection
      const sheet = document.styleSheets[0]
      const idx = sheet.insertRule('::selection{ color:black !important; background:white !important}' )
      setTimeout( ()=> sheet.removeRule( idx ), 250 )
    }

    bitty.publish( 'run', str )
  },

  editor(el, highlight = bitty.process, tab = '  ') {
    const caret = () => {
      const range = window.getSelection().getRangeAt(0)
      const prefix = range.cloneRange()
      prefix.selectNodeContents(el)
      prefix.setEnd(range.endContainer, range.endOffset)
      return prefix.toString().length
    }

    const setCaret = (pos, parent = el) => {
      for(const node of parent.childNodes) {
        if(node.nodeType == Node.TEXT_NODE) {
          if(node.length >= pos) {
            const range = document.createRange()
            const sel = window.getSelection()
            range.setStart(node, pos)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
            return -1
          } else {
            pos = pos - node.length
          }
        } else {
          pos = setCaret(pos, node)
          if (pos < 0) {
            return pos
          }
        }
      }
      return pos
    }

    const observer = new MutationObserver( mutations => {
      mutations.forEach( m => {
        if( m.addedNodes.length ) {
          bitty.publish( 'nodes added', m.addedNodes )
        }else{
          bitty.publish( 'nodes removed', m.removedNodes )
        }
      })
    })

    observer.observe(el, { childList: true })
    
    // when pasting into a blank line, the result
    // creates a div inside of a div. To avoid this,
    // we remove nodes that are blank lines or only line breaks
    // before pasting
    el.addEventListener("paste", function(e) {
      var text = (e.clipboardData || window.clipboardData).getData('text/plain');
      if( text.split('\n').length === 1 ) return
      var selection = window.getSelection();
      if (!selection.rangeCount) return;
      if( e.target.innerText === '' || e.target.innerText === '\n' ) e.target.remove()

      // now paste continues as usual, no blocking the default event...
    });
   
    el.addEventListener('keydown', e => {
      // handle tab key
      if(e.keyCode === 9) {
        const pos = caret() + tab.length
        const range = window.getSelection().getRangeAt( 0 )
        range.deleteContents()
        range.insertNode( document.createTextNode( tab ) )
        highlight( el )
        setCaret( pos )
        e.preventDefault()
      }else if( e.keyCode === 8 ) {
        // delete key
        // handle edge case when no divs are present
        // to write into by adding space; setting the value
        // of bitty automatically creates divs
        if( bitty.value === '\n' ) bitty.value =' '
      }

      bitty.publish( 'keydown', e )
    })

    // handle all other non-control keys
    el.addEventListener('keyup', e => {
      // do not refocus if ctrl key is pressed
      // this stops refocusing for ctrl+a, or ctrl+enter etc.
      if ( !e.ctrlKey &&  e.keyCode >= 0x30 || e.keyCode === 0x20) {
        const pos = caret()
        highlight( el )
        setCaret( pos )
      }else{
        switch( e.keyCode ) {
          case 8:
            // handle case when bitty is empty
            if( bitty.value === '\n' ) bitty.value = ' '
            break
          case 13: //enter
            if( e.ctrlKey ) {
              bitty.runSelection()
            }else if( e.altKey ) {
              bitty.runBlock()
            }
            break
          default: break
        }
      }
      bitty.publish( 'keyup', e )
    })  

    el.addEventListener( 'click', e => bitty.publish( 'click', e ) )
  }
}
