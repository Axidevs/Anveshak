const Case = require("../models/Case");

const generateCaseId = async () => {
  const year = new Date().getFullYear();
  let id;
  let exists = true;
  
  while (exists) {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    id = `ANV-${year}-${randomNumber}`;
    exists = await Case.exists({ caseId: id });
  }
  
  return id;
};

module.exports = generateCaseId;