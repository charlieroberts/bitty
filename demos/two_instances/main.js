const value = 
`// hit alt+enter to run
// view output in developer console

function hello( name ) {
  console.log( name )
}

hello( 'bitty' )`

window.onload = function() {
  const b1 = bitty.init({ 
    flashColor:'black',
    flashTime: 100,
    value,
    el: document.querySelector('.one')
  })
  
  b1.subscribe( 'run', txt => {
    console.log( 'editor 1:', txt )
    eval( txt )
  })
  
  const b2 = bitty.init({ 
    flashColor:'black',
    flashTime: 100,
    value,
    el: document.querySelector('.two')
  })

  b2.subscribe( 'run', txt => {
    console.log( 'editor 2:', txt )
    eval( txt )
  })
}
