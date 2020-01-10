const fs = require('fs')

// Write data in 'throwback.txt' .
var stream = fs.createWriteStream("throwback.txt", { flags: 'a' });
for (let index = 10092; index < 10092 + 10090; index++) {
    stream.write(index + '\n');
}
stream.end();