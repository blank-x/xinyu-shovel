const plist = require('plist');
const bplist = require('bplist-parser');
const {isBinaryFile} = require('isbinaryfile');

const fs = require('fs');
const path = require("path");

// var a = bplist.parseFile('/Applications/Microsoft\ Word.app/Contents/Info.plist');
//
// a.then((data)=>{
//   console.log(data)
// })


// var a = plist.parse(fs.readFileSync('/System/Applications/Notes.app/Contents/Info.plist', 'utf8'));
//
// console.log(a.CFBundleIconFile)

var a = isBinaryFile('/Applications/Microsoft Word.app/Contents/Info.plist')
a.then((data)=>{
  console.log(data)
})
