// started with code from https://zserge.com/posts/js-editor/
const bitty = window.bitty = {
  instances: [],

  baseFontSize: 12,

  uid:0,
  getUID() {
    return this.uid++
  },

  config: {
    flashTime:250,
    flashColor:'black',
    flashBackground:'white',
    value:'// itty bitty ide',
  },

  events: {},

  // load rules from external files
  rules: {},

  keyManager( bitty ) {
    const manager = {
      bitty,
      combos: [],

      process( e ) {
        for( let key of manager.combos ) {
          if( e.key === key.key ) {

            if( key.ctrl && !e.ctrlKey )   continue
            if( key.shift && !e.shiftKey ) continue
            if( key.alt && !e.altKey )     continue
            if( key.meta && !e.metaKey )   continue

            key.fnc( e )

            return
          }
        }   
      },

      register( keyStr, fnc ) {
        const parts = keyStr.split( '+' )
        const k = { key: parts[ parts.length - 1 ] }

        if( parts.length > 1 ) {
          for( let i = 0; i < parts.length - 1; i++ ) {
            const mod = parts[ i ].toLowerCase()
            k[ mod ] = true
          }
        }

        k.fnc = fnc

        manager.combos.push( k )
      },
    }

    bitty.subscribe( 'keydown', manager.process.bind( manager ) )
    
    return manager
  },

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
        this.el.innerHTML = this.divide( v ) 
        this.process( v, true )
      },

      get() {
        return this.el.innerText
      }
    })

    const finalConfig = Object.assign( {}, bitty.config, config )
    const v = finalConfig.value
    delete finalConfig.value
    Object.assign( obj, finalConfig, { events:{}, timeout:null })

    if( v !== undefined ) obj.value = v

    obj.editor( obj, el )
    obj.publish( 'init', obj )
    obj.keyManager  = bitty.keyManager( obj )

    bitty.publish( 'new', obj )

    el.focus()

    bitty.instances.push( obj )

    return obj
  },

  divide( code ) {
    const c = code
      .split('\n')
      .map( l =>  l === '' ? '\n' : l ) // div cannot be empty or it will collapse
      .map( l => `<div>${l}</div>` )
      .join('') 

    return c
  },

  focus() {
    this.el.focus()
  },
  
  changeFontSize( amt ) {
    this.baseFontSize += amt
    this.el.style.fontSize = this.baseFontSize + 'px'
  },
  
  process( s ) {
    if( typeof Highlight === 'function' ) {
      const el = this.el
      const rules = this.rules
      const keys = Object.keys( rules )

      // can't use textContent because it doesn't use line breaks.
      // if a line is only a break, remove it so that the whole array
      // can be joined with newlines... this prevents duplicate newlines.
      // not sure why the newline is replaced with a ' ', but making it
      // empty causes errors... something to do with checking for empty
      // divs??? the space is removed at some processing stage.
      const text = Array.from(el.childNodes)
              .map( n => n.innerText !== '\n' ? n.innerText : ' ' )
              .join( '\n' ) 

      // loop through rules, create highlight for each one
      // add found ranges to highlight and then set the highlight
      for( let key of keys ) {
        const hl = new Highlight()
        while ((match = rules[key].exec(text)) !== null) {
          //console.log( `Found ${match[0]} start=${match.index} end=${rules[key].lastIndex} key=${key}.` )  
          this.markRange( match.index, rules[key].lastIndex, key, hl )
        }
        CSS.highlights.set( key,hl )
      }

      return text
    }
  },

  // rules are matched against the entire program
  // text. this function loops through all divs found
  // in the main bitty element, and creates ranges
  // relative to the div that contains them. if matches
  // span multiple divs (multiple lines) then the range
  // is applied across each div
  markRange( start, end, type, highlights ) {
    let count = 0
    let continuing = false
    for( let node of this.el.childNodes ) {
      const nodeLength = node.innerText.length
      if( count + nodeLength >= start ) {
        if( count + nodeLength >= end ) {
          const range = new Range()
          const s = continuing ? 0 : start - count
          const e = end - count
          //console.log( start,end,s,e,node )
          range.setStart(node.firstChild, s )
          range.setEnd(node.firstChild, e )
          highlights.add( range )
          continuing = false
          break
        }else{
          const range = new Range()
          const s = continuing ? 0 : start - count 
          const e = nodeLength
          //console.log( start,end,s,e,node )
          range.setStart(node.firstChild, s )
          range.setEnd(node.firstChild, e )
          highlights.add( range )
          continuing = true
        }
      }
      // add one to account for line breaks
      // added to text in getAllText()
      count += node.innerText.length + 1
    }
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

    const sheet = document.styleSheets[0]
    const flashClass = `flash${this.getUID()}`

    const rule = `.${flashClass} { 
      background: ${this.flashBackground} !important;
      color: ${this.flashColor} !important;
    }`

    const idx = sheet.insertRule( rule )

    divs.forEach( d => d.classList.add( flashClass ) )

    setTimeout( _ => {
      divs.forEach( d => d.classList.remove( flashClass ) )
      sheet.removeRule( idx )
    }, this.config.flashTime )

    str = divs.map( d => d.innerText ).join('\n')

    this.publish( 'run', str )
  },

  runSelection() {
    const sel = window.getSelection()
    let str   = sel.toString()

    const sheet = document.styleSheets[0]

    // single line execution
    if( str === '' ) {
      let parentEl = sel.anchorNode.parentElement

      // each div is a line
      // make sure we're not just selecting a surrounding span or
      // other element and getting all the way to the line div
      while( parentEl.localName !== 'div' ) parentEl = parentEl.parentElement

      // code to execute
      str = parentEl.innerText

      const flashClass = `flash${this.getUID()}`
      parentEl.classList.add( flashClass )

      const rule = `.${flashClass} { 
        background: ${this.flashBackground} !important;
        color: ${this.flashColor} !important;
      }`

      const idx = sheet.insertRule( rule )

      setTimeout( ()=> {
        sheet.removeRule( idx )
        parentEl.classList.remove( flashClass )
      }, this.config.flashTime )
    }else{
      // flash selection
      const sheet = document.styleSheets[0]
      const idx = sheet.insertRule('::selection{ color:black !important; background:white !important}' )
      setTimeout( ()=> sheet.removeRule( idx ), 250 )
    }

    this.publish( 'run', str )
  },


  caret() {
    const range = window.getSelection().getRangeAt(0)
    const prefix = range.cloneRange()
    prefix.selectNodeContents( this.el )
    prefix.setEnd( range.endContainer, range.endOffset )
    return prefix.toString().length
  },

  setCaret( pos, parent = this.el, _sel = null ) {
    for(const node of parent.childNodes) {
      if(node.nodeType === 3 ) {
        if(node.length >= pos) {
          const range = document.createRange()
          const sel = _sel || window.getSelection()
          range.setStart(node, pos)
          range.collapse(true)
          sel.removeAllRanges()
          sel.addRange(range)
          return -1
        } else {
          pos = pos - node.length
        }
      } else {
        pos = this.setCaret( pos, node, _sel )          
        if (pos < 0) break
      }
    }
    return pos
  },

  checkForEmpty() {
    setTimeout( v => {
      if( this.el.childNodes.length === 1 && this.el.firstChild.localName === 'br' ) {
        const el = document.createElement('div')
        el.innerHTML = '&nbsp;'

        // in case plugin has placed class on <br>, copy it
        el.className = this.el.firstChild.className

        this.el.firstChild.remove()
        this.el.appendChild( el )

        this.setCaret( 0 )
      }else{
        this.el.normalize()
      }
    }, 5 )
  },

  noDivsInDivs() {
    for( let n of Array.from( this.el.childNodes ) ) {
      if( n.nodeType !== 3 ) {
        const lines = n.querySelectorAll('div')
        if( lines.length > 1 ) {
          for( let l of lines ) {
            this.el.insertBefore( l,n )
          }
        }
      }
    }
  },

  editor( instance, el, tab = '  ') {
    instance.lastKeyDownCode = 0
  
    const observer = new MutationObserver( mutations => {
      mutations.forEach( m => {
        if( m.addedNodes.length ) {
          instance.publish( 'nodes added', m.addedNodes )
        }else{
          instance.publish( 'nodes removed', m.removedNodes )
        }
      })
    })

    observer.observe( el, { childList: true })

    el.addEventListener( 'click', e => instance.publish( 'click', e ) )

    for( let key in window.bitty.events ) {
      el.addEventListener( key, window.bitty.events[ key ].bind( instance ) )
    }
  },

  events: {
    paste( e ) { //el.addEventListener( 'paste', e => {
      const text = (e.clipboardData || window.clipboardData).getData('text/plain')
      if( text.split('\n').length === 1 ) return
      
      const selection = window.getSelection()
      
      if (!selection.rangeCount ) return

      // new position is:
      // current position + (text length - line breaks)
      let pos = this.caret()
      // subtract three??? from length as last line won't actually contain line break
      // TODO where does this magic three number come from? it seems to work but
      // I have no ideaa why...
      const lineBreakCount = text.split('\n').length-3
      pos += text.length - lineBreakCount 

      const shouldRemoveBlank = (
        e.target.innerText === '' 
        || e.target.innerText === ' ' 
        || e.target.innerText === '\n' 
        || e.target.innerText === '<br>'
      )

      if( e.target !== this.el && shouldRemoveBlank ) e.target.remove()

      setTimeout( ()=> { 
        this.process()
        setTimeout( ()=>{ this.noDivsInDivs(); this.setCaret( pos ) }, 0 )
      }, 0 )

      this.publish( 'paste', e )

      // now paste continues as usual, no blocking the default event...
    },

    // stops extra line breaks from being included in copy
    copy( e ) {
      const selection = document.getSelection()
      e.clipboardData.setData( 'text/plain', selection.toString() )
      e.preventDefault()
    },
    
   
    keydown( e ) { //el.addEventListener( 'keydown', e => {
      // register last key down code if not a control character
      if(e.key.length === 1 || e.key === 'Tab' || e.key === 'Enter'){
        this.lastKeyDownCode = e.keyCode
      }
      // handle tab key
      const tab = '\t'
      if(e.keyCode === 9) {
        const pos = this.caret() + tab.length
        const range = window.getSelection().getRangeAt( 0 )
        range.deleteContents()
        range.insertNode( document.createTextNode( tab ) )
        this.setCaret( pos )
        e.preventDefault()
      }else if( e.keyCode === 8 ) {
        // delete key
        this.checkForEmpty() 
      }else if( e.keyCode === 13 ) {
        if( e.ctrlKey ) {
          //e.stopImmediatePropagation()
          e.preventDefault()
          this.runSelection()
        }else if( e.altKey ) {
          //e.stopImmediatePropagation()
          e.preventDefault()
          this.runBlock()
        }
      }

      // undo/redo
      if( e.key === 'z' && ( e.ctrlKey || e.metaKey ) ) {
        setTimeout( ()=> this.process(), 50 )
      }else if( e.key === 'y' && ( e.ctrlKey || e.metaKey ) ) {
        //this.undoManager.redo()
        //e.preventDefault()
      }else{
        this.publish( 'keydown', e )
      }
    },

    // handle all other non-control keys
    keyup( e ) { //el.addEventListener('keyup', e => {
      // do not refocus if ctrl key is pressed or if the last key down is enter
      // this stops refocusing for ctrl+a, or ctrl+enter etc.
      if ( this.lastKeyDownCode !== 13 && !e.ctrlKey && e.keyCode >= 0x30 || e.keyCode === 0x20) {
        const pos = this.caret()
        this.process()
        const sel = window.getSelection()
        this.setCaret( pos, sel.anchorNode.parentNode, sel )
      }

      this.publish( 'keyup', e )
    }  

  }
}
