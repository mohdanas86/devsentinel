---
name: branch-guardian
description: "Enforces branch promotion gates: dev → staging → main. Prevents merges that skip stages, validates release readiness, and manages branch protection policies"
allowed-tools: [Bash, Read]
depends-on: [review-composer]
produces: {
  branch_promotion_allowed: "boolean",
  promotion_path: "approved trajectory",
  gating_decision: "promote / hold / escalate"
}
---

# Branch Guardian

## Overview

The Branch Guardian skill is the *final gating mechanism*. It enforces the sacred three-stage progression: **dev → staging → main**. This prevents chaos, ensures testing in appropriate environments, and makes deployments predictable.

## The Promotion Model

```
┌─────────┐      ┌──────────┐      ┌──────┐
│   dev   │─────►│ staging  │─────►│ main │
│ (rapid)│      │(validated)│      │(live)│
└─────────┘      └──────────┘      └──────┘
  •Merges        • DevSentinel      • Zero-downtime
  •Fast          checks every PR    deployment
  •Experi​mental •Integration tests •Monitoring
  •High churn    •Staging deploy    •Rollback ready
```

## Input

```json
{
  "pr_context": {
    "number": 1234,
    "title": "Add refund functionality",
    "source_branch": "feature/refunds",
    "target_branch": "staging",  
    "base_branch": "main"
  },
  "review_decision": {
    "verdict": "APPROVED",
    "blocks_merge": false
  },
  "branch_config": {
    "current_branch": "staging",
    "production_branch": "main",
    "allowed_merges": ["dev→staging", "staging→main"],
    "require_tests_staging": true,
    "require_approval_main": true,
    "rollback_plan_required": false
  }
}
```

## Output

```json
{
  "can_promote_to_staging": true,
  "can_promote_to_main": false,
  "current_state": "staging",
  "next_state": "main",
  "decision": "HOLD",
  
  "checks": [
    {
      "check": "correct_branch_progression",
      "status": "PASS",
      "message": "PR targets staging (correct: feature → staging → main)"
    },
    {
      "check": "review_approval",
      "status": "PASS",
      "message": "DevSentinel approved (no CRITICAL findings)"
    },
    {
      "check": "staging_validation",
      "status": "PENDING",
      "message": "Awaiting integration test results from staging deploy"
    },
    {
      "check": "production_readiness",
      "status": "UNKNOWN",
      "message": "Cannot assess main-readiness until staging tests pass"
    }
  ],
  
  "promotion_path": {
    "current": "feature/refunds",
    "immediate_target": "staging",
    "timeline": {
      "staging_deploy": "now",
      "staging_validation_window": "2-4 hours",
      "production_earliest": "2026-04-01T12:00Z",
      "production_required_approval": "release-manager"
    }
  },
  
  "gating_decision": {
    "stage": "staging",
    "verdict": "APPROVE_TO_STAGING",
    "message": "Quality gate passed. Promote to staging for integration testing."
  }
}
```

## Gate 1: Branch Progression Validation

**Question**: Is this PR respecting the dev → staging → main flow?

| Source | Target | Allowed? | Reason |
|--------|--------|----------|--------|
| feature/my-feature | dev | ✅ YES | Feature branch merges to dev for fast iteration |
| feature/my-feature | staging | ✅ YES | Stable features merge from dev to staging |
| feature/my-feature | main | 🔴 NO | Feature branches cannot skip to main |
| dev | staging | ✅ YES | Dev is integration point; promote stable batch to staging |
| dev | main | 🔴 NO | Cannot skip staging (validation layer) |
| staging | main | ✅ YES | Only after staging validation |
| hotfix/critical-fix | main | ⚠️ ALERT | Emergency bypass (requires escalation approval) |

**Implementation:**
```
if target_branch == "main" AND source_branch != "staging":
  if NOT is_security_hotfix():
    return BLOCK("Must merge through staging first")
  else:
    return ESCALATE("Hotfix bypass requires release manager approval")

if target_branch == "staging" AND source_branch NOT IN [dev, feature/*]:
  return BLOCK("Staging accepts only dev or feature branches")
```

## Gate 2: Review Approval

**Question**: Did DevSentinel approve this change?

| Review Verdict | Promotion Allowed | Implication |
|---|---|---|
| APPROVED | ✅ YES | Proceed to next gate |
| REQUEST_CHANGES | ⚠️ HOLD | Author must address findings and re-request |
| BLOCKED | 🔴 NO | Cannot merge until CRITICAL findings fixed |
| IN_PROGRESS | ⏳ WAIT | Await review completion |

## Gate 3: Staging Validation (If target = main)

**Question**: Has this PR been tested in staging and deemed production-ready?

```json
{
  "gate": "staging_validation",
  "required_evidence": [
    "Successfully deployed to staging (no crashes)",
    "Integration tests passed",
    "No new errors in staging logs (24 hour window)",
    "Performance metrics within SLA",
    "Smoke tests passed"
  ],
  "decision_tree": {
    "if_not_deployed_to_staging": "BLOCK - cannot promote to main without staging test",
    "if_staging_tests_fail": "BLOCK - must fix issues in dev/staging first",
    "if_staging_passing_48h": "PASS - promote to main",
    "if_unknown": "HOLD - await staging deployment"
  }
}
```

## Gate 4: Production Release Approval

**Question**: Is a release manager or deployment owner approving the main branch merge?

```
Required for → main:
  ✓ Review approval
  ✓ Staging validation passed
  ✓ Release notes in PR description
  ✓ Rollback plan documented (if needed)
  ✓ One approval from release-managers team
```

## Decision Matrix

| Scenario | Verdict | Action |
|----------|---------|--------|
| **Feature PR to dev** | ✅ APPROVE | Merge immediately if review good |
| **Stable batch: dev → staging** | ✅ APPROVE | Deploy to staging, await integration tests |
| **Staging → main after validation** | ✅ APPROVE | Deploy to production with release manager sign-off |
| **Feature directly to main** | 🔴 BLOCK | Force rebase onto dev, merge there first |
| **Urgent security hotfix** | ⏩ ESCALATE | Release manager decides (fast-track allowed) |
| **Main branch has critical issue** | 🔴 EMERGENCY | Create hotfix branch, fast-track approval |

## Output Decisions

### APPROVE_TO_DEV
```json
{
  "verdict": "APPROVE_TO_DEV",
  "message": "Feature branch can merge to dev. Quality checks passed.",
  "next_step": "Merge and wait for continuous integration",
  "time_to_main": "2-4 hours (via staging)"
}
```

### APPROVE_TO_STAGING
```json
{
  "verdict": "APPROVE_TO_STAGING",
  "message": "Batch from dev ready for staging validation.",
  "next_step": "Deploy to staging, run integration tests",
  "time_to_main": "24-48 hours (after staging validation)"
}
```

### HOLD_PENDING_STAGING_TESTS
```json
{
  "verdict": "HOLD",
  "message": "Cannot decide on main merge until staging validation completes.",
  "blockers": ["integration_tests_in_progress"],
  "eta": "2026-04-01T12:00Z"
}
```

### BLOCK_PROMOTION
```json
{
  "verdict": "BLOCK",
  "message": "This PR cannot merge to main.",
  "reason": "Source branch is feature/xyz, not staging. Must merge to dev first.",
  "required_action": "Rebase this branch onto dev, merge there, then fast-forward to staging"
}
```

### ESCALATE_HOTFIX
```json
{
  "verdict": "ESCALATE",
  "message": "Security hotfix detected: attempting direct → main merge.",
  "action": "Escalating to release-managers for emergency approval",
  "approval_required": ["@release-managers", "@security-lead"],
  "sla": "15 minutes"
}
```

## Example: Real Promotion Decision

**Scenario**: PR #423 from dev → staging

```json
{
  "pr": 423,
  "source": "dev",
  "target": "staging",
  
  "checks": [
    { "progression_valid": true, "status": "PASS" },
    { "review_approved": true, "status": "PASS" },
    { "author_cleared": true, "status": "PASS" }
  ],
  
  "verdict": "APPROVE_TO_STAGING",
  "message": "Promoting to staging. CI will deploy and run integration tests. Expect validation in 2-4 hours.",
  "next_decision": "Branch Guardian will re-evaluate for main merge after staging validation passes."
}
```

**Scenario**: PR #415 from feature/x → main (INCORRECT)

```json
{
  "pr": 415,
  "source": "feature/x",
  "target": "main",
  
  "checks": [
    { "progression_valid": false, "status": "FAIL", "reason": "Skipping staging tier" },
    { "review_approved": true, "status": "PASS" }
  ],
  
  "verdict": "BLOCK",
  "message": "Cannot merge feature branches directly to main. The dev → staging → main progression exists to prevent chaos:\n\n1. Merge to dev (rapid iteration)\n2. Batch from dev → staging (integration testing)\n3. Staging → main (production)\n\nRebase this onto dev and follow the pipeline.",
  "required_action": "Rebase onto dev, merge there first"
}
```

## Success Criteria

✓ 100% enforcement of dev → staging → main progression
✓ Hotfixes properly escalated and fast-tracked
✓ No bypasses possible without explicit override
✓ Decision rationale is transparent and auditable
✓ Release timeline clearly communicated
✓ Rollback decisions are traceable
