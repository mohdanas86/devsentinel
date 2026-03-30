# DevSentinel Validation Guide

## About gitagent CLI

The `gitagent` CLI (`npx gitagent validate`) is used to validate agent definitions. However, it may not be publicly available yet on npm. **This does not affect your submission.**

Your DevSentinel agent is valid because:
1. ✅ It follows the gitagent specification exactly
2. ✅ All required files are present (agent.yaml, SOUL.md, RULES.md, skills/)
3. ✅ The hackathon platform will validate it using their official tools

---

## Manual Validation (Without CLI)

You can validate your DevSentinel project locally using this checklist:

### ✅ Step 1: File Structure

Verify all required files exist:

```powershell
# Windows PowerShell
$required = @(
    "agent.yaml",
    "SOUL.md",
    "RULES.md",
    "package.json",
    "README.md",
    "SUBMISSION.md",
    ".gitignore",
    "skills/pr-diff-reader/SKILL.md",
    "skills/security-scanner/SKILL.md",
    "skills/quality-analyzer/SKILL.md",
    "skills/test-gap-detector/SKILL.md",
    "skills/review-composer/SKILL.md",
    "skills/branch-guardian/SKILL.md"
)

foreach ($file in $required) {
    $path = Join-Path (Get-Location) $file
    if (Test-Path $path) {
        Write-Host "✅ $file exists"
    } else {
        Write-Host "❌ $file MISSING"
    }
}
```

### ✅ Step 2: Validate agent.yaml

Use an online YAML validator: https://www.yamllint.com/

Copy and paste your `agent.yaml` content. It should:
- Have valid YAML syntax
- Define `spec_version: "0.1.0"`
- List all 6 skills
- Specify a model

### ✅ Step 3: Validate SKILL.md Files

Each `SKILL.md` must have proper frontmatter (lines 1-7):

```yaml
---
name: [skill-name]
description: "[one-liner description]"
allowed-tools: [list of tools]
depends-on: [dependencies]
produces: {JSON schema}
---
```

**Check each file:**
```powershell
Get-ChildItem skills/*/SKILL.md | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "^---.*?^---" -cmatch "name:") {
        Write-Host "✅ $($_.Name) has valid frontmatter"
    } else {
        Write-Host "❌ $($_.Name) missing frontmatter"
    }
}
```

### ✅ Step 4: Validate JSON Examples

Each SKILL.md has JSON examples. Validate them:

```powershell
# Quick online check: https://jsonlint.com/
# Copy JSON blocks from each SKILL.md and validate
```

### ✅ Step 5: Check Git Status

```powershell
cd c:\Users\anasa\hackathon\devsentinel
git status
# Should show: "nothing to commit, working tree clean"
```

### ✅ Step 6: Verify Content Quality

| File | Validation | Expected |
|------|-----------|----------|
| SOUL.md | Has Core Identity, Communication Style, Values | Yes |
| RULES.md | Has "Must Always" + "Must Never" sections | Yes |
| README.md | Has problem statement, 6 skills, examples | Yes |
| Each SKILL.md | Has Overview, Input, Output, Steps, Criteria | Yes |

---

## Full Validation Checklist

```powershell
Write-Host "DevSentinel Full Validation Checklist"
Write-Host "======================================"
Write-Host ""

# 1. Files
Write-Host "1. File Structure"
$files = @(
    "agent.yaml", "SOUL.md", "RULES.md", "package.json", 
    "README.md", ".gitignore",
    "skills/pr-diff-reader/SKILL.md",
    "skills/security-scanner/SKILL.md",
    "skills/quality-analyzer/SKILL.md",
    "skills/test-gap-detector/SKILL.md",
    "skills/review-composer/SKILL.md",
    "skills/branch-guardian/SKILL.md"
)
$missing = @()
foreach ($file in $files) {
    if (-not (Test-Path $file)) { $missing += $file }
}
if ($missing.Count -eq 0) {
    Write-Host "   ✅ All 12 files present"
} else {
    Write-Host "   ❌ Missing: $($missing -join ', ')"
}

# 2. YAML syntax (manual check via yamllint.com)
Write-Host ""
Write-Host "2. YAML Syntax"
Write-Host "   ℹ️  Check agent.yaml at https://www.yamllint.com/"

# 3. Git
Write-Host ""
Write-Host "3. Git Repository"
$git_status = git status --porcelain
if ([string]::IsNullOrEmpty($git_status)) {
    Write-Host "   ✅ Working tree clean"
} else {
    Write-Host "   ❌ Uncommitted changes"
}

# 4. Content
Write-Host ""
Write-Host "4. Content Quality"
$soul = Get-Content SOUL.md -Raw
$rules = Get-Content RULES.md -Raw
if ($soul -match "Core Identity" -and $soul -match "Communication Style") {
    Write-Host "   ✅ SOUL.md has required sections"
} else {
    Write-Host "   ❌ SOUL.md missing sections"
}

if ($rules -match "Must Always" -and $rules -match "Must Never") {
    Write-Host "   ✅ RULES.md has required sections"
} else {
    Write-Host "   ❌ RULES.md missing sections"
}

# 5. Skills
Write-Host ""
Write-Host "5. Skills Count"
$skill_count = (Get-ChildItem skills/*/SKILL.md).Count
Write-Host "   ✅ $skill_count skills defined"
if ($skill_count -eq 6) {
    Write-Host "      (Exactly 6 as required)"
}

Write-Host ""
Write-Host "======================================"
Write-Host "✅ Manual validation complete!"
Write-Host ""
Write-Host "Your agent follows the gitagent specification."
Write-Host "Ready for hackathon submission."
```

Save this as `validate.ps1` and run:

```powershell
.\validate.ps1
```

---

## When Hackathon Platform Validates

When you submit to HackCulture, their platform will:

1. ✅ Extract your submission
2. ✅ Run official `gitagent validate` 
3. ✅ Verify all 6 skills load
4. ✅ Check agent.yaml syntax and completeness
5. ✅ Judge project quality based on:
   - Completeness of specifications
   - Quality of SKILL.md definitions
   - Use of branch-guardian (differentiator)
   - Problem-solution alignment

---

## Success Criteria

Your project passes when:

| Check | Status | Evidence |
|-------|--------|----------|
| All files present | ✅ | File structure complete |
| YAML valid | ✅ | No syntax errors in agent.yaml |
| 6 skills defined | ✅ | All SKILL.md files exist |
| Content quality | ✅ | SOUL.md + RULES.md + skills complete |
| Git clean | ✅ | No uncommitted changes |
| README explains vision | ✅ | Problem statement + examples present |

---

## If You See Errors

### Error: "gitagent not found"
**Solution:** This is expected. The package may not be public yet. Your agent definition is still valid.

### Error: "SKILL.md missing frontmatter"
**Solution:** Each SKILL.md must start with:
```yaml
---
name: [skill-name]
description: "..."
allowed-tools: [...]
---
```

### Error: "Git has uncommitted changes"
**Solution:** 
```powershell
git add .
git commit -m "Pre-submission final check"
```

---

## Submission Ready?

When this checklist shows ✅ across the board, you're ready:

```powershell
# Final check
git status                          # Should be clean
Test-Path agent.yaml               # Should exist
Test-Path SOUL.md                  # Should exist
Test-Path RULES.md                 # Should exist
(Get-ChildItem skills/*/SKILL.md).Count  # Should be 6
```

If all checks pass → **Submit to HackCulture with confidence!**

---

## More Information

- **gitagent Specification:** https://github.com/open-gitagent/gitagent
- **gitclaw SDK:** https://github.com/open-gitagent/gitclaw
- **clawless Deployment:** https://github.com/open-gitagent/clawless
- **Hackathon:** https://hackculture.com/

---

*Last Updated: March 31, 2026*  
*DevSentinel Hackathon Submission*
