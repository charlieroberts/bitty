const value = 
`// hit alt+enter to run
// view output in developer console
function hello( name ) {
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
