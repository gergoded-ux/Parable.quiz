// scripts/validate-tests.ts
import { loadAllTests, isPublished } from '@/lib/test-loader';
import { isValidTheme } from '@/lib/themes';
import { getScripture } from '@/lib/scripture';
import publishedSlugs from '@/content/published.json';

function main() {
  const tests = loadAllTests();
  let errors = 0;

  // Every slug in the published allowlist must resolve to a real quiz, or it
  // would silently vanish from the live site.
  const known = new Set(tests.map(t => t.slug));
  for (const slug of publishedSlugs as string[]) {
    if (!known.has(slug)) {
      console.error(`❌ published.json → "${slug}" has no matching quiz file`);
      errors++;
    }
  }
  const liveCount = tests.filter(t => isPublished(t.slug)).length;

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

    if (!isValidTheme(t.theme)) {
      console.error(`❌ ${t.slug} → invalid or missing theme: ${t.theme ?? '(none)'}`);
      errors++;
    }
  }

  console.log(`✅ Validated ${tests.length} test(s) · ${liveCount} live, ${tests.length - liveCount} backlog`);
  if (errors > 0) {
    console.error(`💥 ${errors} validation error(s)`);
    process.exit(1);
  }
}

main();
