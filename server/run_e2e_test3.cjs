const API_URL = "http://localhost:5001/api";

async function myFetch(url, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if(token) headers["Authorization"] = `Bearer ${token}`;
  
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : null });
  const data = await res.json();
  if(!res.ok) throw { status: res.status, data };
  return { data };
}

async function runTest() {
  try {
    console.log("1. Registering new citizen...");
    const regEmail = `citizen_${Date.now()}@test.com`;
    let res = await myFetch(`${API_URL}/auth/register`, "POST", {
      name: "Demo Citizen",
      email: regEmail,
      password: "citizenpassword",
      role: "CITIZEN"
    });
    console.log("Registration successful", res.data.user.email);

    console.log("2. Logging in citizen...");
    res = await myFetch(`${API_URL}/auth/login`, "POST", {
      email: regEmail,
      password: "citizenpassword"
    });
    const citizenToken = res.data.token;
    console.log("Citizen Login successful, Token obtained");

    console.log("3. Submitting FIR...");
    res = await myFetch(`${API_URL}/fir`, "POST", {
      complainant: "Demo Citizen",
      incidentDescription: "My person is missing.",
      incidentDate: new Date(),
      incidentLocation: "Delhi",
      category: "MISSING_PERSON"
    }, citizenToken);
    const firId = res.data.fir._id;
    console.log("FIR created in MongoDB:", firId);

    console.log("4. Creating Case from FIR...");
    res = await myFetch(`${API_URL}/case`, "POST", { firId }, citizenToken);
    const caseObj = res.data.case;
    console.log("Case ID generated:", caseObj.caseId);
    console.log("Assigned Officer ID:", caseObj.assignedOfficer);

    console.log("5. Logging in Police...");
    try {
      await myFetch(`${API_URL}/auth/login`, "POST", { email: "police@anveshak.com", password: "wrongpassword" });
      console.log("FAIL: Wrong password accepted!");
    } catch(err) {
      console.log("PASS: Wrong password rejected");
    }

    res = await myFetch(`${API_URL}/auth/login`, "POST", { email: "police@anveshak.com", password: "TestPolice@123" });
    const policeToken = res.data.token;
    console.log("Police Login successful, Token obtained");

    console.log("6. Checking Police Dashboard for the Case...");
    res = await myFetch(`${API_URL}/case/assigned-to-me`, "GET", null, policeToken);
    const cases = res.data.cases;
    const found = cases.find(c => c.caseId === caseObj.caseId);
    if(found) {
      console.log("PASS: Assigned case visible in Police Dashboard API");
    } else {
      console.log("FAIL: Case not found in assigned-to-me!");
    }

    console.log("7. Checking Case Detail...");
    res = await myFetch(`${API_URL}/case/${caseObj.caseId}`, "GET", null, policeToken);
    console.log("PASS: Case Detail loaded for case", res.data.case.caseId);

  } catch(err) {
    console.error("Test failed:", err.data ? err.data : err);
  }
}

runTest();
