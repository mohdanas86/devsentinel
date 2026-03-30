---
name: review-composer
description: "Synthesizes findings from all prior skills into a cohesive, prioritized PR review with decision gates and actionable recommendations"
allowed-tools: [Read, Write]
depends-on: [pr-diff-reader, security-scanner, quality-analyzer, test-gap-detector]
produces: {
  pr_review: "structured review with verdict",
  recommendation: "APPROVE / REQUEST_CHANGES / BLOCK",
  decision_rationale: "why these findings matter"
}
---

# Review Composer

## Overview

The Review Composer is the decision engine. It takes findings from all prior skills, prioritizes them, and determines whether the PR should be approved, needs changes, or is blocked. This is where DevSentinel's *personality* shines—explaining not just *what* is wrong, but *why it matters*.

## Input

```json
{
  "pr_context": {
    "title": "Add refund functionality to payment processor",
    "description": "Enables order refunds via payment API",
    "target_branch": "staging",
    "base_branch": "main"
  },
  "security_findings": [
    { "severity": "CRITICAL", "type": "SQL_INJECTION", ... }
  ],
  "quality_findings": [
    { "severity": "HIGH", "category": "complexity", ... }
  ],
  "test_findings": [
    { "severity": "HIGH", "type": "new_logic_untested", ... }
  ],
  "diff_summary": { ... }
}
```

## Output

```json
{
  "review_id": "devsentinel-69ca7e0b4e02-2026-03-31",
  "verdict": "BLOCK",
  "recommendation": "REQUEST_CHANGES",
  "summary": "This PR adds critical refund functionality but has security gaps and untested paths that must be resolved before merge.",
  
  "findings_by_priority": {
    "CRITICAL": {
      "count": 1,
      "items": [
        {
          "finding": "SQL injection in refund query",
          "impact": "Attacker can exfiltrate customer data",
          "action": "Use parameterized queries",
          "blocks_merge": true
        }
      ]
    },
    "HIGH": {
      "count": 2,
      "items": [
        {
          "finding": "Refund function (34 LOC) lacks test coverage",
          "impact": "Undetected bugs could cause incorrect refunds or data loss",
          "action": "Add tests for happy path, error cases, edge cases"
        }
      ]
    }
  },
  
  "decision_gates": {
    "security_gate": "FAIL - CRITICAL finding blocks approval",
    "test_gate": "FAIL - High-risk code untested",
    "quality_gate": "WARN - Moderate complexity but acceptable",
    "overall_gate": "BLOCK_MERGE"
  },
  
  "actionable_next_steps": [
    "1. Fix SQL injection (use parameterized query) - 5 min",
    "2. Add 3 test cases for refund logic - 20 min",
    "3. Re-request review after changes"
  ],
  
  "reviewer_notes": {
    "tone": "This PR is on the right track conceptually, but refund code touches money—we need to be paranoid. Two specific things block this:\n\n1. The SQL injection is a showstopper. Once fixed (literal one-line change), that risk goes away.\n\n2. Untested refund logic means a bug here could secretly refund the wrong customer or amount. Add the 3 test cases and we're golden.\n\nAfter those fixes, this merges easily.",
    "reviewer": "DevSentinel",
    "timestamp": "2026-03-31T14:23:00Z"
  }
}
```

## Decision Logic

### Step 1: Apply Security Gate

```
if (CRITICAL_finding) {
  verdict = BLOCK
  recommendation = FIX_AND_RESUBMIT
  return
}

if (HIGH_finding) {
  verdict = REQUEST_CHANGES
  recommendation = ADDRESS_FINDINGS_OR_JUSTIFY
}
```

### Step 2: Apply Test Gate (For Critical Paths)

```
critical_paths = [auth/*, payment/*, database/*, security/*]

if (file_in_critical_paths AND new_logic_untested) {
  verdict = REQUEST_CHANGES  // even if no security issues
  severity = HIGH
}
```

### Step 3: Apply Quality Gate

```
if (complexity > HIGH) {
  recommendation = MEDIUM.priority_refactor
}

if (coverage_regression > 5%) {
  warning = COVERAGE_DEGRADATION
  recommendation = IMPROVE_COVERAGE
}
```

### Step 4: Determine Recommendation

| Conditions | Recommendation | Rationale |
|-----------|-----------------|-----------|
| No findings | APPROVE | Code is ready |
| Only LOW findings | APPROVE | Minor observations can be addressed post-merge |
| MEDIUM findings exist | REQUEST_CHANGES_OPTIONAL | Blocking not needed, but suggested |
| HIGH findings exist | REQUEST_CHANGES | Must address before merge |
| CRITICAL findings exist | BLOCK | Blocks indefinitely until fixed |
| Multiple HIGH + test gaps | REQUEST_CHANGES | Address all before merge |

### Step 5: Compose Human-Readable Message

- **Lead with impact**: Why does this matter?
- **Organize by severity**: Critics first, then warnings, then suggestions
- **Provide paths to approval**: What exactly will unblock this?
- **Tone**: Professional but collaborative, never dismissive

## Output Sections

### 1. Executive Summary (1-2 sentences)

Example:
- "✅ APPROVED: Well-tested security improvements with no quality concerns."
- "🔴 BLOCKED: Critical SQL injection in payment processing must be fixed."
- "⚠️ CHANGES_REQUESTED: Add missing tests for new refund logic, then resubmit."

### 2. Findings by Priority

Group all findings from all skills by severity:

```
CRITICAL (1):
- SQL injection in src/refund.ts:45 allows data exfiltration

HIGH (2):
- 34 LOC refund function lacks test coverage
- Complexity score 12 exceeds threshold 8

MEDIUM (1):
- Unused variable 'tempToken' in session.ts

LOW (1):
- Consider extracting rate-limiting into separate helper
```

### 3. Decision Gates

Show why each gate passed or failed:

```
Security Gate: ✅ PASS (no critical vulnerabilities)
Test Gate: ❌ FAIL (new untested logic in payment path)
Quality Gate: ⚠️ WARN (moderate complexity - acceptable with test coverage)
Overall: 🔴 BLOCK (test gaps on critical path prevent merge)
```

### 4. Actionable Next Steps

Specific, ordered list of what to fix:

```
1. Add 3 test cases to tests/refund.test.ts (20 min)
2. Extract validateRefundAmount() helper to reduce complexity (10 min)
3. Re-run review after changes
```

### 5. Reviewer Notes

Natural language message from DevSentinel explaining context and tone.

## Example: Real Review Output

**PR: "Add customer refund endpoint"**

```json
{
  "verdict": "REQUEST_CHANGES",
  "recommendation": "Add tests, then approve",
  "summary": "Refund feature is well-designed but touches money—needs test coverage before merge.",
  
  "findings_ranked": [
    {
      "rank": 1,
      "severity": "HIGH",
      "from_skill": "test-gap-detector",
      "message": "34 LOC refund function added with 0 tests",
      "impact": "Bug in refund logic could silently refund wrong amounts or customers",
      "next_step": "Add 3 test cases: happy path, invalid orderId, already refunded"
    },
    {
      "rank": 2,
      "severity": "MEDIUM",
      "from_skill": "quality-analyzer",
      "message": "validateRefund() has cyclomatic complexity 11 (threshold 8)",
      "impact": "Difficult to understand all code paths; higher bug risk",
      "next_step": "Extract validation rules into helper functions (reduces complexity to 6)"
    }
  ],
  
  "gates": {
    "security": { "status": "PASS", "message": "No security issues detected" },
    "test": { "status": "FAIL", "message": "Critical path code untested" },
    "quality": { "status": "PASS", "message": "Complexity high but acceptable" }
  },
  
  "reviewer_message": "Like the refund feature—clean API design. Two asks before merge:\n\n1) Add tests. Refund code touches customer money, so we need proof it works. Three test cases (happy path, invalid, idempotent) and you're done.\n\n2) Optional: extracting validateRefund() logic into helpers makes the code easier to reason about. Not blocking, but would improve maintainability.\n\nOnce tests are in, this merges easy. Well done.",
  
  "estimate_to_merge": "30 min (adding tests)"
}
```

## Success Criteria

✓ Verdict correctly reflects security/test/quality gates
✓ Recommendations are actionable and truthful
✓ Decision rationale is clear and defensible
✓ Tone is professional and collaborative
✓ Time-to-merge estimate is realistic
✓ No information from upstream skills is lost
