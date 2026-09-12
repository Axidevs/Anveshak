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

// Mock socket.io globally
const mockIo = { emit: () => {} };
jest = { mock: () => {} };
require('./src/utils/socket').getIo = () => mockIo;

process.env.JWT_SECRET = "test_secret_for_postman";

const app = express();
app.use(express.json());
app.use('/api/court', courtRoutes);

async function runSignatureTest() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  const officer = await User.create({ name: "Officer Test", email: "officer@test.com", password: "pwd", role: "COURT" });
  
  const fir = await FIR.create({
    createdBy: officer._id,
    category: "Theft",
    incidentLocation: "Delhi",
    incidentDate: new Date(),
    incidentDescription: "Test",
    complainant: "Rhythm",
    firNumber: "FIR-123456"
  });
  
  const testCase = await Case.create({ 
    caseId: "ANV-2026-573755", 
    firId: fir._id, 
    citizenId: officer._id, 
    status: "INVESTIGATION" 
  });

  const token = jwt.sign({ userId: officer._id, role: officer.role }, process.env.JWT_SECRET);

  const realPdfPath = "C:/Users/rhyth/.gemini/antigravity/brain/630507e6-9261-4f87-8ac4-69bdc6d87304/.user_uploaded/media_1789205765456.pdf";
  
  console.log("-----------------------------------------");
  console.log("TESTING PDF/IMAGE UPLOAD (SHOULD BE SIGNED)");
  console.log("-----------------------------------------");
  const res = await request(app)
    .post("/api/court/case/ANV-2026-573755/document")
    .set("Authorization", `Bearer ${token}`)
    .field("type", "Forensic")
    .field("signatureData", JSON.stringify({ method: "digilocker", officerName: "Officer Test", timestamp: new Date().toISOString() }))
    .attach("file", realPdfPath);
  
  console.log(JSON.stringify(res.body, null, 2));

  // --- TXT Upload Test ---
  const txtPath = path.join(__dirname, 'dummy.txt');
  fs.writeFileSync(txtPath, "dummy text content");
  
  console.log("\n-----------------------------------------");
  console.log("TESTING TXT UPLOAD (SIGNATURE SHOULD BE STRIPPED)");
  console.log("-----------------------------------------");
  const resTxt = await request(app)
    .post("/api/court/case/ANV-2026-573755/document")
    .set("Authorization", `Bearer ${token}`)
    .field("type", "Statement")
    .field("signatureData", JSON.stringify({ method: "digilocker", officerName: "Officer Test", timestamp: new Date().toISOString() }))
    .attach("file", txtPath);
  
  console.log(JSON.stringify(resTxt.body, null, 2));

  // Cleanup
  await mongoose.disconnect();
  await mongoServer.stop();
  fs.unlinkSync(txtPath);
}

runSignatureTest();
