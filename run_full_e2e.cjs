const fs = require('fs');
const path = require('path');

async function runFullTest() {
  const API_URL = 'http://localhost:5001/api';
  let citizenToken, policeToken, caseId, evidenceId, firId;

  console.log("=== ANVESHAK SIH FULL E2E TEST ===");

  try {
    // 1. Register/Login Citizen
    const citizenEmail = `test_citizen_${Date.now()}@anveshak.com`;
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: "Demo Citizen", email: citizenEmail, password: "password123", role: "CITIZEN" })
    });
    const regData = await regRes.json();
    console.log("1. Citizen Registered:", regRes.status === 201 ? "PASS" : "FAIL", regData.message);

    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: citizenEmail, password: "password123" })
    });
    const loginData = await loginRes.json();
    citizenToken = loginData.token;
    console.log("2. Citizen Login:", citizenToken ? "PASS" : "FAIL");

    // 2. Submit FIR
    const firRes = await fetch(`${API_URL}/fir`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${citizenToken}` },
      body: JSON.stringify({
        complainant: "Demo Citizen",
        incidentDescription: "Missing person report for demo",
        incidentDate: new Date(),
        incidentLocation: "NSP Mall",
        category: "MISSING_PERSON"
      })
    });
    const firData = await firRes.json();
    firId = firData.fir._id;
    console.log("3. FIR Submission:", firRes.status === 201 ? "PASS" : "FAIL", firId);

    // 3. Generate Case
    const caseRes = await fetch(`${API_URL}/case`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${citizenToken}` },
      body: JSON.stringify({ firId: firId })
    });
    const caseData = await caseRes.json();
    caseId = caseData.case.caseId;
    console.log("4. Case Generated:", caseRes.status === 201 ? "PASS" : "FAIL", caseId);

    // 4. Police Login
    const pLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "police@anveshak.com", password: "TestPolice@123" })
    });
    const pLoginData = await pLoginRes.json();
    policeToken = pLoginData.token;
    console.log("5. Police Login:", policeToken ? "PASS" : "FAIL");

    // 5. Update Status (Timeline & Audit)
    const statusRes = await fetch(`${API_URL}/case/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${policeToken}` },
      body: JSON.stringify({ caseId: caseId, status: "INVESTIGATION_ONGOING" })
    });
    console.log("6. Status Update (Timeline):", statusRes.status === 200 ? "PASS" : "FAIL");

    // 6. Upload Evidence
    const formData = new FormData();
    const blob = new Blob(["test evidence content"], { type: "text/plain" });
    formData.append("file", blob, "test_evidence.txt");
    formData.append("caseId", caseId);
    formData.append("description", "Test evidence file");

    const evRes = await fetch(`${API_URL}/evidence/upload`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${policeToken}` },
      body: formData
    });
    const evData = await evRes.json();
    console.log("7. Evidence Upload:", evRes.status === 201 ? "PASS" : "FAIL", evData.message);

    // 7. Verify Timeline & Audit API
    const tlRes = await fetch(`${API_URL}/case/${caseId}/timeline`, {
      headers: { 'Authorization': `Bearer ${policeToken}` }
    });
    const tlData = await tlRes.json();
    console.log("8. Timeline Fetch:", tlRes.ok && tlData.timeline?.length > 0 ? "PASS" : "FAIL", `Count: ${tlData.timeline?.length}`);

    const auRes = await fetch(`${API_URL}/case/${caseId}/audit`, {
      headers: { 'Authorization': `Bearer ${policeToken}` }
    });
    const auData = await auRes.json();
    console.log("9. Audit Fetch:", auRes.ok && auData.auditLogs?.length > 0 ? "PASS" : "FAIL", `Count: ${auData.auditLogs?.length}`);

    // 8. Analyze Case with AI
    // NOTE: This might take time or fail if API key is rate limited, let's just test if endpoint responds
    const aiRes = await fetch(`${API_URL}/case/analyze`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${policeToken}` },
      body: JSON.stringify({ caseId: caseId })
    });
    console.log("10. AI Analysis:", aiRes.status === 200 ? "PASS" : `WARN: ${aiRes.status}`);

    console.log("=== TESTS COMPLETED ===");

  } catch(e) {
    console.error("Test failed with exception:", e);
  }
}

runFullTest();
