const pug = require("pug");
const fs = require("fs");
const glob = require("glob");
const path = require("path");

// clean prev data
require("./clean");

const compileFuncs = [];
const files = glob.GlobSync("*.pug").found;

for (let fileName of files) {
    const output = pug.compileFile(fileName)({});
    const outFile = path.join(path.dirname(fileName), "build", path.basename(fileName, path.extname(fileName)) + '.html')
    fs.writeFile(outFile, output, (err) => {
        if (err) throw err;
        console.log(`${fileName} has been written.`);
    })
}

