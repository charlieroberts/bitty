let bitty = null
const __plugin = {
  instances: [],
  // init's only job is to get reference to bitty
  init() {
    bitty = window.bitty
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

  keydown( e, plugin) {
    if( e.keyCode ===  38 || e.keyCode ===  40 ) {
      const store = plugin.__active
      plugin.__active.classList.remove('bitty-active')
      plugin.__active = e.keyCode === 38 
        ? plugin.__active.previousSibling
        : plugin.__active.nextSibling

      if( plugin.__active === null ) plugin.__active = store

      plugin.__active.classList.add('bitty-active')
    }else if( e.keyCode === 8 ) {
      if( plugin.__active !== null ) { 
        plugin.__prev = plugin.__active.previousSibling
      }
    }
  },

  click( e, plugin ) {
    let node = e.target
    while( node.localName !== 'div' ) node = node.parentElement
    node.classList.add( 'bitty-active' )
    if( plugin.__active !== null ) plugin.__active.classList.remove( 'bitty-active' )
    plugin.__active = node
  },

  'nodes added'( changes, plugin ) {
    const store = plugin.__active
    plugin.__active.classList.remove( 'bitty-active' )

    plugin.__active = plugin.__active.nextSibling

    if( plugin.__active === null ) plugin.__active = store

    plugin.__active.classList.add( 'bitty-active' )
  },

  'nodes removed'(changes, plugin) {
    if( plugin.__prev !== null ) {
      plugin.__active = plugin.__prev
      plugin.__active.classList.add( 'bitty-active' )
    }
  },
}

window.addEventListener( 'load', __plugin.init )
