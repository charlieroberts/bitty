const value1 = 
`// this editor has syntax rules for
// highlighting comments, function 
// declarations, and strings.

window.hello1 = function( name ) {
  console.log( name )
}

hello1( 'bitty1' )`

const value2 = 
`// this editor has a different set
// of syntax rules; only comments
// are highlighted.

window.hello2 = function( name ) {
  console.log( name )
}

hello2( 'bitty2' )`

window.onload = function() {
  const b1 = bitty.create({ 
    flashColor:'black',
    flashTime: 100,
    value:value1,
    el: document.querySelector('.one')
  })
  
  b1.subscribe( 'run', txt => {
    console.log( 'editor 1:', txt )
    eval( txt )
  })
  
  const b2 = bitty.create({ 
    flashColor:'black',
    flashTime: 100,
    value:value2,
    el: document.querySelector('.two'),
    rules : {
     comments: /(\/\/.*)/g
    }
  })

  b2.subscribe( 'run', txt => {
    console.log( 'editor 2:', txt )
    eval( txt )
  })
}
