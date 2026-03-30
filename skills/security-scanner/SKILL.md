---
name: security-scanner
description: "Detects OWASP-class vulnerabilities: SQL injection, XSS, authentication flaws, cryptography misuse, insecure deserialization, and sensitive data exposure"
allowed-tools: [Read, Bash]
depends-on: [pr-diff-reader]
produces: {
  findings: "array of security issues with severity CRITICAL/HIGH/MEDIUM",
  cwe_references: "Common Weakness Enumeration IDs",
  owasp_mappings: "OWASP Top 10 categorization"
}
---

# Security Scanner

## Overview

The Security Scanner skill performs static security analysis on code changes, flagging OWASP-class vulnerabilities before they reach production. This is the gating skill—**CRITICAL** findings block the review.

## Input

```json
{
  "diff_summary": "from pr-diff-reader",
  "files_to_analyze": [
    {
      "path": "src/api/users.js",
      "language": "javascript",
      "content_before": "...",
      "content_after": "..."
    }
  ],
  "sensitive_paths": ["src/auth/*", "src/payment/*", "src/database/*"]
}
```

## Output

```json
{
  "findings": [
    {
      "severity": "CRITICAL",
      "type": "SQL_INJECTION",
      "file": "src/database/query.ts",
      "line": 45,
      "code_snippet": "db.query(`SELECT * FROM users WHERE id = ${userId}`)",
      "message": "User-supplied userId concatenated into SQL query without parameterization",
      "cwe": "CWE-89",
      "owasp": "A03:2021 – Injection",
      "remediation": "Use parameterized queries: db.query('SELECT * FROM users WHERE id = ?', [userId])",
      "confidence": 0.98
    }
  ],
  "summary": {
    "total_findings": 3,
    "critical_count": 1,
    "high_count": 1,
    "medium_count": 1,
    "blocks_merge": true
  }
}
```

## Security Patterns Detected

### CRITICAL (Blocks Merge)

| Pattern | Detection | Example | Remediation |
|---------|-----------|---------|-------------|
| **SQL Injection** | Template literals or string concatenation in queries | `` `SELECT * FROM users WHERE id = ${id}` `` | Use parameterized queries: `db.query(sql, [params])` |
| **Hardcoded Secrets** | API keys, passwords, private keys in source | `const API_KEY = "sk_live_..."` | Use environment variables or secrets manager |
| **Weak Cryptography** | MD5, SHA1 for password hashing | `crypto.createHash('md5')` | Use bcrypt, Argon2, or PBKDF2 |
| **Broken Authentication** | JWT without signature verification | `jwt.verify(token)` without secret | Always verify with shared secret |
| **Insecure Deserialization** | eval(), pickle.loads(), Java deserialization | `eval(user_input)` | Use JSON parsing, schema validation |
| **XXE Injection** | XML parsing without DTD disabling | `xml.parse(user_xml)` | Disable DTD: `XMLParser({resolve_externals: false})` |

### HIGH (Highly Recommended Fix)

| Pattern | Detection | Example | Risk |
|---------|-----------|---------|------|
| **XSS Vulnerability** | Unescaped HTML output | `document.innerHTML = userInput` | Execute arbitrary JavaScript in victim's browser |
| **Auth Bypass** | Missing access control checks | `if (admin) {...}` without verifying role | Unauthorized access to user data |
| **Missing CSRF Protection** | State-changing operations without tokens | `<form method="POST">` without CSRF token | One-click attacks on authenticated users |
| **Insecure File Upload** | No file type/size validation | `fs.writeFileSync(uploadedFile)` | Execute malicious code, DoS |
| **Information Disclosure** | Stack traces, error messages with secrets | `console.error(error.stack)` | Leak credentials and system structure |

### MEDIUM (Should Review)

| Pattern | Detection | Example | Concern |
|---------|-----------|---------|---------|
| **Use of Dangerous Functions** | `exec()`, dangerous shell operations | `child_process.exec(userCommand)` | Command injection if inputs not validated |
| **Path Traversal** | No path validation on file operations | `fs.readFile(req.query.file)` | Read arbitrary files on server |
| **Insufficient Logging** | No audit trail for sensitive operations | Missing logs on auth, payment changes | Can't detect or investigate attacks |
| **Null/Undefined Handling** | Missing null checks before operations | `user.email.toLowerCase()` when user might be null | Null pointer exceptions, info disclosure |

## Execution Steps

1. **Extract code changes from diff**
   - For each modified hunk, extract before and after code
   - Load full file context if necessary

2. **Pattern matching**
   - Apply regex and AST-based patterns for each security class
   - Check sensitive paths first

3. **Classify and score**
   - Assign CWE ID, OWASP category
   - Calculate confidence (0.0-1.0) based on pattern match certainty
   - If confidence < 0.7, mark as "review required"

4. **Generate remediation**
   - Provide specific, copy-paste-ready fixes
   - Link to OWASP and CWE documentation

5. **Determine if blocking**
   - If CRITICAL finding exists → blocks_merge = true
   - PR cannot proceed until fixed

## Error Cases

- **Encoding errors**: Skip file, log warning, continue with other files
- **No findings**: Return empty findings array (this is good!)
- **Pattern timeout**: Cap analysis at 10 seconds per file, flag as incomplete review if exceeded

## Example: Real SQL Injection Detection

**Input Code:**
```javascript
app.get('/user/:id', (req, res) => {
  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
  db.query(query, (err, result) => {
    if (err) res.status(500).send(error);
    res.json(result[0]);
  });
});
```

**Detected Finding:**
```json
{
  "severity": "CRITICAL",
  "type": "SQL_INJECTION",
  "file": "routes/user.js",
  "line": 3,
  "message": "SQL query concatenates unsanitized user input (req.params.id)",
  "cwe": "CWE-89",
  "owasp": "A03:2021 – Injection",
  "remediation": "Use parameterized queries:\ndb.query('SELECT * FROM users WHERE id = ?', [req.params.id], ...)",
  "confidence": 0.99
}
```

## Success Criteria

✓ All CRITICAL vulnerabilities detected
✓ False positive rate < 5%
✓ Confidence scores realistic (no artificial 100% certainty)
✓ CWE and OWASP mappings accurate
✓ Remediation advice is specific and actionable
✓ Execution time < 5 seconds for typical 50-file review
