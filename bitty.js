// started with code from https://zserge.com/posts/js-editor/
let bitty = window.bitty = {
  instances: [],

  config: {
    flashTime:250,
    flashColor:'black',
    flashBackground:'white',
    value:'// itty bitty ide',
  },

  events: {},

  // load rules from external files
  rules: {},

  create( config={} ) {
    let el = null

    if( config.el === undefined ) {
      el = document.querySelector( `[contenteditable="true"]` )
    }else{
      el = config.el
    }

    const obj = Object.create( bitty )
    obj.el = el

    Object.defineProperty( obj, 'value', {
      set(v) {
        let code = this.process( v, true )
    
        code = this.divide( code ) 

        this.el.innerHTML = code
      },

      get() {
        return this.el.innerText
      }
    })

    const finalConfig = Object.assign( {}, bitty.config, config )
    const v = finalConfig.value
    delete finalConfig.value
    Object.assign( obj, finalConfig, { events:{} })

    if( v !== undefined ) obj.value = v

    obj.editor( obj, el )
    obj.publish( 'init', obj )

    bitty.publish( 'new', obj )

    el.focus()

    bitty.instances.push( obj )

    return obj
  },

  divide( code ) {
    const c = code
      .split('\n')
      .map( l=> { return l === ' ' || l === '' ? ' ' : l })
      .map( l=>`<div>${l}</div>`)
      .join('') 

    return c
  },

  focus() {
    this.el.focus()
  },
  
  // isString=true is for directly setting value
  // el should represent a node element
  process( s, isString=false ) {
    const el = this.el
    const keys = Object.keys( this.rules )
    const rules = this.rules
    if( isString ) {
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
    const events = this.events
    if( typeof events[ key ] === 'undefined' ) {
      events[ key ] = []
    }
    events[ key ].push( fcn )
  },

  unsubscribe( key, fcn ) {
    const events = this.events
    if( typeof events[ key ] !== 'undefined' ) {
      const arr = events[ key ]

      arr.splice( arr.indexOf( fcn ), 1 )
    }
  },

  publish( key, data ) {
    const events = this.events
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
    }, this.config.flashTime )

    str = divs.map( d => d.innerText ).join('\n')

    this.publish( 'run', str )
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
      }, this.config.flashTime )

    }else{
      // flash selection
      const sheet = document.styleSheets[0]
      const idx = sheet.insertRule('::selection{ color:black !important; background:white !important}' )
      setTimeout( ()=> sheet.removeRule( idx ), 250 )
    }

    this.publish( 'run', str )
  },

  editor( instance, el, tab = '  ') {
    const bitty = instance
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

    const checkForEmpty = function() {
      setTimeout( v => {
        if( bitty.el.childNodes.length === 1 && bitty.el.firstChild.localName === 'br' ) {
          const el = document.createElement('div')
          el.innerHTML = '&nbsp;'
          
          // in case plugin has placed class on <br>, copy it
          el.className = bitty.el.firstChild.className

          bitty.el.firstChild.remove()
          bitty.el.appendChild( el )

          setCaret( 0 )
        }else{
          const nodes = Array.from( bitty.el.childNodes )
          for( let node of nodes ) {
            if( node.localName === 'br' ) { // line break
              const div = document.createElement( 'div' )
              const pos = caret()
              div.innerHTML = '&nbsp;'
              node.replaceWith( div )
              setCaret( pos + 1 )
            }
          }
        }
      }, 10 )
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

    const noDivsInDivs = function() {
      for( let n of Array.from( bitty.el.childNodes ) ) {
        if( n.nodeType !== 3 ) {
          const lines = n.querySelectorAll('div')
          if( lines.length > 1 ) {
            for( let l of lines ) {
              bitty.el.insertBefore( l,n )
            }
          }
        }
      }
    }

    el.addEventListener( 'paste', e => {
      const text = (e.clipboardData || window.clipboardData).getData('text/plain')
      if( text.split('\n').length === 1 ) return
      
      const selection = window.getSelection()
      
      if (!selection.rangeCount ) return

      // new position is:
      // current position + (text length - line breaks)
      let pos = caret()
      // subtract one from length as last line won't actually contain line break
      const lineBreakCount = text.split('\n').length - 1
      pos += text.length - lineBreakCount 

      const shouldRemoveBlank = (
        e.target.innerText === '' 
        || e.target.innerText === ' ' 
        || e.target.innerText === '\n' 
        || e.target.innerText === '<br>'
      )

      if( e.target !== bitty.el && shouldRemoveBlank ) e.target.remove()

      setTimeout( ()=> { 
        bitty.el.innerHTML = bitty.divide( bitty.value )
        bitty.process()
        setTimeout( ()=>{ noDivsInDivs(); setCaret( pos ) }, 0 )
      }, 0 )

      bitty.publish( 'paste', e )
      // now paste continues as usual, no blocking the default event...
    });
    
   
    el.addEventListener( 'keydown', e => {
      // handle tab key
      if(e.keyCode === 9) {
        const pos = caret() + tab.length
        const range = window.getSelection().getRangeAt( 0 )
        range.deleteContents()
        range.insertNode( document.createTextNode( tab ) )
        //highlight( el )
        setCaret( pos )
        e.preventDefault()
      }else if( e.keyCode === 8 ) {
        // delete key
        checkForEmpty() 
      }

      bitty.publish( 'keydown', e )
    })

    // handle all other non-control keys
    el.addEventListener('keyup', e => {
      // do not refocus if ctrl key is pressed
      // this stops refocusing for ctrl+a, or ctrl+enter etc.
      if ( !e.ctrlKey &&  e.keyCode >= 0x30 || e.keyCode === 0x20) {
        const pos = caret()
        bitty.process()
        setCaret( pos )
      }else{
        switch( e.keyCode ) {
          case 8:
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
