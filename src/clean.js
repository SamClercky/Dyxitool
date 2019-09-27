const fs = require("fs");
const glob = require("glob");

const FILES = "build/*.html";

const files = glob.GlobSync(FILES).found;

function remove() {
    for (let fileName of files) {
        fs.unlink(fileName, (err) => {
            if (err) throw err;
            console.log(`${fileName} cleaned up`);
        })
    }
}

module.exports.remove = remove;

remove();