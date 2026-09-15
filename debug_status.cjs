const fs = require('fs');
async function debugStatus() {
  const API_URL = 'http://localhost:5001/api';
  const pLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: "police@anveshak.com", password: "TestPolice@123" })
  });
  const pLoginData = await pLoginRes.json();
  const policeToken = pLoginData.token;

  const statusRes = await fetch(`${API_URL}/case/status`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${policeToken}` },
    body: JSON.stringify({ caseId: "ANV-2026-271196", status: "INVESTIGATION_ONGOING" })
  });
  console.log("Status update response:", await statusRes.json());
}
debugStatus();
