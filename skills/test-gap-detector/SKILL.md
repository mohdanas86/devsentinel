---
name: test-gap-detector
description: "Detects missing test coverage: new logic without tests, modified functions without test updates, deprecated test patterns, and coverage gaps"
allowed-tools: [Read, Bash]
depends-on: [pr-diff-reader]
produces: {
  test_gaps: "array of missing test scenarios",
  coverage_analysis: "estimated coverage changes"
}
---

# Test Gap Detector

## Overview

The Test Gap Detector identifies code changes that lack corresponding test coverage. In enterprise deployments, untested code is a liability—this skill ensures test-driven modification practices.

## Input

```json
{
  "diff_summary": "from pr-diff-reader",
  "added_files": [
    {
      "path": "src/payment/processor.ts",
      "content": "..."
    }
  ],
  "modified_files": [
    {
      "path": "src/auth/login.ts",
      "before": "...",
      "after": "..."
    }
  ],
  "test_files": [
    {
      "path": "tests/auth.test.ts",
      "content": "..."
    }
  ]
}
```

## Output

```json
{
  "gaps": [
    {
      "type": "new_logic_untested",
      "severity": "HIGH",
      "file": "src/payment/processor.ts",
      "function": "refundOrder",
      "lines": "45-78",
      "message": "New function 'refundOrder' added with 34 LOC but no corresponding test found",
      "affected_paths": ["src/payment/*"],
      "suggested_test_cases": [
        "refundOrder with partial amount (75%) - should update remaining balance",
        "refundOrder with invalid orderId - should throw error",
        "refundOrder on already refunded order - should handle idempotency"
      ]
    },
    {
      "type": "modified_branch_untested",
      "severity": "MEDIUM",
      "file": "src/auth/login.ts",
      "function": "validatePassword",
      "changes": "Added new branch: if (attemptsExceeded) rateLimitUser()",
      "message": "New error-handling branch added but no test for rate limiting scenario",
      "suggested_test_cases": [
        "validatePassword with 10+ failed attempts - should rate limit",
        "rate limited user retrying after 5 min - should unblock"
      ]
    }
  ],
  "summary": {
    "total_gap_count": 3,
    "high_severity_gaps": 1,
    "estimated_coverage_impact": {
      "before_coverage": 85,
      "after_coverage_if_untested": 72,
      "recommended_tests_count": 8
    }
  }
}
```

## Gap Detection Patterns

### Type 1: New Logic Untested

| Condition | Severity | Action |
|-----------|----------|--------|
| New function added (logic > 10 LOC) | HIGH | Must have corresponding test file |
| New class added (> 50 LOC) | HIGH | Must have test suite |
| New utility exported | MEDIUM | Should have test coverage |
| Simple one-liner added | LOW | Low priority |

### Type 2: Modified Logic Untested

| Condition | Severity | Issue | Requirement |
|-----------|----------|-------|-------------|
| Changed error handling branch | HIGH | New error path untested | Test error case |
| Changed business logic | HIGH | Behavior changed, no regression test | Add regression test |
| Changed default value | MEDIUM | Might surprise callers | Test new behavior |
| Changed comment only | LOW | No logic change | No test needed |

### Type 3: Test File Issues

| Pattern | Problem | Fix |
|---------|---------|-----|
| **Old test framework** | Using test library removed from dependencies | Migrate to current framework (Jest, Vitest) |
| **Deprecated setup** | Using `beforeEach` with `this` context | Migrate to modern async setup |
| **Missing edge cases** | Happy path only, no error scenarios | Add tests for null, invalid, timeout cases |
| **Brittle assertions** | Testing implementation details, not behavior | Test outcomes, not internal state |

### Type 4: Coverage Regression

| Scenario | Detection | Impact |
|----------|-----------|--------|
| **Coverage drop > 5%** | Significant code added without test | Blocks merge (enterprise settings) |
| **Critical path uncovered** | Payment/auth code unvisited by tests | Blocks merge (always) |
| **Branch coverage missing** | if/else but only one branch tested | Flag as incomplete test |

## Execution Steps

1. **Parse test file structure**
   - Identify test framework (Jest, Mocha, unittest, pytest)
   - Extract test function names and coverage targets
   - Map test file to source file

2. **Diff against test files**
   - For each added function in source, check for new test
   - For each modified function, check if test was updated
   - Calculate coverage delta

3. **Identify test gaps**
   - Added logic > 10 LOC without test → HIGH
   - Changed critical path without regression test → HIGH
   - Removed old test that covered behavior → MEDIUM
   - Unused test imports in test file → LOW

4. **Suggest test cases**
   - Happy path (success scenario)
   - Error cases (invalid input, exception thrown)
   - Edge cases (null, empty, boundary values)
   - Idempotency (if applicable)

5. **Estimate coverage impact**
   - Calculate current coverage percentage
   - Estimate coverage if gaps are filled vs. left untested
   - Flag if coverage regression > 5%

## Example: Real Test Gap

**Modified Source Code:**
```typescript
// src/payment/refund.ts
export async function refundOrder(orderId: string, amount: number): Promise<boolean> {
  const order = await db.orders.findById(orderId);
  if (!order) throw new Error('Order not found');
  
  if (amount > order.total) {
    throw new Error('Refund exceeds order total');
  }
  
  // NEW CODE - no test coverage
  if (order.status === 'refunded') {
    return true; // idempotent
  }
  
  const result = await paymentGateway.refund(order.paymentId, amount);
  if (result.success) {
    await db.orders.update(orderId, { status: 'refunded' });
    return true;
  }
  return false;
}
```

**Test File Analysis:**
```typescript
// tests/payment.test.ts
describe('refundOrder', () => {
  it('should refund valid order', async () => {
    const result = await refundOrder('order-123', 100);
    expect(result).toBe(true);
  });
  
  it('should throw on order not found', async () => {
    await expect(refundOrder('invalid', 100)).rejects.toThrow();
  });
  
  // MISSING: test for refundOrder on already refunded order (idempotency)
  // MISSING: test for partial refund
  // MISSING: test for refund > order total
});
```

**Detected Gap:**
```json
{
  "type": "modified_logic_untested",
  "severity": "HIGH",
  "message": "Idempotency check added (line 12) but no test for refunding already-refunded order",
  "suggested_test_cases": [
    "refundOrder on already refunded order - should return true",
    "refundOrder with partial amount - should update balance",
    "refundOrder with amount > total - should throw error"
  ]
}
```

## Success Criteria

✓ All new functions > 10 LOC flagged if untested
✓ Coverage regression calculated accurately
✓ Test gap suggestions are specific and actionable
✓ Critical path (auth, payment) gaps detected with 100% accuracy
✓ False positives < 5% (some code legitimately doesn't need tests)
✓ Execution time < 2 seconds for typical PR
