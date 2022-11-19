// Create a function for reusable perpose
const generateRandomString = (myLength) => {
    // const chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";

    const chars = "1234567890";

    const randomArray = Array.from(
        { length: myLength },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );

    const randomString = randomArray.join("");
    return randomString;
};

// Try it
// console.log(generateRandomString(10));
// console.log(generateRandomString(30));

let fs = require('fs');

const COUNT = 10000;
const FILE_NAME = 'test.txt';

for(let a = 0; a < COUNT; a++){
    fs.appendFileSync(
        FILE_NAME,
        generateRandomString(102) + "\n",
    );
}

console.log(`Generated ${COUNT} lines`);