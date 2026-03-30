---
name: pr-diff-reader
description: "Extracts and analyzes PR diff to identify changed files, modified functions, added dependencies, and context for downstream analysis"
allowed-tools: [Read, Bash]
depends-on: []
produces: {
  diff_summary: "structured diff analysis",
  files_changed: ["list of modified files"],
  changes_by_type: "categorized changes (added, modified, deleted, refactored)",
  language_context: "language tags for each file"
}
---

# PR Diff Reader

## Overview

The PR Diff Reader skill is the first stage of analysis. It reads the raw PR diff and extracts structured information about what changed, enabling downstream skills to focus on semantics rather than parsing.

## Input

```json
{
  "pr_diff": "unified diff format (from `gh pr diff`)",
  "repo_context": {
    "owner": "string",
    "repo": "string",
    "pr_number": "number"
  }
}
```

## Output

```json
{
  "pr_id": "owner/repo/PR-123",
  "files_changed": [
    {
      "path": "src/auth/tokenManager.ts",
      "status": "modified",
      "additions": 45,
      "deletions": 12,
      "hunks": [
        {
          "line_start": 123,
          "line_count": 15,
          "before": "...",
          "after": "..."
        }
      ],
      "language": "typescript",
      "is_test": false
    }
  ],
  "summary": {
    "total_files": 5,
    "total_additions": 230,
    "total_deletions": 58,
    "test_file_ratio": 0.4,
    "primary_languages": ["typescript", "json"],
    "dependency_changes": ["added: lodash@4.17.21", "removed: moment"],
    "lines_of_logic_changed": 172
  },
  "risk_indicators": {
    "large_diff": false,
    "touches_sensitive_paths": ["src/auth/*", "src/database/*"],
    "dependency_changes": true,
    "test_coverage_changed": false
  }
}
```

## Execution Steps

1. **Parse the unified diff**
   - Split by file headers (`--- a/file` and `+++ b/file`)
   - Extract hunk headers with line numbers
   - Preserve before/after content for context

2. **Categorize changes**
   - Identify added, modified, and deleted files
   - Flag refactored code (large moves with small edits)
   - Detect dependency changes (package.json, requirements.txt, Gemfile)

3. **Extract language information**
   - Map file extensions to language contexts
   - Flag polyglot repositories for downstream analysis

4. **Calculate metrics**
   - Count additions, deletions, and logical changes
   - Identify test vs. source file ratio
   - Flag sensitive path modifications

5. **Detect risk indicators**
   - Large diffs (>500 LOC changes) increase review risk
   - Modifications to auth, database, or payment paths require deeper checks
   - Dependency changes always need security audit

## Error Handling

- **Invalid diff format**: Log parsing error, return empty file list
- **Empty diff**: Return zero files changed summary
- **Encoding issues**: Attempt UTF-8 recovery, flag suspicious characters

## Example: Real Diff Parsing

```diff
--- a/src/auth/tokenManager.ts
+++ b/src/auth/tokenManager.ts
@@ -18,7 +18,12 @@
 export function validateToken(token: string): boolean {
-  return token.length > 0;
+  const parts = token.split('.');
+  if (parts.length !== 3) return false;
+  
+  try {
+    return verifySignature(parts[2]);
+  } catch {
+    return false;
+  }
 }
```

**Extracted Output:**
```json
{
  "path": "src/auth/tokenManager.ts",
  "status": "modified",
  "additions": 7,
  "deletions": 1,
  "language": "typescript",
  "is_test": false,
  "hunks": [{
    "line_start": 18,
    "before": "return token.length > 0;",
    "after": "const parts = token.split('.');\nif (parts.length !== 3) return false;\n\ntry {\n  return verifySignature(parts[2]);\n} catch {\n  return false;\n}"
  }]
}
```

## Success Criteria

✓ All files in diff are accurately parsed
✓ Line numbers and hunks preserved exactly
✓ Risk indicators correctly identified
✓ Language detection accurate
✓ Dependency changes clearly flagged
✓ Execution time < 2 seconds for typical PR (< 500 files)
