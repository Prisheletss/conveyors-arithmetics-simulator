'use strict';



console.log('Hello world');





const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Нажмите Enter для выхода...',
    (answer) => { rl.close(); }
);