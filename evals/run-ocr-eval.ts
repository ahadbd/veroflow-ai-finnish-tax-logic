/**
 * VeroFlow AI — OCR Evaluation Script
 * 
 * Usage:
 *   npx tsx evals/run-ocr-eval.ts
 * 
 * Prerequisites:
 *   1. Add images to evals/images/
 *   2. Fill in evals/ground_truth.json with expected values
 *   3. Set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load env vars from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

const { performOCR } = await import('../lib/ocr-service.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, 'images');
const GROUND_TRUTH_PATH = path.join(__dirname, 'ground_truth.json');

interface GroundTruthEntry {
  file: string;
  type: 'shift' | 'receipt';
  expected: Record<string, any>;
}

interface EvalResult {
  file: string;
  type: string;
  passed: boolean;
  score: number;       // 0.0 – 1.0 per field
  details: Record<string, { expected: any; got: any; match: boolean }>;
}

// ─── Field Matching ───────────────────────────────────────────────────────────

function matchField(expected: any, got: any): boolean {
  if (expected === undefined || got === undefined) return false;
  
  if (typeof expected === 'number') {
    // Allow ±5% tolerance on numeric fields
    const tolerance = Math.abs(expected) * 0.05;
    return Math.abs(Number(got) - expected) <= tolerance;
  }
  
  if (typeof expected === 'string') {
    return String(got).toLowerCase().trim() === expected.toLowerCase().trim();
  }
  
  return got === expected;
}

// ─── Run Eval ────────────────────────────────────────────────────────────────

async function runEval(): Promise<void> {
  if (!fs.existsSync(GROUND_TRUTH_PATH)) {
    console.error('❌  evals/ground_truth.json not found. Create it first.');
    console.log('\nExpected format:\n', JSON.stringify([{
      file: 'wolt_week1.jpg',
      type: 'shift',
      expected: { appName: 'Wolt', grossPay: 312.50, tips: 24.00, distanceKm: 187 }
    }], null, 2));
    process.exit(1);
  }

  const groundTruth: GroundTruthEntry[] = JSON.parse(
    fs.readFileSync(GROUND_TRUTH_PATH, 'utf-8')
  );

  if (groundTruth.length === 0) {
    console.error('❌  ground_truth.json is empty.');
    process.exit(1);
  }

  console.log(`\n🔬  VeroFlow OCR Eval — ${groundTruth.length} test cases\n`);
  console.log('─'.repeat(60));

  const results: EvalResult[] = [];

  for (const entry of groundTruth) {
    const imagePath = path.join(IMAGES_DIR, entry.file);

    if (!fs.existsSync(imagePath)) {
      console.warn(`⚠️  Skipping "${entry.file}" — file not found in evals/images/`);
      continue;
    }

    // Convert image to base64 data URL
    const ext = path.extname(entry.file).slice(1).toLowerCase();
    const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    const base64 = fs.readFileSync(imagePath).toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    process.stdout.write(`  Testing "${entry.file}" ... `);

    try {
      const got = await performOCR(dataUrl, entry.type) as Record<string, any>;

      const details: EvalResult['details'] = {};
      let matchedFields = 0;
      const totalFields = Object.keys(entry.expected).length;

      for (const [key, expectedValue] of Object.entries(entry.expected)) {
        const gotValue = got[key];
        const match = matchField(expectedValue, gotValue);
        if (match) matchedFields++;
        details[key] = { expected: expectedValue, got: gotValue, match };
      }

      const score = totalFields > 0 ? matchedFields / totalFields : 0;
      const passed = score >= 0.8; // ≥80% field match = pass

      console.log(passed ? `✅  PASS (${(score * 100).toFixed(0)}%)` : `❌  FAIL (${(score * 100).toFixed(0)}%)`);

      // Print mismatches
      for (const [key, { expected, got: gotVal, match }] of Object.entries(details)) {
        if (!match) {
          console.log(`       ↳ ${key}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(gotVal)}`);
        }
      }

      results.push({ file: entry.file, type: entry.type, passed, score, details });

    } catch (e: any) {
      console.log(`💥  ERROR — ${e.message}`);
      results.push({
        file: entry.file,
        type: entry.type,
        passed: false,
        score: 0,
        details: {},
      });
    }
  }

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(60));
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const avgScore = results.reduce((s, r) => s + r.score, 0) / total;

  console.log(`\n📊  Results: ${passed}/${total} passed`);
  console.log(`📈  Average field accuracy: ${(avgScore * 100).toFixed(1)}%`);

  if (avgScore >= 0.9) {
    console.log('🏆  EXCELLENT — Prompt is production-ready.\n');
  } else if (avgScore >= 0.75) {
    console.log('🟡  GOOD — Minor prompt tuning recommended.\n');
  } else {
    console.log('🔴  NEEDS WORK — Review failing fields and refine the prompt.\n');
  }

  // Write JSON report
  const reportPath = path.join(__dirname, 'eval_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ date: new Date().toISOString(), passed, total, avgScore, results }, null, 2));
  console.log(`📄  Full report saved to evals/eval_report.json\n`);

  process.exit(passed === total ? 0 : 1);
}

runEval();
