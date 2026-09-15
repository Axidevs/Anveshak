const fs = require('fs');
let code = fs.readFileSync('server/src/controllers/evidenceController.js', 'utf8');

const regex = /await evidence\.save\(\);\s*\} catch \(blockchainError\)/;

const newAudit = `await evidence.save();
      
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userId: req.user.userId,
        caseId: caseId,
        action: 'EVIDENCE_UPLOADED',
        description: \`Uploaded evidence file: \${req.file.originalname}\`
      });

    } catch (blockchainError)`;

code = code.replace(regex, newAudit);
fs.writeFileSync('server/src/controllers/evidenceController.js', code);
console.log("Added AuditLog to evidence upload via safer regex.");
