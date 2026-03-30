#!/usr/bin/env node

/**
 * DevSentinel Demo Simulator
 * 
 * Simulates DevSentinel agent execution on a sample PR
 * Shows all 6 skills in action with real review output
 * 
 * Run: node demo.cjs
 */

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);
const section = (title) => {
    console.log('\n' + '='.repeat(80));
    log(title, 'bright');
    console.log('='.repeat(80) + '\n');
};

// Sample PR Diff - contains a security vulnerability
const SAMPLE_PR_DIFF = `
--- a/src/database/users.ts
+++ b/src/database/users.ts
@@ -10,7 +10,15 @@
 export async function getUser(userId: string): Promise<User | null> {
-  const user = db.query(\`SELECT * FROM users WHERE id = '\${userId}'\`);
+  const parts = userId.split('.');
+  if (parts.length !== 3) return null;
+  
+  // Get user from database
+  const query = \`SELECT * FROM users WHERE id = \${userId}\`;
+  const user = await db.query(query);
+  if (!user) {
+    return null;
+  }
   return user;
 }

--- a/src/payment/refund.ts
+++ b/src/payment/refund.ts
@@ -0,0 +1,34 @@
+export async function refundOrder(orderId, amount) {
+  const order = await db.query(\`SELECT * FROM orders WHERE id = \${orderId}\`);
+  if (!order) throw new Error('Not found');
+  
+  if (amount > order.total) {
+    throw new Error('Amount exceeds total');
+  }
+  
+  const result = await paymentGateway.refund(order.paymentId, amount);
+  if (result.success) {
+    await db.orders.update(orderId, { status: 'refunded' });
+  }
+  return result.success;
+}
`;

// ============================================================================
// SKILL 1: PR Diff Reader
// ============================================================================
function pr_diff_reader(diff) {
    log('\n[SKILL 1] PR Diff Reader', 'cyan');
    log('Parsing PR diff and extracting changes...\n', 'blue');

    const files = [];
    const lines = diff.split('\n');

    let currentFile = null;
    let additions = 0;
    let deletions = 0;

    for (const line of lines) {
        if (line.startsWith('--- a/')) {
            currentFile = line.replace('--- a/', '').trim();
        } else if (line.startsWith('+++')) {
            if (currentFile && !files.find(f => f.path === currentFile)) {
                files.push({
                    path: currentFile,
                    language: currentFile.endsWith('.ts') ? 'typescript' : 'javascript',
                    status: currentFile.includes('payment/refund') ? 'added' : 'modified',
                });
            }
        } else if (line.startsWith('+') && !line.startsWith('+++')) {
            additions++;
        } else if (line.startsWith('-') && !line.startsWith('---')) {
            deletions++;
        }
    }

    log(`✓ Files changed: ${files.length}`, 'green');
    files.forEach(f => {
        log(`  • ${f.path} (${f.status}, ${f.language})`, 'green');
    });
    log(`✓ Total changes: ${additions} additions, ${deletions} deletions\n`, 'green');

    return { files, additions, deletions };
}

// ============================================================================
// SKILL 2: Security Scanner
// ============================================================================
function security_scanner(diff) {
    log('\n[SKILL 2] Security Scanner', 'cyan');
    log('Scanning for OWASP vulnerabilities...\n', 'blue');

    const findings = [];

    // Check for SQL injection
    if (diff.includes('db.query(`SELECT') && diff.includes('SELECT * FROM users WHERE id = ${')) {
        findings.push({
            severity: 'CRITICAL',
            type: 'SQL_INJECTION',
            file: 'src/database/users.ts',
            line: 17,
            message: 'SQL query concatenates unsanitized user input (userId)',
            code: 'const query = `SELECT * FROM users WHERE id = ${userId}`;',
            cwe: 'CWE-89',
            owasp: 'A03:2021 – Injection',
            fix: "Use parameterized queries: db.query('SELECT * FROM users WHERE id = ?', [userId])",
        });
    }

    // Check for untested refund function
    if (diff.includes('export async function refundOrder')) {
        findings.push({
            severity: 'HIGH',
            type: 'MISSING_NULL_CHECK',
            file: 'src/payment/refund.ts',
            line: 2,
            message: 'Missing null/undefined check before accessing order properties',
            code: 'const order = await db.query(...); if (amount > order.total)',
            cwe: 'CWE-476',
            owasp: 'A06:2021 – Vulnerable and Outdated Components',
            fix: 'Add: if (!order) throw new Error("Order not found");',
        });
    }

    log(`⚠ CRITICAL findings: ${findings.filter(f => f.severity === 'CRITICAL').length}`, 'red');
    findings.forEach(f => {
        if (f.severity === 'CRITICAL') {
            log(`\n  🔴 ${f.type} (${f.cwe} / ${f.owasp})`, 'red');
            log(`     File: ${f.file}:${f.line}`, 'red');
            log(`     Issue: ${f.message}`, 'red');
            log(`     Fix: ${f.fix}`, 'yellow');
        }
    });

    log(`\n✓ HIGH findings: ${findings.filter(f => f.severity === 'HIGH').length}`, 'yellow');
    findings.forEach(f => {
        if (f.severity === 'HIGH') {
            log(`\n  🟠 ${f.type}`, 'yellow');
            log(`     File: ${f.file}:${f.line}`, 'yellow');
            log(`     Issue: ${f.message}`, 'yellow');
        }
    });

    return findings;
}

// ============================================================================
// SKILL 3: Quality Analyzer
// ============================================================================
function quality_analyzer(diff) {
    log('\n[SKILL 3] Quality Analyzer', 'cyan');
    log('Analyzing code quality and complexity...\n', 'blue');

    const issues = [];

    if (diff.includes('export async function refundOrder')) {
        issues.push({
            severity: 'MEDIUM',
            category: 'complexity',
            message: 'Function "refundOrder" has 4 branches (if/else), consider extracting logic',
            suggestion: 'Extract validateRefund() and processRefund() helpers',
        });
    }

    log(`Quality issues found: ${issues.length}`, 'yellow');
    issues.forEach(issue => {
        log(`  • ${issue.message}`, 'yellow');
        log(`    → ${issue.suggestion}`, 'blue');
    });

    log(`\n✓ Maintainability score: 72/100`, 'green');

    return issues;
}

// ============================================================================
// SKILL 4: Test Gap Detector
// ============================================================================
function test_gap_detector(diff) {
    log('\n[SKILL 4] Test Gap Detector', 'cyan');
    log('Checking test coverage...\n', 'blue');

    const gaps = [];

    if (diff.includes('export async function refundOrder(orderId, amount)')) {
        gaps.push({
            type: 'new_logic_untested',
            severity: 'HIGH',
            file: 'src/payment/refund.ts',
            function: 'refundOrder',
            message: '34 LOC function added with 0 tests',
            suggestedTests: [
                'Happy path: valid order, successful refund',
                'Error case: refund > order total',
                'Error case: order not found',
                'Idempotency: refunding already-refunded order',
            ],
        });
    }

    log(`Test gaps: ${gaps.length}`, 'yellow');
    gaps.forEach(gap => {
        log(`\n  ⚠ ${gap.message}`, 'yellow');
        log(`     Suggested test cases:`, 'blue');
        gap.suggestedTests.forEach(test => {
            log(`       • ${test}`, 'blue');
        });
    });

    return gaps;
}

// ============================================================================
// SKILL 5: Review Composer
// ============================================================================
function review_composer(securityFindings, qualityIssues, testGaps) {
    log('\n[SKILL 5] Review Composer', 'cyan');
    log('Synthesizing all findings into review decision...\n', 'blue');

    const criticalCount = securityFindings.filter(f => f.severity === 'CRITICAL').length;
    const highCount = securityFindings.filter(f => f.severity === 'HIGH').length +
        testGaps.filter(g => g.severity === 'HIGH').length;

    let verdict = 'APPROVED';
    let recommendation = 'APPROVE';

    if (criticalCount > 0) {
        verdict = 'BLOCKED';
        recommendation = 'FIX_AND_RESUBMIT';
    } else if (highCount > 0) {
        verdict = 'CHANGES_REQUESTED';
        recommendation = 'ADDRESS_FINDINGS';
    }

    log(`Verdict: ${verdict}`, verdict === 'BLOCKED' ? 'red' : verdict === 'CHANGES_REQUESTED' ? 'yellow' : 'green');
    log(`Recommendation: ${recommendation} (DevSentinel)\n`, 'cyan');

    if (criticalCount > 0) {
        log('CRITICAL FINDINGS BLOCK THIS PR:', 'red');
        securityFindings.filter(f => f.severity === 'CRITICAL').forEach(f => {
            log(`  • ${f.type}: ${f.message}`, 'red');
            log(`    → ${f.fix}`, 'yellow');
        });
    }

    if (highCount > 0) {
        log('\nHIGH PRIORITY FINDINGS:', 'yellow');
        [...securityFindings, ...testGaps].filter(f => f.severity === 'HIGH').forEach(f => {
            const msg = f.message || `${f.type}: ${f.function}`;
            log(`  • ${msg}`, 'yellow');
        });
    }

    if (qualityIssues.length > 0) {
        log('\nQUALITY SUGGESTIONS:', 'blue');
        qualityIssues.forEach(issue => {
            log(`  • ${issue.message}`, 'blue');
        });
    }

    log('\nNEXT STEPS:', 'cyan');
    if (criticalCount > 0) {
        log('  1. Fix SQL injection (use parameterized queries) - 5 min', 'yellow');
        log('  2. Add null checks on order object - 5 min', 'yellow');
        log('  3. Add 4 test cases for refund logic - 30 min', 'yellow');
        log('  4. Re-request review', 'yellow');
    }

    return { verdict, recommendation, criticalCount, highCount };
}

// ============================================================================
// SKILL 6: Branch Guardian
// ============================================================================
function branch_guardian(decision) {
    log('\n[SKILL 6] Branch Guardian', 'cyan');
    log('Determining branch promotion eligibility...\n', 'blue');

    const target_branch = 'staging'; // This PR targets staging
    const source_branch = 'feature/refunds';

    log(`Source: ${source_branch}`, 'blue');
    log(`Target: ${target_branch}`, 'blue');

    let promotion = 'HOLD';

    if (decision.verdict === 'BLOCKED') {
        log('\n🔴 PROMOTION BLOCKED', 'red');
        log('Reason: CRITICAL security findings must be fixed first', 'red');
        promotion = 'BLOCKED';
    } else if (decision.verdict === 'CHANGES_REQUESTED') {
        log('\n⏸️ PROMOTION HELD', 'yellow');
        log('Reason: HIGH findings must be addressed before merge', 'yellow');
        promotion = 'HOLD';
    } else {
        log('\n✅ PROMOTION ALLOWED', 'green');
        log('PR can merge to staging → staging can then promote to main', 'green');
        promotion = 'ALLOWED';
    }

    log('\nBranch Promotion Path:', 'cyan');
    log('  feature/refunds → staging (current)', 'blue');
    log('  staging → main (after staging validation)', 'blue');

    return { target_branch, source_branch, promotion };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
function main() {
    console.clear();

    section('🤖 DevSentinel - AI Code Reviewer Agent');
    log('Demonstrating all 6 skills on a sample PR with security vulnerability\n', 'bright');

    // Load agent identity
    log('Loading agent identity...', 'blue');
    log('Agent: DevSentinel', 'cyan');
    log('Role: Principal-level AI code reviewer', 'cyan');
    log('Model: Claude Sonnet 4.5', 'cyan');
    log('', 'reset');

    // Execute all 6 skills
    log('Executing 6 specialized skills:\n', 'bright');

    const diffAnalysis = pr_diff_reader(SAMPLE_PR_DIFF);
    const securityFindings = security_scanner(SAMPLE_PR_DIFF);
    const qualityIssues = quality_analyzer(SAMPLE_PR_DIFF);
    const testGaps = test_gap_detector(SAMPLE_PR_DIFF);
    const reviewDecision = review_composer(securityFindings, qualityIssues, testGaps);
    const promotionDecision = branch_guardian(reviewDecision);

    // Summary
    section('📋 FINAL REVIEW SUMMARY');

    log('✅ DevSentinel Code Review Complete\n', 'bright');

    log('What DevSentinel Detected:', 'cyan');
    log(`  • Security: ${securityFindings.length} finding(s)`, 'yellow');
    log(`    - ${securityFindings.filter(f => f.severity === 'CRITICAL').length} CRITICAL`, 'red');
    log(`    - ${securityFindings.filter(f => f.severity === 'HIGH').length} HIGH`, 'yellow');
    log(`  • Quality: ${qualityIssues.length} suggestion(s)`, 'yellow');
    log(`  • Test Coverage: ${testGaps.length} gap(s)`, 'yellow');

    log(`\nDecision: ${reviewDecision.verdict}`,
        reviewDecision.verdict === 'BLOCKED' ? 'red' :
            reviewDecision.verdict === 'CHANGES_REQUESTED' ? 'yellow' : 'green');

    log(`Branch Promotion: ${promotionDecision.promotion}`,
        promotionDecision.promotion === 'BLOCKED' ? 'red' :
            promotionDecision.promotion === 'HOLD' ? 'yellow' : 'green');

    section('ℹ️ About DevSentinel');

    log('DevSentinel is a GitAgent-based code reviewer with 6 specialized skills:\n', 'cyan');
    log('  1. PR Diff Reader        - Parses and structures PR changes', 'blue');
    log('  2. Security Scanner      - Detects OWASP vulnerabilities (CWE/OWASP refs)', 'blue');
    log('  3. Quality Analyzer      - Analyzes complexity and anti-patterns', 'blue');
    log('  4. Test Gap Detector     - Ensures test coverage', 'blue');
    log('  5. Review Composer       - Synthesizes findings into decisions', 'blue');
    log('  6. Branch Guardian       - Enforces dev→staging→main promotion ⭐', 'blue');

    log('\nDefault Model: Claude Sonnet 4.5', 'cyan');
    log('Framework: gitagent format (agent.yaml + SOUL.md + RULES.md + skills/)', 'cyan');
    log('Runtime: gitclaw SDK (optional serverless with clawless)', 'cyan');

    log('\nFor full documentation, see README.md in project root.\n', 'blue');

    log('════════════════════════════════════════════════════════════════════════════════\n', 'cyan');
}

// Run the demo
main();
