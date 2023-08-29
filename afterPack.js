const del = require("del");
const glob = require("glob");
const fs = require('fs');
const path = require('path');
module.exports = ({appOutDir, packager, electronPlatformName, ...a}) => {
  return new Promise((res, rej) => {
    let files = []
    if (electronPlatformName === 'darwin') {
      files = glob.globSync(`${appOutDir}/${packager.appInfo.name}.app/Contents/Resources/*.lproj`);
    } else if(electronPlatformName === 'win32') {
      files = glob.globSync(`${appOutDir}/locales/*.pak`);
    }
    del.sync(files);
    fs.copyFileSync(path.resolve(__dirname, 'package.json'), path.resolve(__dirname, 'dist/package.json'));
    res()
  });
}

fs.copyFileSync(path.resolve(__dirname, 'package.json'), path.resolve(__dirname, 'dist/package.json'));
