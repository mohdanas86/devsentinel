---
name: quality-analyzer
description: "Analyzes code quality: complexity, readability, maintainability, anti-patterns, unused variables, dead code, and architectural violations"
allowed-tools: [Read, Bash]
depends-on: [pr-diff-reader]
produces: {
  quality_issues: "array of maintainability findings",
  complexity_metrics: "cyclomatic and cognitive complexity",
  anti_patterns: "identified design issues"
}
---

# Quality Analyzer

## Overview

The Quality Analyzer reviews code for maintainability, readability, and architectural health. Unlike security scanner (which blocks), these findings are recommendations to improve long-term code quality.

## Input

```json
{
  "diff_summary": "from pr-diff-reader",
  "files_to_analyze": [
    {
      "path": "src/services/paymentProcessor.ts",
      "language": "typescript",
      "content": "..."
    }
  ]
}
```

## Output

```json
{
  "findings": [
    {
      "severity": "HIGH",
      "category": "complexity",
      "file": "src/utils/validator.ts",
      "line": 12,
      "message": "Function 'validatePayment' has cyclomatic complexity of 14 (threshold: 8)",
      "metric_value": 14,
      "metric_threshold": 8,
      "suggestion": "Extract conditional logic into smaller helper functions or use a lookup table",
      "refactor_effort": "medium"
    },
    {
      "severity": "MEDIUM",
      "category": "dead_code",
      "file": "src/auth/session.ts",
      "line": 89,
      "message": "Variable 'tempToken' is assigned but never read",
      "suggestion": "Remove unused variable or if intentional, add explanatory comment"
    }
  ],
  "summary": {
    "total_issues": 5,
    "by_category": {
      "complexity": 2,
      "dead_code": 1,
      "anti_pattern": 1,
      "type_safety": 1
    },
    "average_complexity": 9.2,
    "maintainability_score": 72
  }
}
```

## Quality Patterns

### Complexity Issues

| Pattern | Detection | Concern | Threshold |
|---------|-----------|---------|-----------|
| **High Cyclomatic Complexity** | Count branches (if/else, switch case, &&, \|\|) | Hard to test, high bug rate | > 8 |
| **Cognitive Complexity** | Measure mental load (nesting depth, branching patterns) | Difficult to understand logic | > 15 |
| **Long Functions** | Line count of single function | Likely doing multiple things | > 200 LOC |
| **Deep Nesting** | Max nesting depth | Reduces readability exponentially | > 4 levels |
| **Parameter Count** | Function parameters | Hard to call, likely violates SRP | > 5 params |

### Anti-Patterns

| Pattern | Detection | Why Bad | Remediation |
|---------|-----------|--------|-------------|
| **Magic Numbers** | Literal numbers in code without explanation | Where did 4.99 come from? Tax rate? | Extract to named constant with comment |
| **God Object** | Single class/module > 500 LOC | Violates SRP, hard to test | Split into focused modules |
| **Callback Hell** | Nested callbacks > 3 levels | Difficult to read, error handling gaps | Use promises or async/await |
| **Temporal Coupling** | Function calls must happen in specific order but not enforced | Easy to call in wrong order | Return state, enforce order with types |
| **Duplicated Logic** | Same pattern repeated 3+ times | Bug fix in one place doesn't fix others | Extract to shared function |
| **Hardcoded Config** | Values embedded in code | Can't change per environment | Move to config/env files |

### Dead Code

| Pattern | Detection | Issue | Action |
|---------|-----------|-------|--------|
| **Unused Variables** | Assigned but never read | Confuses readers, wastes memory | Remove it |
| **Unused Parameters** | Function parameter never used | May indicate incomplete implementation | Remove or add `_` prefix if intentional |
| **Dead Branches** | Unreachable code after return | Likely leftover from refactoring | Delete |
| **Unused Imports** | Module imported but not referenced | Increases bundle size, confuses readers | Remove |
| **TODO/FIXME** | Comments without context or owner | Often forgotten, becomes technical debt | Resolve or move to issue tracker |

### Type Safety (TypeScript/Java)

| Pattern | Detection | Risk | Fix |
|---------|-----------|------|-----|
| **Implicit `any`** | Type not specified | Defeats purpose of static typing | Add explicit type annotation |
| **Non-nullish Coalescing** | Accessing property without null check | May crash at runtime | Use optional chaining `?.` |
| **Type Assertion Overuse** | Frequent `as Type` or type casting | Often masks real type issues | Fix underlying type problem |
| **Union Type Narrowing** | Unchecked discriminated unions | Runtime errors when type incorrect | Add type guard check |

## Execution Steps

1. **Parse code into AST**
   - Language-specific parsing (TypeScript/JavaScript, Python, Java, Go)
   - Extract function definitions, control flow, assignments

2. **Calculate metrics**
   - Cyclomatic complexity: count decision points
   - Cognitive complexity: weight by nesting depth
   - Function length: count LOC
   - Parameter count: count function parameters

3. **Detect patterns**
   - Match against anti-pattern library
   - Check for unused variables, imports
   - Identify dead code branches

4. **Score severity**
   - HIGH: Blocks understanding or testing (complexity > 10)
   - MEDIUM: Reduces code quality (unused variable, magic number)
   - LOW: Style suggestion (comment formatting)

5. **Generate suggestions**
   - Provide specific refactor examples
   - Estimate effort (small/medium/large)
   - Reference design patterns when applicable

## Example: Real Complexity Detection

**Input Code:**
```typescript
function processOrder(order, user, warehouse, paymentMethod) {
  if (!order) return null;
  if (!user) throw new Error('No user');
  
  let total = order.items.reduce((sum, item) => {
    if (item.discount && user.isPremium) {
      if (item.discountExpired) return sum;
      else return sum + (item.price * (1 - item.discount));
    } else if (!user.isPremium && item.requiresPremium) {
      return sum;
    } else if (paymentMethod === 'CRYPTO') {
      return sum + (item.price * 1.05);
    } else if (paymentMethod === 'CC' && item.ccFee) {
      return sum + (item.price * 1.02);
    } else {
      return sum + item.price;
    }
  }, 0);
  
  if (warehouse.hasStock(order.items)) {
    if (total > user.creditLimit && paymentMethod === 'CC') {
      return false;
    } else if (total > user.wallet && paymentMethod === 'WALLET') {
      return false;
    }
    warehouse.reserve(order.items);
    return true;
  }
  return false;
}
```

**Detected Output:**
```json
{
  "severity": "HIGH",
  "category": "complexity",
  "message": "Function 'processOrder' has cyclomatic complexity of 16 (threshold: 8)",
  "complexity_breakdown": {
    "cyclomatic": 16,
    "cognitive": 18,
    "nesting_depth": 4
  },
  "suggestion": "Split into smaller functions:\n1. calculateTotal(order, user, paymentMethod)\n2. validatePayment(user, total, paymentMethod)\n3. reserveStock(warehouse, order)\n\nThis reduces complexity and improves testability.",
  "refactor_effort": "medium"
}
```

## Success Criteria

✓ Complexity calculations accurate vs. tools like SonarQube
✓ Anti-patterns caught with < 10% false positive rate
✓ Suggestions are actionable and specific
✓ Dead code detection has high accuracy
✓ Maintainability score provides useful trend data
✓ Execution time < 3 seconds per 50-file review
