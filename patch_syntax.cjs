const fs = require('fs');
let code = fs.readFileSync('server/src/controllers/caseController.js', 'utf8');

code = code.replace(
  'onst FIR = require("../models/FIR");',
  'const FIR = require("../models/FIR");'
);

fs.writeFileSync('server/src/controllers/caseController.js', code);
console.log("Fixed syntax error in caseController.js!");
