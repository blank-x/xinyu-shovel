// https://www.electron.build/includes/hooks.html#beforepack
const del = require("del");
const fs = require('fs');
const path = require('path');
module.exports = ({appOutDir, packager, electronPlatformName}) => {
  return new Promise((res, rej) => {
    console.log(12121212);
    if(fs.statSync(path.resolve(__dirname, 'dist')).isDirectory()) {
      del.sync(path.resolve(__dirname, 'dist/*'));
    }
    res()
  });
}

 