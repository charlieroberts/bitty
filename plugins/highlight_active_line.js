const __plugin = {
  instances: [],
  
  // subscribe to init notification in order to 
  // get reference to editor element
  init() {
    bitty.subscribe( 'init', __plugin.start )
  },

  start( el ) {
    const plugin = {
      __active: null,
      __prev:   null,
    }

    bitty.subscribe( 'nodes added', c => __plugin['nodes added']( c, plugin ))
    bitty.subscribe( 'nodes removed', c => __plugin['nodes removed']( c, plugin ))
    bitty.subscribe( 'keydown', e => __plugin.keydown( e, plugin ))
    bitty.subscribe( 'click', e => __plugin.click( e, plugin ))

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
    // enter
    if( e.keyCode ===  38 || e.keyCode ===  40 ) {
      const store = plugin.__active
      if( plugin.__active !== null ) {
        if( plugin.__active.classList === undefined ) debugger
        plugin.__active.classList.remove('bitty-active')
        
        plugin.__active = e.keyCode === 38 
          ? plugin.__active.previousSibling
          : plugin.__active.nextSibling

      }

      if( plugin.__active === null || plugin.__active.nodeType === 3 ) {
        plugin.__active = null
        return
      }

      //if( plugin.__active === null ) plugin.__active = store

      plugin.__active.classList.add('bitty-active')

      __plugin.removeOthers( plugin.__active )
    }else if( e.keyCode === 8 ) {
      if( plugin.__active !== null ) { 
        plugin.__prev = plugin.__active.previousSibling
      }
    }
  },

  click( e, plugin ) {
    let node = e.target
    while( node.localName !== 'div' ) node = node.parentElement
    if( node.classList.contains('bitty-editor') ) return
    node.classList.add( 'bitty-active' )
    if( plugin.__active !== null ) plugin.__active.classList.remove( 'bitty-active' )
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
      plugin.__active = plugin.__prev
      plugin.__active.classList.add( 'bitty-active' )
      __plugin.removeOthers( plugin.__active )
    }
  }
}

__plugin.init()
