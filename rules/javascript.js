window.bitty.rules =  [
  // comments
  //[ /(\/\/.*)/g, '<em>$1</em>'],

  // keywords and properties
  [ /\b(new|if|else|do|while|switch|for|in|of|continue|break|return|typeof|function|var|const|let|\.length|\.\w+)(?=[^\w])/g, '<strong>$1</strong>'],

  // strings
  // extraneous multiline comment below to remove syntax highlight bug in vim
  [ /(".*?"|'.*?'|\`.*?\`)/g, '<strong><em>$1</em></strong>' /*`*/],

  // numbers
  [ /\b(\d+)/g, '<em><strong>$1</strong></em>']
]
