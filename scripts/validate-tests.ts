// scripts/validate-tests.ts
import { loadAllTests } from '@/lib/test-loader';
import { getScripture } from '@/lib/scripture';

function main() {
  const tests = loadAllTests();
  let errors = 0;

  for (const t of tests) {
    if (t.mode === 'archetype') {
      for (const [key, r] of Object.entries(t.results)) {
        // Archetype results must carry scripture: inline, or a resolvable ref.
        if (r.scripture) continue;
        if (!r.scriptureRef) {
          console.error(`❌ ${t.slug} → result "${key}" → missing scripture (need inline scripture or scriptureRef)`);
          errors++;
          continue;
        }
        try { getScripture(r.scriptureRef); }
        catch (e) {
          console.error(`❌ ${t.slug} → result "${key}" → ${(e as Error).message}`);
          errors++;
        }
      }
    } else if (t.mode === 'profile') {
      for (const [key, r] of Object.entries(t.results)) {
        // Profile scripture is optional, but a ref (if used) must resolve.
        if (r.scripture || !r.scriptureRef) continue;
        try { getScripture(r.scriptureRef); }
        catch (e) {
          console.error(`❌ ${t.slug} → result "${key}" → ${(e as Error).message}`);
          errors++;
        }
      }
    }
  }

  console.log(`✅ Validated ${tests.length} test(s)`);
  if (errors > 0) {
    console.error(`💥 ${errors} validation error(s)`);
    process.exit(1);
  }
}

main();
