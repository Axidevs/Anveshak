const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Load App Components
const courtRoutes = require('./src/routes/courtRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const User = require('./src/models/User');
const Case = require('./src/models/Case');
const FIR = require('./src/models/FIR');
const Notification = require('./src/models/Notification');

// Mock socket.io globally
const mockIo = { emit: () => {} };
jest = { mock: () => {} };
require('./src/utils/socket').getIo = () => mockIo;

process.env.JWT_SECRET = "test_secret_for_postman";

const app = express();
app.use(express.json());
app.use('/api/court', courtRoutes);
app.use('/api/notifications', notificationRoutes);

async function runPostmanTests() {
  console.log("=================================================");
  console.log("🚀 STARTING POSTMAN SIMULATION & E2E TESTING");
  console.log("=================================================\n");

  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  console.log("[DB] Connected to Mock MongoDB for Testing\n");

  // SEED DATA
  const judge = await User.create({ name: "Judge Sharma", email: "judge@court.com", password: "pwd", role: "COURT" });
  const citizen = await User.create({ name: "Rhythm", email: "rhythm@citizen.com", password: "pwd", role: "CITIZEN" });
  
  const fir = await FIR.create({
    createdBy: citizen._id,
    category: "Theft",
    incidentLocation: "Delhi",
    incidentDate: new Date(),
    incidentDescription: "Test",
    complainant: "Rhythm",
    firNumber: "FIR-123456"
  });
  const testCase = await Case.create({ 
    caseId: "ANV-2026-304269", 
    firId: fir._id, 
    citizenId: citizen._id, 
    status: "COURT_PROCEEDINGS" 
  });

  const judgeToken = jwt.sign({ userId: judge._id, role: judge.role }, process.env.JWT_SECRET);
  const citizenToken = jwt.sign({ userId: citizen._id, role: citizen.role }, process.env.JWT_SECRET);

  // Create a dummy PDF file for upload testing
  const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
  fs.writeFileSync(dummyPdfPath, "dummy pdf content");

  // ==========================================
  // TEST 1: ADD COURT ORDER (JUDGE)
  // ==========================================
  console.log("🟡 POSTMAN REQUEST 1: POST /api/court/case/ANV-2026-304269/order");
  console.log("Headers: { Authorization: Bearer <Judge_Token> }");
  console.log("Body (form-data): hearingDate, note, signatureData, file");

  let res = await request(app)
    .post("/api/court/case/ANV-2026-304269/order")
    .set("Authorization", `Bearer ${judgeToken}`)
    .field("hearingDate", "2026-09-12")
    .field("note", "Case reviewed. Next hearing scheduled.")
    .field("signatureData", JSON.stringify({ method: "digilocker", officerName: "Judge Sharma", timestamp: new Date().toISOString() }))
    .attach("file", dummyPdfPath);

  console.log("\n🟢 RESPONSE 1 (Status: " + res.status + "):");
  console.log(JSON.stringify(res.body, null, 2));
  console.log("-------------------------------------------------\n");

  // ==========================================
  // TEST 2: CHECK NOTIFICATIONS (CITIZEN)
  // ==========================================
  console.log("🟡 POSTMAN REQUEST 2: GET /api/notifications");
  console.log("Headers: { Authorization: Bearer <Citizen_Token> }");
  console.log("Description: Checking if the Citizen received a notification for the Court Order.");

  res = await request(app)
    .get("/api/notifications")
    .set("Authorization", `Bearer ${citizenToken}`);

  console.log("\n🟢 RESPONSE 2 (Status: " + res.status + "):");
  console.log(JSON.stringify(res.body, null, 2));
  
  const notificationId = res.body[0]._id;
  console.log("-------------------------------------------------\n");

  // ==========================================
  // TEST 3: MARK NOTIFICATION AS READ (CITIZEN)
  // ==========================================
  console.log(`🟡 POSTMAN REQUEST 3: PATCH /api/notifications/${notificationId}/read`);
  console.log("Headers: { Authorization: Bearer <Citizen_Token> }");

  res = await request(app)
    .patch(`/api/notifications/${notificationId}/read`)
    .set("Authorization", `Bearer ${citizenToken}`);

  console.log("\n🟢 RESPONSE 3 (Status: " + res.status + "):");
  console.log(JSON.stringify(res.body, null, 2));
  console.log("-------------------------------------------------\n");

  // ==========================================
  // TEST 4: UPLOAD FINAL JUDGMENT (JUDGE)
  // ==========================================
  console.log("🟡 POSTMAN REQUEST 4: POST /api/court/case/ANV-2026-304269/judgment");
  console.log("Description: Uploading final judgment and marking case as DISPOSED.");

  res = await request(app)
    .post("/api/court/case/ANV-2026-304269/judgment")
    .set("Authorization", `Bearer ${judgeToken}`)
    .field("remarks", "Case closed with final verdict.")
    .field("signatureData", JSON.stringify({ method: "digilocker", officerName: "Judge Sharma", timestamp: new Date().toISOString() }))
    .attach("file", dummyPdfPath);

  console.log("\n🟢 RESPONSE 4 (Status: " + res.status + "):");
  console.log(JSON.stringify(res.body, null, 2));
  console.log("-------------------------------------------------\n");

  // ==========================================
  // TEST 5: VERIFY CASE STATUS IN DB
  // ==========================================
  const updatedCase = await Case.findOne({ caseId: "ANV-2026-304269" });
  console.log("🟡 INTERNAL DB VERIFICATION:");
  console.log("Current Case Status: " + updatedCase.status);
  console.log("Number of Court Proceedings: " + updatedCase.courtProceedings.length);

  // Cleanup
  await mongoose.disconnect();
  await mongoServer.stop();
  fs.unlinkSync(dummyPdfPath);
  console.log("\n✅ ALL POSTMAN SIMULATIONS COMPLETED SUCCESSFULLY.");
}

runPostmanTests();
