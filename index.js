const fs = require('fs');
const importRegex = /import [\'\"]{1}(.*)[\'\"]{1};/;
const pragmaRegex = /^pragma/;
const entryPath = process.argv[2];
const imported = {
  entryPath: 1
};
let relativePath = entryPath.split('/')
relativePath = "./" + relativePath.slice(0,relativePath.length - 1).join('/') + "/";

function getContentAsArray(filename, delPragma = null) {
  if (delPragma != null) {
    let arr = fs.readFileSync(filename, "utf8").split('\n');
    let epured = [];
    for (let i in arr) {
      if (!pragmaRegex.test(arr[i])) {
        epured.push(arr[i]);
      }
    }
    return epured;
  } else {
    return fs.readFileSync(filename, "utf8").split('\n');
  }
}
let entryPathContent = getContentAsArray(entryPath, null);

function run(arr) {
  for (let i in arr) {
    if (importRegex.test(arr[i])) {
      let matchRegex = arr[i].match(importRegex);
      let importContent;

      let newArr = arr.slice(0,i);
      if (imported[relativePath + matchRegex[1]] == undefined) {
        importContent = getContentAsArray(relativePath + matchRegex[1], 1);
        newArr = newArr.concat(importContent);
      }
      for (let p = i; p < arr.length; ++p) {
        if (i != p) {
          newArr.push(arr[p])
        }
      }
      imported[relativePath + matchRegex[1]] = 1;
      return run(newArr);
    }
  }
  return arr.join('\n');
}

let output = run(entryPathContent);
console.log(output);
fs.writeFileSync("output.sol", output.replace(/[\n]{2,}/g, '\n\n'));
