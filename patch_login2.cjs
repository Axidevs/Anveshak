const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/Login.jsx', 'utf8');

const regex = /<button onClick=\{\(\) => setStep\(2\)\} className="mt-6 text-navy\/70 hover:text-navy text-sm font-medium underline-offset-4 hover:underline transition-colors">\s*Change Role\s*<\/button>\s*<\/div>\s*\)\s*:\s*\(/;

const newStr = `<div className="flex flex-col gap-3 mt-6 items-center w-full">
              <button onClick={() => setStep(2)} className="text-navy/70 hover:text-navy text-sm font-medium underline-offset-4 hover:underline transition-colors">
                Change Role
              </button>
              {selectedRole === 'citizen' && (
                <Link to="/register/citizen" className="text-navy font-bold hover:underline text-sm mt-2">
                  New Citizen? Register here
                </Link>
              )}
            </div>
          </div>
        ) : (`;

code = code.replace(regex, newStr);
fs.writeFileSync('src/pages/auth/Login.jsx', code);
console.log("Regex patch applied.");
