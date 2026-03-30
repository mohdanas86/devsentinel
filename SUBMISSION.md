# DevSentinel: Hackathon Submission Guide

## 📬 Submission Checklist

Before you submit your DevSentinel project to the GitAgent Hackathon, verify **every** item below. Incomplete submissions may be disqualified.

---

## ✅ Agent Validation

### 1. Validate Agent Structure
```bash
cd devsentinel
npx gitagent validate
```
**Expected Output:**
```
✅ agent.yaml is valid
✅ 6 skills found and valid
✅ SOUL.md present
✅ RULES.md present
✅ spec_version 0.1.0 supported
```

**If validation fails:**
- Check `agent.yaml` YAML syntax (https://www.yamllint.com/)
- Ensure all skill paths in `agent.yaml` match actual directories
- Verify each `SKILL.md` has valid YAML frontmatter (---...---)

### 2. Check Agent Info
```bash
npx gitagent info
```
**Expected Output:**
```
Agent: devsentinel
Version: 0.1.0
Model: claude-sonnet-4-5-20250929
Skills: 6
  • pr-diff-reader
  • security-scanner
  • quality-analyzer
  • test-gap-detector
  • review-composer
  • branch-guardian
```

---

## ✅ File Structure

Verify your repo contains **exactly** these files:

```
devsentinel/
├── agent.yaml                                    ✅
├── SOUL.md                                       ✅
├── RULES.md                                      ✅
├── package.json                                  ✅
├── .gitignore                                    ✅
├── README.md                                     ✅
├── SUBMISSION.md (this file)                    ✅
├── skills/
│   ├── pr-diff-reader/SKILL.md                  ✅
│   ├── security-scanner/SKILL.md                ✅
│   ├── quality-analyzer/SKILL.md                ✅
│   ├── test-gap-detector/SKILL.md               ✅
│   ├── review-composer/SKILL.md                 ✅
│   └── branch-guardian/SKILL.md                 ✅
└── tools/                                        (optional)
```

**Run this to verify:**
```bash
ls -la agent.yaml SOUL.md RULES.md package.json README.md
ls -la skills/*/SKILL.md
# All files should exist with proper content
```

---

## ✅ Content Verification

### agent.yaml
- [ ] `spec_version: "0.1.0"`
- [ ] `name: devsentinel`
- [ ] `model.preferred: claude-sonnet-4-5-20250929`
- [ ] All 6 skills listed:
  - `pr-diff-reader`
  - `security-scanner`
  - `quality-analyzer`
  - `test-gap-detector`
  - `review-composer`
  - `branch-guardian`
- [ ] `metadata.github_integration: true`
- [ ] `metadata.branch_promotion_enabled: true`

### SOUL.md
- [ ] Has "## Core Identity" section
- [ ] Describes role and expertise
- [ ] Has "## Communication Style" section
- [ ] Has "## Values" section (at least 3 values)
- [ ] Total length: 150-300 words (reasonable agent personality)

### RULES.md
- [ ] Has "## Must Always" section (at least 3 rules)
- [ ] Has "## Must Never" section (at least 3 rules)
- [ ] Enforces security-first mentality
- [ ] Enforces test coverage on critical paths
- [ ] Enforces branch promotion gates

### package.json
- [ ] `"type": "module"` (ES modules)
- [ ] Contains `"gitclaw"` in dependencies
- [ ] Contains `"gitagent"` in devDependencies
- [ ] Scripts include `"validate": "gitagent validate"`

### README.md
- [ ] Explains the problem DevSentinel solves
- [ ] Lists all 6 skills with descriptions
- [ ] Contains quick start instructions
- [ ] Includes a real-world example
- [ ] Mentions branch-guardian (branch promotion differentiator)
- [ ] Explains how to test locally
- [ ] References gitagent, gitclaw, clawless

### Each SKILL.md File
- [ ] Has YAML frontmatter:
  ```yaml
  ---
  name: [skill-name]
  description: "[one-liner]"
  allowed-tools: [Read, Bash, Write, etc.]
  depends-on: [other-skills if applicable]
  produces: {JSON output schema}
  ---
  ```
- [ ] Has "## Overview" section
- [ ] Has "## Input" section with JSON example
- [ ] Has "## Output" section with JSON example
- [ ] Has "## Execution Steps" (numbered list)
- [ ] Has "## Success Criteria" (checklist)
- [ ] Total length per skill: 300-500 words (detailed but focused)

---

## ✅ Git Repository Setup

### Initialize Git
```bash
cd devsentinel
git init
git add .
git commit -m "Initial DevSentinel submission"
git log
# Should show at least 1 commit
```

### Verify Git Status
```bash
git status
# Must output: "working tree clean"
# (no uncommitted changes)
```

### Add Remote (Optional, for personal repo)
```bash
# If hosting on GitHub
git remote add origin https://github.com/YOUR_HANDLE/devsentinel.git
```

---

## ✅ Code Quality Checks

### No Syntax Errors
```bash
# Check YAML syntax
yamllint agent.yaml
# (or use https://www.yamllint.com/)

# Check JSON syntax in SKILL.md examples
# (manually review JSON blocks in each SKILL.md)
```

### No Debug Code
- [ ] No `console.log()` in SKILL.md instructions
- [ ] No `// TODO` or `// FIXME` comments in agent definition
- [ ] No placeholder text like `[FIXME]` or `INSERT HERE`

### Consistency Checks
- [ ] All skill names lowercase with hyphens (pr-diff-reader, not PRDiffReader)
- [ ] All JSON examples are valid JSON (test with `JSON.parse()`)
- [ ] File paths use forward slashes `/` consistently

---

## ✅ Hackathon Brief Alignment

### Core Requirements
- [ ] **Agent lives in git repo**: ✅ SOUL.md + RULES.md + skills/ structure
- [ ] **Defined in gitagent format**: ✅ agent.yaml + SKILL.md files
- [ ] **Uses gitagent standard**: ✅ Validates with `npx gitagent validate`
- [ ] **Runs with gitclaw**: ✅ Documented in README
- [ ] **Deploys with clawless**: ✅ Optional but mentioned

### Differentiator Features (Branch Promotion)
- [ ] **branch-guardian skill exists**: ✅ Enforces dev→staging→main
- [ ] **Uses git-native power**: ✅ Branch promotion is core feature
- [ ] **Not just API-wrapped LLM**: ✅ Pattern-based decisions with structured gates

---

## ✅ Documentation

### README Structure
- [ ] Problem statement (top of README)
- [ ] What DevSentinel does (6 skills overview)
- [ ] Project structure diagram
- [ ] Quick start section
- [ ] Real-world example (input + output)
- [ ] How to use with gitclaw
- [ ] Why this wins hackathon
- [ ] Submission checklist
- [ ] Resources/links

### SUBMISSION.md (This File)
- [ ] Comprehensive pre-submission checklist
- [ ] Validation commands
- [ ] Alignment with hackathon brief
- [ ] Archive instructions

---

## ✅ Final Pre-Submission

Run this complete verification script:

```bash
#!/bin/bash
set -e

echo "🔍 DevSentinel Pre-Submission Verification"
echo "=========================================="

echo "1. Checking agent structure..."
npx gitagent validate
echo "   ✅ Agent is valid"

echo "2. Checking file structure..."
files=(
  "agent.yaml"
  "SOUL.md"
  "RULES.md"
  "package.json"
  "README.md"
  ".gitignore"
  "skills/pr-diff-reader/SKILL.md"
  "skills/security-scanner/SKILL.md"
  "skills/quality-analyzer/SKILL.md"
  "skills/test-gap-detector/SKILL.md"
  "skills/review-composer/SKILL.md"
  "skills/branch-guardian/SKILL.md"
)
for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "   ❌ Missing: $file"
    exit 1
  fi
done
echo "   ✅ All files present"

echo "3. Checking git status..."
if [ -z "$(git status --porcelain)" ]; then
  echo "   ✅ Git working tree clean"
else
  echo "   ❌ Uncommitted changes. Run: git add . && git commit -m 'Final'"
  exit 1
fi

echo "4. Checking content..."
grep -q "branch-guardian" README.md && echo "   ✅ README mentions branch promotion" || echo "   ❌ README missing branch-guardian mention"
grep -q "OWASP\|CWE" skills/security-scanner/SKILL.md && echo "   ✅ Security scanner references standards" || echo "   ❌ Security scanner missing standard refs"
grep -q "dev.*staging.*main" skills/branch-guardian/SKILL.md && echo "   ✅ Branch guardian defines promotion path" || echo "   ❌ Branch guardian missing promotion logic"

echo ""
echo "✅ All pre-submission checks passed!"
echo "Ready for hackathon submission."
```

Save as `verify.sh`, run:
```bash
chmod +x verify.sh
./verify.sh
```

---

## 📦 Submission Format

### Prepare for Submission

1. **Archive your project:**
   ```bash
   cd ..
   tar -czf devsentinel-submission.tar.gz devsentinel/
   # or
   zip -r devsentinel-submission.zip devsentinel/
   ```

2. **Create submission README:**
   ```markdown
   # DevSentinel Hackathon Submission
   
   **Team:** [Your Name]
   **Submission Date:** [Date]
   **Agent Name:** DevSentinel
   
   ## Quick Links
   - Agent: devsentinel/agent.yaml
   - Identity: devsentinel/SOUL.md
   - Rules: devsentinel/RULES.md
   - Skills: devsentinel/skills/ (6 skills)
   
   ## To Run
   ```bash
   cd devsentinel
   npm install
   npx gitagent validate
   ```
   
   ## Key Features
   - 6 specialized skills for code review
   - Security-first vulnerability detection
   - Test coverage enforcement
   - Branch promotion gating (dev→staging→main)
   - Production-ready quality checks
   ```

3. **Include all files:**
   - devsentinel/ (complete project)
   - SUBMISSION.md (this file)
   - verification-report.txt (output from verify.sh)

---

## 🎯 Submission Locations

**HackCulture Platform:**
1. Go to: https://hackculture.com/my-events/
2. Click: GitAgent Hackathon
3. Go to: Submissions → All Submission Phases
4. Click: Submit
5. Upload: devsentinel-submission.tar.gz or .zip

**Submission Form Fields:**
- **Agent Name:** DevSentinel
- **Description:** AI-powered principal-level code reviewer with security gating and branch promotion
- **Git Repo URL:** (if hosting publicly)
- **Submission Files:** (upload archive)
- **README:** (paste content or upload)

---

## ✅ Post-Submission Verification

After submitting, verify the platform received your files:

1. Check submission status shows "Submitted"
2. Download your submission and verify files are intact
3. Run verification locally:
   ```bash
   tar -xzf devsentinel-submission.tar.gz
   cd devsentinel
   npx gitagent validate
   ```

---

## 🏆 Judging Criteria (Mapped to Your Submission)

| Criterion                 | How DevSentinel Meets It          | Evidence                                 |
| ------------------------- | --------------------------------- | ---------------------------------------- |
| **Fits gitagent format**  | Uses SOUL.md, RULES.md, skills/   | agent.yaml + 6 SKILL.md files            |
| **Solves real problem**   | Code review bottleneck            | README problem statement                 |
| **Uses branch promotion** | dev→staging→main gating           | branch-guardian skill                    |
| **Code quality**          | Clear, detailed, production-ready | All SKILL.md files specify I/O and logic |
| **Validates cleanly**     | Passes `npx gitagent validate`    | No errors in submission                  |
| **Explains vision**       | Clear identity and purpose        | SOUL.md + README                         |
| **Enterprise-ready**      | Security, tests, compliance       | Specific CWE/OWASP references            |

---

## ❓ FAQ

**Q: Can I make changes after submission?**
A: Check platform rules. Usually you can resubmit before deadline.

**Q: What if `npx gitagent validate` fails?**
A: Fix the error, commit to git, and resubmit. Common issues:
- Duplicate skill names
- Invalid YAML syntax in agent.yaml
- Missing or malformed SKILL.md frontmatter

**Q: Should I deploy with clawless?**
A: Not required, but it's a differentiator. If included, show it works in README.

**Q: Do I need actual GitHub integration to work?**
A: No. Hackathon judges will evaluate the agent definition (SOUL.md + RULES.md + skills/). Live GitHub integration is a "nice to have" demo, not a requirement.

**Q: Can I add more than 6 skills?**
A: Technically yes, but 6 is focused and complete. Adding more risks incomplete execution before the April 3 deadline.

---

## 📞 Troubleshooting

### Error: "agent.yaml not found"
```bash
# Make sure you're in the right directory
pwd  # should end in /devsentinel
ls agent.yaml  # should exist
```

### Error: "spec_version not supported"
- Update `agent.yaml`: `spec_version: "0.1.0"`

### Error: "Skill not found: pr-diff-reader"
- Verify directory structure:
  ```bash
  ls skills/pr-diff-reader/SKILL.md
  # Must exist exactly at this path
  ```

### Validation passes but skills aren't loading
- Check YAML frontmatter in each SKILL.md:
  ```yaml
  ---
  name: pr-diff-reader
  description: "..."
  allowed-tools: [Read, Bash]
  ---
  ```

---

## 🚀 You're Ready!

When you see **all green checkmarks** from the verification script, you're ready to submit.

**Submission URL:** https://hackculture.com/submissions

**Deadline:** April 3, 2026, 11:59 PM UTC

**Good luck! 🎉**

---

*Last Updated: March 31, 2026*
*DevSentinel Hackathon Team*
