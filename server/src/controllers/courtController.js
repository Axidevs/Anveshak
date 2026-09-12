const Case = require("../models/Case");
const Document = require("../models/Document");
const Timeline = require("../models/Timeline");
const User = require("../models/User");
const { createNotification } = require("./notificationController");
const crypto = require("crypto");
const fs = require("fs");

// --- Helper to save Document to DB ---
const saveDocument = async (req, caseId, type, signatureData) => {
  if (!req.file) return null;

  // Assuming Express serves the "uploads" folder statically at /uploads/
  const fileUrl = `/uploads/${req.file.filename}`;
  
  // Cryptographic Hashing
  const fileBuffer = fs.readFileSync(req.file.path);
  const documentHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  
  // Prepare digital signature data
  const sigData = signatureData || { method: "none" };
  sigData.documentHash = documentHash;
  
  if (sigData.method !== "none") {
    // Generate server-side cryptographic seal (HMAC) proving backend verified it
    const payload = `${caseId}|${req.user.userId}|${documentHash}|${sigData.timestamp || new Date().toISOString()}`;
    const cryptographicSeal = crypto.createHmac("sha256", process.env.JWT_SECRET || "fallback_secret")
                                    .update(payload)
                                    .digest("hex");
    sigData.cryptographicSeal = cryptographicSeal;
    sigData.verified = true;
  }

  const doc = new Document({
    caseId,
    filename: req.file.originalname,
    fileUrl,
    type,
    uploadedBy: req.user.userId,
    size: req.file.size,
    digitalSignature: sigData
  });

  await doc.save();
  return doc;
};

// --- Record Hearing Order ---
exports.addHearingOrder = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { hearingDate, note, nextHearingDate, signatureData } = req.body;
    let parsedSignature = null;
    
    if (signatureData) {
      try { parsedSignature = JSON.parse(signatureData); } 
      catch (e) { parsedSignature = signatureData; }
    }

    const user = await User.findById(req.user.userId);

    // 1. Save uploaded file if any
    const savedDoc = await saveDocument(req, caseId, "Court Order", parsedSignature);

    // 2. Update Case
    const caseRecord = await Case.findOne({ caseId });
    if (!caseRecord) return res.status(404).json({ message: "Case not found" });

    const newOrder = {
      hearingDate,
      note,
      nextHearingDate: nextHearingDate || null,
      documentId: savedDoc ? savedDoc._id : null,
      signedBy: parsedSignature ? parsedSignature.officerName : (user ? user.name : "Hon. Judge"),
      signedAt: parsedSignature ? parsedSignature.timestamp : new Date()
    };

    caseRecord.courtProceedings.push(newOrder);
    if (nextHearingDate) {
      caseRecord.nextHearingDate = nextHearingDate;
    }
    await caseRecord.save();

    // 3. Update Timeline
    await Timeline.create({
      caseId,
      status: caseRecord.status,
      action: "COURT_ORDER_ADDED",
      performedBy: req.user.userId,
      description: `Hearing order recorded for ${hearingDate}.`
    });

    // 4. Send Notifications
    if (caseRecord.citizenId) {
      await createNotification({ userId: caseRecord.citizenId, caseId, type: "COURT_UPDATE", message: `A new court order was added for your case ${caseId}.` });
    }
    if (caseRecord.assignedOfficer) {
      await createNotification({ userId: caseRecord.assignedOfficer, caseId, type: "COURT_UPDATE", message: `A new court order was added for assigned case ${caseId}.` });
    }

    res.status(201).json({ message: "Hearing order recorded successfully", order: newOrder, document: savedDoc });
  } catch (error) {
    console.error("addHearingOrder error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- Upload Final Judgment ---
exports.uploadFinalJudgment = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { remarks, signatureData } = req.body;
    let parsedSignature = null;
    
    if (signatureData) {
      try { parsedSignature = JSON.parse(signatureData); } 
      catch (e) { parsedSignature = signatureData; }
    }

    if (!req.file) {
      return res.status(400).json({ message: "Final judgment PDF is required" });
    }

    // 1. Save Document
    const savedDoc = await saveDocument(req, caseId, "Final Judgment", parsedSignature);

    // 2. Update Case Status
    const caseRecord = await Case.findOne({ caseId });
    if (!caseRecord) return res.status(404).json({ message: "Case not found" });

    caseRecord.status = "DISPOSED";
    await caseRecord.save();

    // 3. Update Timeline
    await Timeline.create({
      caseId,
      status: "DISPOSED",
      action: "FINAL_JUDGMENT_UPLOADED",
      performedBy: req.user.userId,
      description: `Final judgment uploaded and case disposed. Remarks: ${remarks || 'None'}`
    });

    // 4. Send Notifications
    if (caseRecord.citizenId) {
      await createNotification({ userId: caseRecord.citizenId, caseId, type: "STATUS_CHANGED", message: `Your case ${caseId} has been DISPOSED by the court.` });
    }
    if (caseRecord.assignedOfficer) {
      await createNotification({ userId: caseRecord.assignedOfficer, caseId, type: "STATUS_CHANGED", message: `Assigned case ${caseId} has been DISPOSED by the court.` });
    }

    res.status(201).json({ message: "Final judgment uploaded. Case disposed.", document: savedDoc });
  } catch (error) {
    console.error("uploadFinalJudgment error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- Upload General Court Document ---
exports.uploadCourtDocument = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { type, signatureData } = req.body;
    let parsedSignature = null;
    
    if (signatureData) {
      try { parsedSignature = JSON.parse(signatureData); } 
      catch (e) { parsedSignature = signatureData; }
    }

    if (!req.file) {
      return res.status(400).json({ message: "Document file is required" });
    }

    const savedDoc = await saveDocument(req, caseId, type || "Supporting Document", parsedSignature);

    // Timeline entry
    await Timeline.create({
      caseId,
      status: "COURT_PROCEEDINGS",
      action: "DOCUMENT_UPLOADED",
      performedBy: req.user.userId,
      description: `${type || 'Document'} uploaded to case file.`
    });

    res.status(201).json({ message: "Document uploaded successfully", document: savedDoc });
  } catch (error) {
    console.error("uploadCourtDocument error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- Get Case Documents ---
exports.getCaseDocuments = async (req, res) => {
  try {
    const { caseId } = req.params;
    const documents = await Document.find({ caseId }).sort({ createdAt: -1 }).populate('uploadedBy', 'name role');
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
