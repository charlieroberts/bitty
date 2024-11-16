const value = 
`function hello( name ) {
  console.log( name )
}
 
hello( 'bitty' )`

window.onload = function() {
  bitty.init({ 
    flashColor:'red',
    flashTime: 100,
    value
  })

  bitty.subscribe( 'run', eval )
}
