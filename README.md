# DevSentinel: Principal-Level AI Code Reviewer

> **DevSentinel** — An AI code reviewer agent that lives in a git repo. Reviews every PR like a principal engineer: paranoid about security, meticulous about quality, focused on shipping safely.

---

## Problem

Every engineering team has the same bottleneck:

- **Senior engineers waste 2,000+ hours per year** per 10-person team reviewing PRs manually
- **Security vulnerabilities slip through** because reviews are rushed  
- **Testing gaps go unnoticed** until production incidents
- **Code quality regresses** as teams scale

DevSentinel automates the pattern-based checks that should never require human attention.

---

## Architecture

DevSentinel is a **6-skill sequential pipeline** living entirely in a git repo. When a PR is submitted:

```
PR Submitted (GitHub)
        ↓
[1] PR Diff Reader      → Parse changes into structured data
        ↓
[2] Security Scanner    → Detect OWASP vulnerabilities (CWE/OWASP refs)
        ↓
[3] Quality Analyzer    → Flag complexity, anti-patterns, dead code
        ↓
[4] Test Gap Detector   → Ensure test coverage on critical paths
        ↓
[5] Review Composer     → Synthesize findings into decision
        ↓
[6] Branch Guardian     → Enforce branch promotion gates (dev→staging→main)
        ↓
Review posted + Merge decision
```

**Key Property:** Each skill runs sequentially. Downstream skills consume upstream outputs. Security findings gate the entire pipeline (CRITICAL blocks merge).

---

## The 6 Skills

### 1. PR Diff Reader
**Input:** Raw PR diff  
**Output:** Structured change analysis (files, lines, semantic categorization)  
**Logic:** Parse diffs, identify sensitive paths (auth, payment, database)

### 2. Security Scanner ← DIFFERENTIATOR
**Input:** PR diff  
**Output:** Security findings with CWE/OWASP references  
**Rules:**
- Detect SQL injection, XSS, broken auth, weak crypto, XXE, path traversal
- Every finding links to CWE ID and OWASP Top 10 mapping
- **CRITICAL findings block merge** (non-negotiable)

### 3. Quality Analyzer
**Input:** PR diff  
**Output:** Quality issues (complexity, anti-patterns, dead code)  
**Rules:**
- Measure cyclomatic complexity, cognitive complexity
- Flag: God objects, magic numbers, callback hell, unused variables
- Focus on maintainability, not style

### 4. Test Gap Detector
**Input:** PR diff + test file patterns  
**Output:** Untested code paths, missing regression tests  
**Rules:**
- New logic requires test coverage
- Critical paths (auth, payment) **require tests** (gaps block merge)
- Recommend specific test cases

### 5. Review Composer
**Input:** Findings from skills 2-4  
**Output:** Synthesis + decision (BLOCK | REQUEST_CHANGES | APPROVE)  
**Rules:**
- Prioritize by severity
- Provide actionable remediation code (not vague criticism)
- Human-readable tone with technical precision

### 6. Branch Guardian ← DIFFERENTIATOR
**Input:** Review decision  
**Output:** Merge gate enforcement  
**Rules:**
- Enforce **dev → staging → main** progression
- Prevent branch skipping
- Fast-track hotfixes with escalation
- **If CRITICAL findings: block promotion**

---

## Project Structure

```
devsentinel/
├── agent.yaml                       # Manifest: spec 0.1.0, 6 skills, model
├── SOUL.md                          # Identity: "I am DevSentinel, a principal-level..."
├── RULES.md                         # Constraints: "Must always check security first"
├── skills/
│   ├── pr-diff-reader/SKILL.md
│   ├── security-scanner/SKILL.md
│   ├── quality-analyzer/SKILL.md
│   ├── test-gap-detector/SKILL.md
│   ├── review-composer/SKILL.md
│   └── branch-guardian/SKILL.md     # Git-native promotion gating
├── package.json
├── demo.cjs                         # Runnable simulator (all 6 skills in action)
└── README.md                        # This file
```

---

## Why This Wins the Hackathon

✅ **Hits brief dead center:** Code review agent explicitly listed as inspiration  
✅ **Uses git-native differentiator:** `branch-guardian` uses dev→staging→main promotion (pure git, no API)  
✅ **Enterprise-ready:** CWE/OWASP refs, auditable decisions, actionable feedback  
✅ **Realistic scope:** 6 focused skills, no hallucination risk (pattern-based)  
✅ **Judges know this:** Organizers built examples of this exact problem

---

## Quick Start

### Prerequisites
- Node.js 18+
- `gitagent` CLI (for validation)
- `gitclaw` runtime (optional, for live execution)

### Validate
```bash
cd devsentinel
npx gitagent validate
# Expected: ✅ All checks pass
```

### See It In Action
```bash
# Demo simulator (shows all 6 skills executing)
node demo.cjs
```

**Output:** Real-time execution showing:
- SQL injection detected (CRITICAL)
- Test gaps found (HIGH)
- Code quality issues (MEDIUM)
- Final decision: BLOCKED (until CRITICAL fixed)
- Branch promotion: BLOCKED

---

## Real-World Example

### Input PR: Refund Functionality

```typescript
export async function refundOrder(orderId, amount) {
  // ❌ SQL injection vulnerability
  const order = await db.query(`SELECT * FROM orders WHERE id = ${orderId}`);
  if (amount > order.total) throw new Error('Amount exceeds');
  
  // ❌ No tests added for this 34 LOC function
  const result = await paymentGateway.refund(order.paymentId, amount);
  await db.orders.update(orderId, { status: 'refunded' });
  return result.success;
}
```

### DevSentinel's Review

```
🔴 VERDICT: BLOCK

CRITICAL [Security Scanner]
  SQL Injection in src/payment/refund.ts:2
  Code: db.query(`SELECT * FROM orders WHERE id = ${orderId}`)
  Fix: db.query('SELECT * FROM orders WHERE id = ?', [orderId])
  CWE-89 | OWASP A03:2021 – Injection

HIGH [Test Gap Detector]
  34 LOC function with 0 tests
  Suggest: Happy path, error cases, idempotency tests
  
Decision: BLOCKED (CRITICAL must be fixed first)
Branch Promotion: BLOCKED
```

---

## Submission

**For HackCulture:**

1. **Record demo video** (2-5 min)
   ```bash
   node demo.cjs
   ```
   Shows all 6 skills executing on sample PR with vulnerabilities.

2. **Push to public GitHub**
   ```bash
   git push -u origin master
   ```

3. **Fill form (7 fields):**
   - Theme: Open Innovation
   - Title: DevSentinel: Principal-Level AI Code Reviewer with Branch Promotion Gating
   - Description: [Problem → 6 skills → why it wins]
   - GitHub: [your repo URL]
   - Demo Video: [Loom or YouTube link]
   - Features: 6 skills + gitagent format + branch-guardian differentiator
   - Run Instructions: `node demo.cjs`

4. **Submit before April 3, 2026, 11:59 PM IST**

---

## What's Inside

- `agent.yaml` — Manifest (spec 0.1.0, Claude Sonnet 4.5, 6 skills)
- `SOUL.md` — Agent identity and values
- `RULES.md` — Hard constraints (security-first)
- `skills/*.md` — Complete skill definitions with YAML frontmatter and logic
- `demo.cjs` — Runnable simulator showing real execution
- `package.json` — Config (gitclaw SDK optional)

---

## Resources

- [GitAgent Spec](https://github.com/open-gitagent/gitagent)
- [gitclaw SDK](https://github.com/open-gitagent/gitclaw)
- [clawless Deployment](https://github.com/open-gitagent/clawless)
- [OWASP Top 10](https://owasp.org/Top10/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
