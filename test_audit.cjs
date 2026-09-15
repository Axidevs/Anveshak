const fs = require('fs');
const mongoose = require('./server/node_modules/mongoose');
const AuditLog = require('./server/src/models/AuditLog');

const env = fs.readFileSync('server/.env', 'utf8');
const uriMatch = env.match(/MONGO_URI=(.*)/);
const uri = uriMatch[1].trim();

async function test() {
  await mongoose.connect(uri);
  const logs = await AuditLog.find({});
  console.log("Total audit logs:", logs.length);
  if (logs.length > 0) {
    console.log("Sample log:", logs[0]);
  }
  process.exit(0);
}
test();
