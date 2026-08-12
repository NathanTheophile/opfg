#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CHECK = process.argv.includes('--check');
const repo = process.cwd();
const here = path.dirname(fileURLToPath(import.meta.url));
const payload = path.join(here, 'payload');
const MARK = 'D2_WAVE2_NARRATIVE_RESET';

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}
function read(rel) {
  const p = path.join(repo, rel);
  if (!fs.existsSync(p)) fail(`missing repository file: ${rel}`);
  return fs.readFileSync(p, 'utf8');
}
function ensureParent(rel) {
  fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true });
}
function write(rel, content) {
  if (CHECK) return;
  ensureParent(rel);
  fs.writeFileSync(path.join(repo, rel), content, 'utf8');
}
function copyPayload(rel) {
  const src = path.join(payload, rel);
  if (!fs.existsSync(src)) fail(`missing pack payload: ${rel}`);
  write(rel, fs.readFileSync(src, 'utf8'));
}
function insertAfterOnce(text, anchor, insertion, label) {
  if (text.includes(insertion.trim())) return text;
  const i = text.indexOf(anchor);
  if (i < 0) fail(`anchor not found for ${label}`);
  const at = i + anchor.length;
  return text.slice(0, at) + insertion + text.slice(at);
}
function replaceBetween(text, start, end, replacement, label) {
  if (text.includes(replacement.trim())) return text;
  const a = text.indexOf(start);
  const b = text.indexOf(end, a + start.length);
  if (a < 0 || b < 0) fail(`section anchors not found for ${label}`);
  return text.slice(0, a) + replacement + '\n\n' + text.slice(b);
}

const required = [
  'docs/GAME_DESIGN.md',
  'docs/content/CONTENT_BIBLE.md',
  'docs/content/EVENT_AUTHORING_RULES.md',
  'docs/content/events/EVENT_CONCEPT_INDEX.md',
];
for (const rel of required) read(rel);

// 1) Freeze the current pre-V2 concept ledger before replacing its public path.
const indexRel = 'docs/content/events/EVENT_CONCEPT_INDEX.md';
const legacyIndexRel = 'docs/content/events/legacy/EVENT_CONCEPT_INDEX_LEGACY.md';
const currentIndex = read(indexRel);
const isRouter = currentIndex.includes('V2 ROUTER — DO NOT APPEND LEGACY CONTENT HERE.');
const legacyIndexPath = path.join(repo, legacyIndexRel);
if (!isRouter) {
  const frozenHeader = `# OPFG — Event Concept Index — FROZEN LEGACY ARCHIVE\n\n> **FROZEN PRE-V2 ARCHIVE. DO NOT APPEND. DO NOT USE AS V2 AUTHORING AUTHORITY.**\n>\n> This file preserves the complete accepted-content ledger from before the D2 Content Reset. Search it deliberately when mining old ideas; production GPT conversations must not receive it wholesale.\n\n---\n\n`;
  if (fs.existsSync(legacyIndexPath)) {
    const existing = fs.readFileSync(legacyIndexPath, 'utf8');
    if (!existing.includes('FROZEN PRE-V2 ARCHIVE')) {
      fail(`${legacyIndexRel} already exists but is not the expected frozen archive`);
    }
  } else if (!CHECK) {
    ensureParent(legacyIndexRel);
    fs.writeFileSync(legacyIndexPath, frozenHeader + currentIndex, 'utf8');
  }
  const router = fs.readFileSync(path.join(here, 'EVENT_CONCEPT_INDEX_POINTER.md'), 'utf8');
  write(indexRel, router);
}

// 2) Install new authoritative/reference docs and seed archives.
for (const rel of [
  'docs/design/MAJOR_NARRATIVE_TRACKS.md',
  'docs/design/audits/MAJOR_SAGA_RUNTIME_AUDIT.md',
  'docs/content/events/legacy/D1_9_NARRATIVE_SEEDS.md',
  'docs/content/events/legacy/LEGACY_CHILDHOOD_SEEDS.md',
  'docs/content/events/migration/V2_CONCEPT_MIGRATION_LEDGER.md',
  'docs/content/events/v2/EVENT_CONCEPT_INDEX_V2.md',
]) copyPayload(rel);

// 3) GAME_DESIGN authority amendments.
let gd = read('docs/GAME_DESIGN.md');
gd = insertAfterOnce(
  gd,
  '- [timeline mondiale et politique canon](design/WORLD_TIMELINE_AND_CANON.md) ;',
  `\n- [Major Narrative Tracks / D2 narrative architecture](design/MAJOR_NARRATIVE_TRACKS.md) ;`,
  'GAME_DESIGN delegation',
);
gd = insertAfterOnce(
  gd,
  'Peuple du Ciel, Lunarien et Tontatta sont réservés pour plus tard.',
  `\n\n<!-- ${MARK}:ORIGIN_RACE_AVAILABILITY -->\n**Disponibilité narrative D2 V1 :** Humain, Homme-poisson, Mink et Géant sont jouables. Long-bras et Boucanier restent visibles dans Origins mais verrouillés jusqu'à une future passe de contenu dédiée. Le verrouillage réduit la surface de production ; il ne supprime ni leurs définitions ni leur place future dans le monde.`,
  'GAME_DESIGN Race availability',
);
gd = insertAfterOnce(
  gd,
  '`player.profile.affiliationId` désigne exclusivement l’affiliation familiale héritée, pas une affiliation de carrière Active.',
  `\n\n<!-- ${MARK}:ORIGIN_FAMILY_AVAILABILITY -->\n**Disponibilité narrative D2 V1 :** les affiliations familiales jouables sont \`civilian\`, \`marine\`, \`pirate\`, \`revolutionary\` et \`royal_family\`. \`bandit\`, \`prisoner\`, \`slave\` et \`celestial_dragon\` restent visibles dans Origins mais verrouillées. Elles seront rouvertes uniquement lorsqu'un traitement narratif suffisamment complet pourra les accompagner.`,
  'GAME_DESIGN Family affiliation availability',
);

const familyReplacement = `### Family Legacy Saga — garantie narrative V2\n\n<!-- ${MARK}:FAMILY_GUARANTEE -->\nLa garantie narrative obligatoire de Childhood n'est plus l'initiation d'une ancienne \`Lifetime Thread\`. Chaque personnage reçoit la **Family Legacy Saga correspondant à son affiliation familiale héritée**.\n\nUne Childhood complète contient **exactement cinq root Events de Family Saga**, dus aux checkpoints 12, 48, 84, 120 et 156 mois. Chaque chapitre est un pool horizontal de variantes et évalue l'état **actuel** du personnage au moment de sa résolution : Race, structure familiale initiale, statut/présence des parents, relations, classe sociale, History, Traits et autres Conditions réellement pertinentes.\n\nUne seule variante est vécue par chapitre. Le chapitre entier est ensuite considéré comme terminé via History. Chaque chapitre doit posséder exactement un fallback universel, utilisé seulement lorsqu'aucune variante spécialisée n'est éligible.\n\nLes variantes Family restent des Normal Events mais sont exclues du pool Normal ordinaire ; seul l'orchestrateur Major Narrative Track peut les sélectionner. La progression ne nécessite aucun \`ArcState\` ni compteur persistant dédié.\n\nLa Family Saga est conçue pour continuer après 15 ans et réagir plus tard à l'affiliation personnelle choisie par le joueur. Son authoring adulte est différé, pas annulé.\n\nLes anciennes \`Lifetime Thread\` deviennent du matériau legacy ou, si elles sont reconstruites plus tard, des trames secondaires facultatives. Elles ne portent plus la garantie principale d'une run.\n\nVoir \`docs/design/MAJOR_NARRATIVE_TRACKS.md\` pour le contrat complet.`;
gd = replaceBetween(
  gd,
  '### Lifetime Threads — garantie narrative de run',
  '## 5. Active',
  familyReplacement,
  'GAME_DESIGN Lifetime → Family Saga',
);

const d2Amendment = `## D2 — Major Narrative Tracks and Content Reset V2\n\n<!-- ${MARK}:D2_AMENDMENT -->\n> **Authoritative amendment.** This section supersedes the D1.8/D1.9 early-Childhood orchestration and any earlier rule that treats the old narrative Event catalogue as automatically accepted runtime content.\n\nThe complete architecture is delegated to [Major Narrative Tracks](design/MAJOR_NARRATIVE_TRACKS.md).\n\n### Content Reset\n\nPre-V2 narrative EventDefinitions are legacy reference material. D1.9 is preserved as a high-quality narrative seed archive, not migrated as runtime EventDefinitions. The pre-V2 Event Concept Index is frozen; the V2 accepted-content ledger starts empty.\n\n### Childhood spine\n\nFor the current V2 target, Childhood has 20 root slots, of which exactly 5 belong to the inherited Family Legacy Saga. The remaining 15 slots preserve room for Race, Birthplace, Origin Cross mini-arcs, peer relationships, Traits, generic adventures and secondary callbacks.\n\nThe former representative \`12 stat / 3 Trait / 5 narrative\` mix is no longer a blocking quota when it conflicts with the five-chapter Family spine; future balancing is evaluated across the assembled V2 Childhood corpus.\n\n### Major-track priority target\n\nOnce implemented, the target ordering is: Critical/system gates → Immediate → mandatory system injections → overdue Major chapter → due Scheduled → newly due Major chapter → ordinary Normal. This permits a due Scheduled Event to take the exact checkpoint slot while preventing Family chapters from being starved afterward.\n\n### Future Active spine\n\nAt age 15 the Family Legacy Saga is intended to continue. A second Major Narrative Track — Personal Affiliation Saga — will later begin around the player's chosen Active affiliation and represent the career the character decides to build. Adult cadence and career-change semantics remain deliberately open until the Active redesign.`;
if (!gd.includes(`${MARK}:D2_AMENDMENT`)) {
  const old = gd.indexOf('## D1.9 — Early Childhood Origin Echo architecture');
  if (old < 0) fail('GAME_DESIGN D1.9 section not found');
  gd = gd.slice(0, old).trimEnd() + '\n\n' + d2Amendment + '\n';
}
write('docs/GAME_DESIGN.md', gd);

// 4) CONTENT_BIBLE: append V2 narrative content authority.
let cb = read('docs/content/CONTENT_BIBLE.md');
const cbAppend = `\n\n## 15. D2 V2 narrative-content architecture\n\n<!-- ${MARK}:CONTENT_BIBLE_V2 -->\nThe D2 Content Reset separates **accepted V2 runtime concepts** from **legacy creative archives**.\n\n### Major Family content\n\n- Childhood guarantees exactly five Family Legacy chapters for the inherited playable affiliation.\n- A chapter is a horizontal variant pool, not a fixed Scheduled chain.\n- Race, family structure, current parent state, social class, History and location may select different variants when they materially change the scene.\n- Do not create Cartesian coverage. Create a specialized variant only when the fiction is substantially different.\n- Every chapter requires one safety fallback, but the fallback must not compete with eligible specialized variants.\n- Five Family roots reserve 25% of Childhood; the rest of Childhood must remain broad.\n\n### Current playable narrative surface\n\nFamily affiliations: \`civilian\`, \`marine\`, \`pirate\`, \`revolutionary\`, \`royal_family\`.\n\nVisible but locked: \`bandit\`, \`prisoner\`, \`slave\`, \`celestial_dragon\`.\n\nRaces: \`human\`, \`fishman\`, \`mink\`, \`giant\`.\n\nVisible but locked: \`longarm\`, \`buccaneer\`.\n\n### Origin Cross mini-arcs\n\nOrigin Cross content recognizes unusually specific combinations. It is secondary biography, not the career-long spine. Typical shape: one concrete root, 1–3 Immediate continuations when justified, and optionally a later Scheduled callback. The 5 × 4 playable Affiliation/Race surface gives 20 useful eventual pairings, but no batch should create filler simply to tick a matrix cell.\n\n### Archive policy\n\n- \`docs/content/events/v2/EVENT_CONCEPT_INDEX_V2.md\` is the accepted V2 ledger.\n- \`docs/content/events/legacy/\` is non-authoritative reference material.\n- D1.9 seeds preserve premise/friction/world detail only; they are not accepted V2 EventDefinitions.\n- Production GPT conversations must not receive the complete legacy index/archive by default. Curate only the small seed subset relevant to the batch.\n- Deliberate reuse is recorded in \`docs/content/events/migration/V2_CONCEPT_MIGRATION_LEDGER.md\`.\n\nSee \`docs/design/MAJOR_NARRATIVE_TRACKS.md\` for the orchestration contract.`;
if (!cb.includes(`${MARK}:CONTENT_BIBLE_V2`)) cb = cb.trimEnd() + cbAppend + '\n';
write('docs/content/CONTENT_BIBLE.md', cb);

// 5) EVENT_AUTHORING_RULES: mark D1.9 as legacy and add V2 override.
let ar = read('docs/content/EVENT_AUTHORING_RULES.md');
const topNote = `\n> **D2 V2 authority note:** §24 is the current override for V2 narrative production. Legacy standard-batch Lifetime quotas and §23 D1.9 Opening Breadth remain historical reference only where §24 says they are superseded.\n`;
if (!ar.includes('**D2 V2 authority note:**')) {
  ar = insertAfterOnce(ar, '> **Scope:** rules for producing, reviewing, validating, and batching authored Events for OPFG V1.', topNote, 'EVENT_AUTHORING_RULES D2 banner');
}
if (!ar.includes('## 23. Early Childhood Origin Echo authoring — LEGACY D1.9 REFERENCE')) {
  ar = ar.replace(
    '## 23. Early Childhood Origin Echo authoring',
    `## 23. Early Childhood Origin Echo authoring — LEGACY D1.9 REFERENCE\n\n> **Superseded for V2 runtime production.** The D1.9 metadata/Opening Breadth rules below document the final pre-reset architecture and remain useful only when mining archived seeds. They do not define the V2 Childhood selector or an accepted V2 batch contract.`,
  );
}
const arAppend = `\n\n## 24. D2 V2 Narrative Reset and Major Saga authoring\n\n<!-- ${MARK}:AUTHORING_V2 -->\nThis section is the authoritative V2 override for narrative production after the D2 Content Reset.\n\n### 24.1 Superseded legacy production requirements\n\nFor V2 batches, the following old mandatory-production rules are **not global requirements** unless a future dedicated batch prompt explicitly opts into them:\n\n- §2.5 mandatory Signature Immediate + three Secondary Immediate + Lifetime Thread quotas;\n- §10.8 mandatory Childhood Lifetime Thread start;\n- §18.1 items 4–13 when they exist solely to enforce those old quotas;\n- §18.3's zero-runs-without-Lifetime criterion;\n- §19's mandatory Lifetime/Immediate quota inputs;\n- §21's old measurable requirement that every standard batch contain those structures;\n- §23 D1.9 Opening Breadth runtime composition.\n\nThe quality rules on concrete scenes, text budget, stakes, age coherence, Choice resolvability, recurring cast, callbacks, geography and localization remain fully active.\n\n### 24.2 V2 concept authority\n\nThe only accepted-concept ledger for new production is:\n\n\`docs/content/events/v2/EVENT_CONCEPT_INDEX_V2.md\`\n\nThe old pre-V2 index and narrative seed archives are non-authoritative. Search them deliberately only when mining ideas. Do not append to them and do not give them wholesale to parallel production conversations.\n\n### 24.3 Family Legacy Saga batch contract\n\nFamily Saga content follows \`docs/design/MAJOR_NARRATIVE_TRACKS.md\`.\n\nEach of the five Childhood chapters is a mutually exclusive horizontal variant pool. A Family batch must document for every variant:\n\n- track ID and chapter ID;\n- concrete premise and family-specific conflict;\n- exact axes that materially cause this variant (Race, initial family structure, current parent state, class, History, etc.);\n- why the same scene would not be equivalent under a generic fallback;\n- cast and persistent relationships used;\n- prior Choice/Outcome dependencies;\n- whether it is the chapter fallback.\n\nExactly one fallback is required per chapter across the assembled saga. Fallbacks are safety content and must remain less specific than the variants they protect.\n\nA batch fails horizontal review if most variants are noun-swaps of one common scene or if Race/parents/class are expressed only as locked bonus Choices inside otherwise identical roots.\n\n### 24.4 Five lived roots, broad authored pools\n\nThe player lives exactly five Family root chapters in Childhood. The authored saga may contain dozens of mutually exclusive root variants. Production planning may target roughly 45–70 root variants across a mature five-chapter Family Saga, but this is not a hard quota.\n\nDo not pad chapter pools to hit a number. A smaller set of genuinely different states is preferable to superficial combinatorial coverage.\n\n### 24.5 Origins and current state\n\nInitial structure and current reality are separate. For example, \`familyStructureIs(two_parents)\` does not prove both parents are currently alive/present. Late variants must inspect the relevant NPC status/relationship when current presence matters.\n\nThe selector evaluates the state at chapter resolution time. Do not pre-author a fixed future chapter ID merely because an earlier Family Event occurred.\n\n### 24.6 Immediate and Scheduled under V2\n\nImmediate and Scheduled remain valuable and retain their semantics:\n\n- Immediate = continuation of the current scene, no new root slot/time advance;\n- Scheduled = a specific future consequence, consumes a future root slot when resolved.\n\nUse them for mini-arcs, callbacks and consequences. Do **not** use Scheduled A→B→C as the progression mechanism for Major Saga chapters.\n\n### 24.7 Origin Cross mini-arcs\n\nOrigin Cross mini-arcs are secondary stories tied to high-yield combinations, especially the playable 5 Affiliation × 4 Race surface. They may reuse selected archived seeds after deliberate review.\n\nNormal target when justified:\n\n\`Root → 1–3 Immediate → optional Scheduled callback\`\n\nThey should end or resolve. They are not disguised Family Major Sagas.\n\n### 24.8 Production-source hygiene\n\nA V2 production conversation receives:\n\n1. current V2 authorities;\n2. the relevant Family Saga blueprint or mini-arc brief;\n3. the V2 Concept Index;\n4. current schema/runtime vocabulary;\n5. a **curated small subset** of legacy/D1.9 seeds relevant to the task.\n\nIt must not receive the complete frozen legacy index by default. This prevents old catalogue assumptions from becoming accidental V2 authority.\n\n### 24.9 V2 acceptance focus\n\nIn addition to ordinary schema/editorial validation, review V2 Family content for:\n\n- exact chapter membership and one-chapter-per-run semantics;\n- fallback safety;\n- meaningful horizontal reactivity;\n- diversity between representative Origins profiles;\n- callbacks that remember prior Choices rather than merely mentioning them;\n- preservation of room for the 15 non-Family Childhood roots;\n- compatibility with future adult Family continuation.\n\nThe prototype acceptance question is:\n\n> Do characters with very different Origins clearly live different versions of the same family story, rather than the same five Events with cosmetic variation?`;
if (!ar.includes(`${MARK}:AUTHORING_V2`)) ar = ar.trimEnd() + arAppend + '\n';
write('docs/content/EVENT_AUTHORING_RULES.md', ar);

console.log(CHECK ? 'D2 Wave 2 preflight OK. No files written.' : 'D2 Wave 2 applied successfully. Documentation/authority files only; runtime untouched.');
