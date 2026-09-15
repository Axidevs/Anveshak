const fs = require('fs');
const mongoose = require('./server/node_modules/mongoose');
const AuditLog = require('./server/src/models/AuditLog');

const env = fs.readFileSync('server/.env', 'utf8');
const uri = env.match(/MONGO_URI=(.*)/)[1].trim();

async function test() {
  await mongoose.connect(uri);
  const logs = await AuditLog.find({ caseId: 'ANV-2026-573755' });
  console.log("Total audit logs for this specific case:", logs.length);
  process.exit(0);
}
test();
