window.bitty.rules =  [
  // comments
  [ /(\/\/.*)/g, '<span class=bitty-comments>$1</span>'],

  // keywords and properties
  [ /\b(new|if|else|do|while|switch|for|of|continue|break|return|typeof|function|var|const|let|\.length)(?=[^\w])/g, "<span class=bitty-keywords>$1</span>"],

  // strings
  // extraneous multiline comment below to remove syntax highlight bug in vim
  [ /(".*?"|'.*?'|\`.*?\`)/g, '<span class=bitty-strings>$1</span>' /*`*/],

  // numbers
  [ /\b(\d+)/g, '<span class=bitty-numbers>$1</span>']
]
