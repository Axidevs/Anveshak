const axios = require("axios");

const API_URL = "http://localhost:5001/api";

async function runTest() {
  try {
    console.log("1. Registering new citizen...");
    const regEmail = `citizen_${Date.now()}@test.com`;
    let res = await axios.post(`${API_URL}/auth/register`, {
      name: "Demo Citizen",
      email: regEmail,
      password: "citizenpassword",
      role: "CITIZEN"
    });
    console.log("Registration successful", res.data.user.email);

    console.log("2. Logging in citizen...");
    res = await axios.post(`${API_URL}/auth/login`, {
      email: regEmail,
      password: "citizenpassword"
    });
    const citizenToken = res.data.token;
    console.log("Citizen Login successful, Token obtained");

    console.log("3. Submitting FIR...");
    res = await axios.post(`${API_URL}/fir`, {
      incidentType: "MISSING_PERSON",
      incidentLocation: "Delhi",
      incidentDate: "2026-09-15T00:00:00.000Z",
      description: "My person is missing."
    }, { headers: { Authorization: `Bearer ${citizenToken}` } });
    const firId = res.data.fir._id;
    console.log("FIR created in MongoDB:", firId);

    console.log("4. Creating Case from FIR...");
    res = await axios.post(`${API_URL}/case`, { firId }, { headers: { Authorization: `Bearer ${citizenToken}` } });
    const caseObj = res.data.case;
    console.log("Case ID generated:", caseObj.caseId);
    console.log("Assigned Officer ID:", caseObj.assignedOfficer);

    console.log("5. Logging in Police...");
    // 5a. Test wrong password
    try {
      await axios.post(`${API_URL}/auth/login`, { email: "police@anveshak.com", password: "wrongpassword" });
      console.log("FAIL: Wrong password accepted!");
    } catch(err) {
      console.log("Expected: Wrong password rejected");
    }

    // 5b. Real login
    res = await axios.post(`${API_URL}/auth/login`, { email: "police@anveshak.com", password: "TestPolice@123" });
    const policeToken = res.data.token;
    console.log("Police Login successful, Token obtained");

    console.log("6. Checking Police Dashboard for the Case...");
    res = await axios.get(`${API_URL}/case/assigned-to-me`, { headers: { Authorization: `Bearer ${policeToken}` } });
    const cases = res.data.cases;
    const found = cases.find(c => c.caseId === caseObj.caseId);
    if(found) {
      console.log("PASS: Assigned case visible in Police Dashboard API");
    } else {
      console.log("FAIL: Case not found in assigned-to-me!");
    }

    console.log("7. Checking Case Detail...");
    res = await axios.get(`${API_URL}/case/${caseObj.caseId}`, { headers: { Authorization: `Bearer ${policeToken}` } });
    console.log("PASS: Case Detail loaded for case", res.data.case.caseId);

  } catch(err) {
    console.error("Test failed:", err.response ? err.response.data : err.message);
  }
}

runTest();
