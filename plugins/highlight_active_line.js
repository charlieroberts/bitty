const __plugin = {
  instances: [],
  
  // subscribe to init notification in order to 
  // get reference to editor element
  init() {
    bitty.subscribe( 'init', __plugin.start )
  },

  start( el ) {
    const plugin = {
      el,
      __active: null,
      __prev:   null,
    }

    bitty.subscribe( 'nodes added', c => __plugin['nodes added']( c, plugin ))
    bitty.subscribe( 'nodes removed', c => __plugin['nodes removed']( c, plugin ))
    bitty.subscribe( 'keydown', e => __plugin.keydown( e, plugin ))
    bitty.subscribe( 'click', e => __plugin.click( e, plugin ))
    bitty.subscribe( 'paste', e => __plugin.paste( e, plugin ))

    plugin.__active = el.firstChild
    plugin.__active.classList.add( 'bitty-active')

    __plugin.instances.push( plugin )
  },

  removeOthers( exempt=null ) {
    const remove = node => node.classList.remove('bitty-active')

    Array.from( document.querySelectorAll('.bitty-active') )
      .filter( n => n !== exempt )
      .forEach( remove )
  },

  keydown( e, plugin) {
    if( e.keyCode ===  38 || e.keyCode ===  40 ) {
      // up and down
      const store = plugin.__active
      const nodes = bitty.el.childNodes
      
      // check to see if trying to move above first line
      // or below last line via arrow keys
      const isTop = store === nodes[ nodes.length - 1 ]
      const isBottom = store === nodes[ 0 ]
      if( (isTop && e.keyCode === 40) || (isBottom && e.keyCode === 38 ) ) {
        return
      }

      if( plugin.__active !== null ) {
        //if( plugin.__active.classList === undefined ) debugger
        plugin.__active.classList.remove('bitty-active')
        
        plugin.__active = e.keyCode === 38 
          ? plugin.__active.previousSibling
          : plugin.__active.nextSibling

      }

      if( plugin.__active === null || plugin.__active.nodeType === 3 ) {
        plugin.__active = null
        return
      }

      plugin.__active.classList.add('bitty-active')

      __plugin.removeOthers( plugin.__active )
    }else if( e.keyCode === 8 ) {
      // delete
      if( plugin.__active !== null ) { 
        plugin.__prev = plugin.__active.previousSibling
      }
    }else if( e.keyCode === 37 || e.keyCode === 39 ) {
      // left or right
      // check to see if current focused line is not the
      // same as the focused line after the keypress
      // is executed
      const sel  = window.getSelection()
      const node = sel.focusNode.parentElement

      setTimeout( ()=> {
        const sel2 = window.getSelection()
        const node2 = sel2.focusNode.parentElement
        
        if( node !== node2 ) {
          plugin.__active = node2
          plugin.__active.classList.add( 'bitty-active' )
          node.classList.remove( 'bitty-active' )
        }
      }, 5 )
    }
  },

  paste( e, plugin ) {
    setTimeout( ()=> {
    const sel  = window.getSelection()
    const node = sel.focusNode.parentElement

    if( plugin.__active !== null ) {
      plugin.__active.classList.remove( 'bitty-active' )
    }

    plugin.__active = node
    plugin.__active.classList.add( 'bitty-active' )
    }, 5 )
  },

  click( e, plugin ) {
    let node = e.target
    while( node.localName !== 'div' ) node = node.parentElement

    // clicked on editor but not a line
    if( node === plugin.el ) {
      const nodes = plugin.el.querySelectorAll( 'div' ) 
      node = nodes[ nodes.length - 1 ]
    }

    node.classList.add( 'bitty-active' )
    if( plugin.__active !== null && plugin.__active !== node ) {
      plugin.__active.classList.remove( 'bitty-active' )
    }

    plugin.__active = node
    __plugin.removeOthers( plugin.__active )
  },

  'nodes added'( changes, plugin ) {
    const store = plugin.__active
    if( plugin.__active !== null ) {
      plugin.__active.classList.remove( 'bitty-active' )

      plugin.__active = plugin.__active.nextSibling
    }

    if( plugin.__active === null && store !== null ) { 
      plugin.__active = store
      plugin.__active.classList.add( 'bitty-active' )
    }
    
    __plugin.removeOthers( plugin.__active )
  },

  'nodes removed'(changes, plugin) {
    if( plugin.__prev !== null ) {
      if( plugin.el.childNodes.length === 1 ) {
        plugin.__active = plugin.el.childNodes[0]  
      }else{
        plugin.__active = plugin.__prev
        __plugin.removeOthers( plugin.__active )
      }
    }else{
      plugin.__active = plugin.el.childNodes[0] 
    }

    plugin.__active.classList.add( 'bitty-active' )
  }
}

__plugin.init()
