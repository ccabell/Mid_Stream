/**
 * Test HITL with actual API data
 *
 * Run with: npx tsx scripts/test-hitl-api.ts
 */

const RUN_ID = '525dce7b-9b3f-4a03-84d6-02aa661b1ed6';
const API_BASE = 'https://prompt-runner-production.up.railway.app';

async function main() {
  console.log('='.repeat(60));
  console.log('HITL API DATA TEST');
  console.log('='.repeat(60));
  console.log('');

  // First, list runs to see what's available
  console.log('Listing available runs...');
  console.log('-'.repeat(40));
  try {
    const listResponse = await fetch(`${API_BASE}/runs?limit=5`);
    if (listResponse.ok) {
      const runs = await listResponse.json();
      console.log(`Found ${runs.items?.length || runs.length || 0} runs`);
      const runList = runs.items || runs;
      if (Array.isArray(runList) && runList.length > 0) {
        console.log('First few run IDs:');
        for (const run of runList.slice(0, 3)) {
          console.log(`  - ${run.id} (status: ${run.status})`);
        }
      }
    } else {
      console.log(`List runs failed: ${listResponse.status}`);
    }
  } catch (e) {
    console.log(`List runs error: ${e}`);
  }
  console.log('');

  // Fetch run data
  console.log(`Fetching run: ${RUN_ID}`);
  console.log('-'.repeat(40));

  try {
    const response = await fetch(`${API_BASE}/runs/${RUN_ID}`);
    if (!response.ok) {
      console.log(`✗ API Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log(`  Response: ${text.slice(0, 200)}`);
      return;
    }

    const run = await response.json();
    console.log('✓ Run fetched successfully');
    console.log('');

    // Analyze the data structure
    console.log('DATA STRUCTURE ANALYSIS:');
    console.log('-'.repeat(40));

    console.log(`run.id: ${run.id}`);
    console.log(`run.status: ${run.status}`);
    console.log(`run.outputs: ${run.outputs ? 'present' : 'MISSING'}`);

    if (!run.outputs) {
      console.log('✗ No outputs in run');
      return;
    }

    console.log(`run.outputs.prompt_1: ${run.outputs.prompt_1 ? 'present' : 'MISSING'}`);
    console.log(`run.outputs.prompt_2: ${run.outputs.prompt_2 ? 'present' : 'MISSING'}`);

    const p1 = run.outputs.prompt_1;
    const p2 = run.outputs.prompt_2;

    if (p1) {
      console.log('');
      console.log('PROMPT_1 STRUCTURE:');
      console.log(`  parsed_json: ${p1.parsed_json ? 'present' : 'MISSING'}`);
      console.log(`  raw: ${p1.raw ? `${p1.raw.length} chars` : 'MISSING'}`);

      if (p1.parsed_json) {
        const pj = p1.parsed_json;
        console.log(`  parsed_json keys: ${Object.keys(pj).join(', ')}`);

        // Check patient_goals
        if (pj.patient_goals) {
          console.log('');
          console.log('  patient_goals:');
          console.log(`    primary_concern type: ${typeof pj.patient_goals.primary_concern}`);
          console.log(`    primary_concern value: ${JSON.stringify(pj.patient_goals.primary_concern)?.slice(0, 100)}`);
          console.log(`    secondary_concerns type: ${typeof pj.patient_goals.secondary_concerns}`);
          console.log(`    secondary_concerns isArray: ${Array.isArray(pj.patient_goals.secondary_concerns)}`);
          console.log(`    goals type: ${typeof pj.patient_goals.goals}`);
          console.log(`    goals isArray: ${Array.isArray(pj.patient_goals.goals)}`);
        } else {
          console.log('  patient_goals: MISSING');
        }

        // Check offerings
        console.log('');
        console.log(`  offerings: ${pj.offerings ? `${Array.isArray(pj.offerings) ? pj.offerings.length + ' items' : typeof pj.offerings}` : 'MISSING'}`);
      }
    }

    if (p2) {
      console.log('');
      console.log('PROMPT_2 STRUCTURE:');
      console.log(`  parsed_json: ${p2.parsed_json ? 'present' : 'MISSING'}`);

      if (p2.parsed_json) {
        const pj = p2.parsed_json;
        console.log(`  parsed_json keys: ${Object.keys(pj).join(', ')}`);

        // Check various arrays
        console.log('');
        console.log('  Array fields:');
        console.log(`    objections: ${pj.objections ? `${Array.isArray(pj.objections) ? pj.objections.length + ' items' : typeof pj.objections}` : 'MISSING (check patient_signals)'}`);
        console.log(`    hesitations: ${pj.hesitations ? `${Array.isArray(pj.hesitations) ? pj.hesitations.length + ' items' : typeof pj.hesitations}` : 'MISSING'}`);
        console.log(`    concerns: ${pj.concerns ? `${Array.isArray(pj.concerns) ? pj.concerns.length + ' items' : typeof pj.concerns}` : 'MISSING'}`);
        console.log(`    visit_checklist: ${pj.visit_checklist ? `${Array.isArray(pj.visit_checklist) ? pj.visit_checklist.length + ' items' : typeof pj.visit_checklist}` : 'MISSING'}`);

        // Check patient_signals (V2 format)
        if (pj.patient_signals) {
          console.log('');
          console.log('  patient_signals (V2 format):');
          console.log(`    objections: ${pj.patient_signals.objections ? `${Array.isArray(pj.patient_signals.objections) ? pj.patient_signals.objections.length + ' items' : typeof pj.patient_signals.objections}` : 'MISSING'}`);
          console.log(`    hesitations: ${pj.patient_signals.hesitations ? `${Array.isArray(pj.patient_signals.hesitations) ? pj.patient_signals.hesitations.length + ' items' : typeof pj.patient_signals.hesitations}` : 'MISSING'}`);
          console.log(`    concerns: ${pj.patient_signals.concerns ? `${Array.isArray(pj.patient_signals.concerns) ? pj.patient_signals.concerns.length + ' items' : typeof pj.patient_signals.concerns}` : 'MISSING'}`);
        }
      }
    }

    // Now try the transformation
    console.log('');
    console.log('='.repeat(40));
    console.log('TRANSFORMATION TEST:');
    console.log('='.repeat(40));

    // Import and test
    const { transformExtractionToHITLDraft, normalizeExtractionOutput } = await import('../src/agents/hitl/utils/transformExtraction');

    const extractionOutput = {
      prompt_1: {
        parsed_json: p1.parsed_json,
        raw_response: p1.raw || '',
      },
      prompt_2: {
        parsed_json: p2.parsed_json,
        raw_response: p2.raw || '',
      },
    };

    console.log('');
    console.log('1. Testing normalizeExtractionOutput...');
    try {
      const normalized = normalizeExtractionOutput(extractionOutput as any);
      console.log('   ✓ Normalization succeeded');
    } catch (error) {
      console.log(`   ✗ Normalization FAILED: ${error}`);
    }

    console.log('');
    console.log('2. Testing transformExtractionToHITLDraft...');
    try {
      const draft = transformExtractionToHITLDraft(extractionOutput as any);
      console.log('   ✓ Transformation succeeded');
      console.log('');
      console.log('   Draft summary:');
      console.log(`     primaryConcern: "${draft.patientSummary.primaryConcern.value}"`);
      console.log(`     secondaryConcerns: ${draft.patientSummary.secondaryConcerns.length} items`);
      console.log(`     goals: ${draft.patientSummary.goals.length} items`);
      console.log(`     treatments: ${draft.treatments.length} items`);
      console.log(`     recommendations: ${draft.recommendations.length} items`);
      console.log(`     objections: ${draft.needsAttention.objections.length} items`);
      console.log(`     hesitations: ${draft.needsAttention.hesitations.length} items`);
      console.log(`     concerns: ${draft.needsAttention.concerns.length} items`);
      console.log(`     checklist items: ${draft.checklist.items.length} items`);
    } catch (error: any) {
      console.log(`   ✗ Transformation FAILED: ${error.message}`);
      console.log(`   Stack: ${error.stack?.split('\n').slice(0, 5).join('\n')}`);
    }

  } catch (error) {
    console.log(`✗ Fetch error: ${error}`);
  }
}

main();
