/** Diagnostic (pas un contrôle) : liste les longueurs hors règle des pages (résumé ≥ 125 mots, FAQ 42–88,
 *  total ≥ 520 outil / 1 250 guide, titre 50–60, description 150–160).
 *  PAGE_FILES=id1,id2 npx vitest run tests/lint.test.ts */
import { it } from 'vitest';
import { readdirSync } from 'node:fs';
import { helpers } from '../src/lib/helpers';
import { HOME } from '../src/content/accueil';
import type { PageDef } from '../src/lib/guide-types';
const only = process.env.PAGE_FILES?.split(',');
const words = (s: string) => s.replace(/<table.*?<\/table>/gs, ' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
it('lint', async () => {
  const out: string[] = [];
  const pages: Array<{ id: string; tool?: string; fi: any; en: any }> = [{ id: 'home', tool: 'home', fi: HOME.fi, en: HOME.en }];
  for (const d of ['guides', 'outils']) for (const f of readdirSync(new URL(`../src/content/${d}/`, import.meta.url))) pages.push((await import(`../src/content/${d}/${f}`)).default as PageDef);
  for (const p of pages) {
    if (only && !only.includes(p.id)) continue;
    for (const l of ['fi', 'en'] as const) {
      const H = helpers(l), x = p[l];
      const r = words(x.resume(H)); if (r < 135) out.push(`${p.id}/${l} resume ${r}`);
      for (const q of x.faqs(H)) { const n = words(q.a); if (n < 42 || n > 88) out.push(`${p.id}/${l} faq ${n} : ${q.q}`); }
      const tot = words(x.body(H)) + r + x.faqs(H).reduce((s: number, q: any) => s + words(q.q) + words(q.a), 0);
      const min = p.tool === 'home' ? 1700 : p.tool ? 430 : 1100;
      if (tot < min) out.push(`${p.id}/${l} total ${tot} < ${min}`);
      if (x.title.length < 50 || x.title.length > 60) out.push(`${p.id}/${l} title ${x.title.length}`);
      if (x.description.length < 150 || x.description.length > 160) out.push(`${p.id}/${l} description ${x.description.length}`);
    }
  }
  process.stdout.write('\nLINT\n' + (out.join('\n') || 'ok') + '\n');
});
