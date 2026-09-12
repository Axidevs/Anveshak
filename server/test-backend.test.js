const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const path = require("path");

// Set env vars
process.env.JWT_SECRET = "test_secret";

// Import Routes and Models
const courtRoutes = require("./src/routes/courtRoutes");
const User = require("./src/models/User");
const Case = require("./src/models/Case");
const FIR = require("./src/models/FIR");
const Document = require("./src/models/Document");
const Timeline = require("./src/models/Timeline");

// Mock socket.io globally so courtController doesn't crash on getIo()
const mockIo = { emit: jest.fn() };
jest.mock("./src/utils/socket", () => ({
  getIo: () => mockIo
}));

const app = express();
app.use(express.json());
app.use("/api/court", courtRoutes);

let mongoServer;
let judgeToken;
let citizenId;
let firId;

describe("Court Backend APIs", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Seed User (Judge)
    const judge = await User.create({
      name: "Hon. Judge Verma",
      email: "judge@court.com",
      password: "hashedpassword",
      role: "COURT"
    });
    
    // Seed User (Citizen)
    const citizen = await User.create({
      name: "Rhythm",
      email: "citizen@example.com",
      password: "hashedpassword",
      role: "CITIZEN"
    });
    citizenId = citizen._id;

    judgeToken = jwt.sign({ userId: judge._id, role: judge.role }, process.env.JWT_SECRET);

    // Seed FIR
    const fir = await FIR.create({
      citizenId: citizen._id,
      incidentType: "Theft",
      location: "Delhi",
      description: "Test FIR",
      dateOfIncident: new Date()
    });
    firId = fir._id;

    // Seed Case (The Master Case)
    await Case.create({
      caseId: "ANV-2026-304269",
      firId: fir._id,
      citizenId: citizen._id,
      status: "COURT_PROCEEDINGS"
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should record a hearing order successfully", async () => {
    const res = await request(app)
      .post("/api/court/case/ANV-2026-304269/order")
      .set("Authorization", `Bearer ${judgeToken}`)
      .field("hearingDate", "2026-09-12")
      .field("note", "Arguments heard. Next date given.")
      .field("nextHearingDate", "2026-09-20")
      .field("signatureData", JSON.stringify({ method: "digilocker", officerName: "Hon. Judge Verma", timestamp: new Date().toISOString() }))
      .attach("file", Buffer.from("dummy pdf content"), "order.pdf");

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Hearing order recorded successfully");
    expect(res.body.document).toBeDefined();

    // Verify DB
    const updatedCase = await Case.findOne({ caseId: "ANV-2026-304269" });
    expect(updatedCase.courtProceedings.length).toBe(1);
    expect(updatedCase.courtProceedings[0].note).toBe("Arguments heard. Next date given.");
    expect(new Date(updatedCase.nextHearingDate).toISOString().startsWith("2026-09-20")).toBe(true);
    
    const timelineEntry = await Timeline.findOne({ action: "COURT_ORDER_ADDED" });
    expect(timelineEntry).toBeDefined();
    
    expect(mockIo.emit).toHaveBeenCalledWith("new_notification", expect.objectContaining({ type: "COURT_UPDATE" }));
  });

  it("should upload a final judgment successfully and dispose case", async () => {
    const res = await request(app)
      .post("/api/court/case/ANV-2026-304269/judgment")
      .set("Authorization", `Bearer ${judgeToken}`)
      .field("remarks", "Accused is acquitted.")
      .attach("file", Buffer.from("dummy final judgment content"), "judgment.pdf");

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toContain("disposed");

    // Verify DB
    const updatedCase = await Case.findOne({ caseId: "ANV-2026-304269" });
    expect(updatedCase.status).toBe("DISPOSED");

    const timelineEntry = await Timeline.findOne({ action: "FINAL_JUDGMENT_UPLOADED" });
    expect(timelineEntry).toBeDefined();
    expect(timelineEntry.description).toContain("Accused is acquitted.");
    
    expect(mockIo.emit).toHaveBeenCalledWith("new_notification", expect.objectContaining({ type: "STATUS_CHANGED" }));
  });
});
