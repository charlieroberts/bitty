const value = 
`// hit alt+enter to run
// view output in developer console

function hello( name ) {
  console.log( name )
}

hello( 'bitty' )`

window.onload = function() {
  const b = bitty.create({ 
    flashColor:'black',
    flashTime: 100,
    value
  })

  b.subscribe( 'run', eval )
}
