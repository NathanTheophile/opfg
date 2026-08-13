import fs from "node:fs";
import path from "node:path";

const repo = process.cwd();

function fail(message) {
  console.error(`ERROR ${message}`);
  process.exit(1);
}
function read(rel) {
  const p = path.join(repo, rel);
  if (!fs.existsSync(p)) fail(`Missing ${rel}. Run from the OPFG repository root.`);
  return fs.readFileSync(p, "utf8");
}
function write(rel, content) {
  const p = path.join(repo, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
}
function writeJson(rel, value) {
  write(rel, JSON.stringify(value, null, 2) + "\n");
}
function replaceRequired(text, oldText, newText, label) {
  if (text.includes(newText)) return text;
  if (!text.includes(oldText)) fail(`Authority patch anchor not found: ${label}`);
  return text.replace(oldText, newText);
}
function appendOnce(text, marker, section) {
  if (text.includes(marker)) return text;
  return text.replace(/\s*$/, "") + "\n\n" + section.trim() + "\n";
}

const PATHS = {
  marine: "content-authoring/sagas/family_marine.authoring.json",
  pirate: "content-authoring/sagas/family_pirate.authoring.json",
  royal: "content-authoring/sagas/family_royal.authoring.json",
  lib: "scripts/saga-content/lib.ts",
  eventRules: "docs/content/EVENT_AUTHORING_RULES.md",
  major: "docs/design/MAJOR_NARRATIVE_TRACKS.md",
  game: "docs/GAME_DESIGN.md",
  bible: "docs/content/CONTENT_BIBLE.md",
  economy: "docs/design/ECONOMY_AND_ITEMS.md",
  concept: "docs/content/events/v2/EVENT_CONCEPT_INDEX_V2.md",
  catalog: "src/game/content/catalogFactory.ts",
};

for (const rel of Object.values(PATHS)) read(rel);

const sources = {
  marine: JSON.parse(read(PATHS.marine)),
  pirate: JSON.parse(read(PATHS.pirate)),
  royal: JSON.parse(read(PATHS.royal)),
};

for (const [key, source] of Object.entries(sources)) {
  if (source.sagaId !== `family_${key}`) fail(`${PATHS[key]} has unexpected sagaId ${source.sagaId}.`);
  if (!Array.isArray(source.events) || source.events.length === 0) fail(`${source.sagaId} has no Events.`);
}

// -----------------------------------------------------------------------------
// Reward audit helpers
// -----------------------------------------------------------------------------

const catalogText = read(PATHS.catalog);
const equipmentIds = new Set(
  [...catalogText.matchAll(/\{\s*id:\s*'([^']+)'[^\n]*category:\s*'equipment'/g)].map((m) => m[1]),
);

function allOutcomes(event) {
  const out = [];
  for (const choice of event.choices ?? []) {
    const r = choice.resolution;
    if (!r) continue;
    if (r.type === "deterministic") out.push(r.outcome);
    else if (r.type === "dice") out.push(...Object.values(r.outcomes ?? {}));
  }
  return out;
}
function eventById(source, id) {
  const e = source.events.find((x) => x.id === id);
  if (!e) fail(`${source.sagaId}: Event not found: ${id}`);
  return e;
}
function outcomeById(source, eventId, outcomeId) {
  const event = eventById(source, eventId);
  const outcome = allOutcomes(event).find((x) => x.id === outcomeId);
  if (!outcome) fail(`${source.sagaId}: Outcome not found: ${eventId}/${outcomeId}`);
  return outcome;
}
function leafOutcomes(source) {
  const events = new Map(source.events.map((e) => [e.id, e]));
  const layer5Roots = source.events.filter(
    (e) => e.kind === "normal" && e.majorTrack?.chapterId === "childhood_05"
  );
  const leaves = [];
  for (const root of layer5Roots) {
    const visited = new Set();
    const visiting = new Set();
    function visit(eventId) {
      if (visited.has(eventId)) return;
      if (visiting.has(eventId)) fail(`${source.sagaId}: Immediate cycle while auditing ${eventId}`);
      const event = events.get(eventId);
      if (!event) fail(`${source.sagaId}: queued Event missing while auditing: ${eventId}`);
      visiting.add(eventId);
      for (const outcome of allOutcomes(event)) {
        const targets = (outcome.effects ?? [])
          .filter((e) => e.type === "queueImmediateEvent")
          .map((e) => e.eventId);
        if (targets.length === 0) leaves.push({ rootId: root.id, eventId, outcome });
        else for (const target of targets) visit(target);
      }
      visiting.delete(eventId);
      visited.add(eventId);
    }
    visit(root.id);
  }
  return leaves;
}
function rewardFamily(effect) {
  if (effect.type === "addItem") return equipmentIds.has(effect.itemId) ? "equipment" : "item";
  if (effect.type === "modifyBerries" && Number(effect.amount) > 0) return "berries";
  if (effect.type === "modifyReputation") return "reputation";
  if (effect.type === "addTrait") return "trait";
  if (effect.type === "setFlag") return "state/access";
  if (effect.type === "setNpcStatus") return "npc";
  if (effect.type === "acquireShip") return "ship";
  if (["setCareerAffiliation", "setCareerRank", "setCareerTitle"].includes(effect.type)) return "career";
  if (["setNpcDevilFruit", "awakenHaki", "raiseConquerorHakiTo"].includes(effect.type)) return "power";
  return null;
}
function rewardSnapshot(source) {
  const leaves = leafOutcomes(source);
  const counts = {};
  const sole = {};
  for (const leaf of leaves) {
    const families = [...new Set((leaf.outcome.effects ?? []).map(rewardFamily).filter(Boolean))];
    for (const family of families) counts[family] = (counts[family] ?? 0) + 1;
    if (families.length === 1) sole[families[0]] = (sole[families[0]] ?? 0) + 1;
  }
  return { leaves: leaves.length, counts, sole };
}

const before = Object.fromEntries(Object.entries(sources).map(([k, v]) => [k, rewardSnapshot(v)]));

// -----------------------------------------------------------------------------
// Source mutation helpers
// -----------------------------------------------------------------------------

function ensurePersistentRewardType(source, type) {
  source.rules ??= {};
  source.rules.persistentRewardEffectTypes ??= [];
  if (!source.rules.persistentRewardEffectTypes.includes(type)) {
    source.rules.persistentRewardEffectTypes.push(type);
  }
}
function removeEffects(outcome, predicate) {
  outcome.effects = (outcome.effects ?? []).filter((e) => !predicate(e));
}
function removeType(outcome, type) {
  removeEffects(outcome, (e) => e.type === type);
}
function addEffect(outcome, effect) {
  const same = (outcome.effects ?? []).some((e) => JSON.stringify(e) === JSON.stringify(effect));
  if (!same) outcome.effects.push(effect);
}
function setOutcomeText(outcome, fr, en) {
  outcome.text = { fr, en };
}
function convert(source, eventId, outcomeId, {
  removeAddItem = false,
  removeReputation = false,
  effects = [],
  fr,
  en,
}) {
  const out = outcomeById(source, eventId, outcomeId);
  if (removeAddItem) removeType(out, "addItem");
  if (removeReputation) removeType(out, "modifyReputation");
  for (const effect of effects) addEffect(out, effect);
  if (fr && en) setOutcomeText(out, fr, en);
}

for (const source of Object.values(sources)) ensurePersistentRewardType(source, "modifyBerries");

// -----------------------------------------------------------------------------
// MARINE — keep symbolic/equipment inheritances where fiction earns them,
// diversify other leaves into money, reputation and state/access inheritance.
// -----------------------------------------------------------------------------

const M = sources.marine;

convert(M, "family_marine_13_your_future_is_yours_i02_keep", "active_civilian", {
  removeAddItem: true,
  effects: [{ type: "modifyBerries", amount: 10000 }],
  fr: "Tu refuses l'uniforme. Ton foyer te remet 10 000 Berrys pour commencer ta vie civile à quinze ans.",
  en: "You refuse the uniform. Your household gives you 10,000 Berrys to begin civilian life at fifteen.",
});
convert(M, "family_marine_13_your_future_is_yours_i02_keep", "active_civilian_deferred", {
  removeAddItem: true,
  effects: [
    { type: "modifyBerries", amount: 5000 },
    { type: "setFlag", flagId: "family_marine_future_open" },
  ],
  fr: "Tu repousses le choix. 5 000 Berrys restent à toi pour partir, et la porte Marine demeure ouverte.",
  en: "You defer the choice. You keep 5,000 Berrys to leave with, and the Marine door remains open.",
});
convert(M, "family_marine_13_chest_he_left_i03_answer", "active_civilian_distance", {
  removeAddItem: true,
  effects: [
    { type: "modifyBerries", amount: 7500 },
    { type: "setFlag", flagId: "family_marine_chest_closed" },
  ],
  fr: "Tu laisses le journal fermé et prends seulement les 7 500 Berrys du coffre. Le reste de son héritage demeure à distance.",
  en: "You leave the journal closed and take only the 7,500 Berrys from the chest. The rest of his legacy stays distant.",
});
convert(M, "family_marine_13_duty_not_obedience_i03_answer", "active_civilian_protect", {
  removeAddItem: true,
  effects: [{ type: "setFlag", flagId: "family_marine_protected_testimony" }],
  fr: "Tu gardes le témoignage hors des dossiers publics. Ton nom reste associé à cette protection, sans emporter le rapport.",
  en: "You keep the testimony out of public files. Your name stays tied to that protection without carrying the report.",
});
convert(M, "family_marine_13_duty_not_obedience_i03_answer", "active_civilian_open", {
  removeAddItem: true,
  effects: [{ type: "setFlag", flagId: "family_marine_open_testimony" }],
  fr: "Tu verses le témoignage au dossier public. Le rapport reste aux archives; ta réputation porte désormais ce choix.",
  en: "You put the testimony on the public record. The report stays in the archive; your reputation now carries that choice.",
});

for (const [outcomeId, flagId, rep, fr, en] of [
  ["active_civilian_break", "family_marine_name_broken", 1,
    "Tu sépares ton nom de l'institution. Aucun souvenir officiel ne remplace cette rupture, que d'autres retiendront.",
    "You separate your name from the institution. No official keepsake replaces that break, and others will remember it."],
  ["active_marine_despite_break", "family_marine_name_reclaimed", 2,
    "Tu revendiques ton nom sans rendre l'institution propriétaire de ta famille. Cette position te précédera quand tu t'engageras.",
    "You reclaim your name without giving the institution ownership of your family. That stance will precede your enlistment."],
  ["active_civilian_open", "family_marine_name_open", 1,
    "Tu gardes ton nom sans promettre l'uniforme. Les Marines qui connaissent l'histoire savent que la relation reste ouverte.",
    "You keep your name without promising the uniform. Marines who know the story understand that the relationship remains open."],
]) {
  convert(M, "family_marine_13_our_name_is_not_theirs_i03_answer", outcomeId, {
    removeAddItem: true,
    effects: [
      { type: "setFlag", flagId },
      { type: "modifyReputation", amount: rep },
    ],
    fr, en,
  });
}

convert(M, "family_marine_13_what_remains_of_him_i03_answer", "active_civilian_own", {
  removeAddItem: true,
  effects: [
    { type: "modifyBerries", amount: 7500 },
    { type: "setFlag", flagId: "family_marine_relics_left_behind" },
  ],
  fr: "Tu refuses de vivre à travers ses reliques. 7 500 Berrys de succession deviennent ton seul héritage matériel.",
  en: "You refuse to live through his relics. 7,500 Berrys from the estate become your only material inheritance.",
});

convert(M, "family_marine_13_decide_for_yourself_i02_opportunity", "active_civilian", {
  removeAddItem: true,
  effects: [{ type: "modifyBerries", amount: 10000 }],
  fr: "Tu choisis une route civile. 10 000 Berrys de départ remplacent l'équipement que ta famille aurait pu te transmettre.",
  en: "You choose a civilian route. A 10,000-Berry starting fund replaces the equipment your family might have passed down.",
});
convert(M, "family_marine_13_decide_for_yourself_i02_opportunity", "active_civilian_deferred", {
  removeAddItem: true,
  effects: [
    { type: "modifyBerries", amount: 5000 },
    { type: "setFlag", flagId: "family_marine_future_open" },
  ],
  fr: "Tu ne choisis ni uniforme ni rupture. Tu pars avec 5 000 Berrys et la possibilité de répondre plus tard.",
  en: "You choose neither uniform nor rupture. You leave with 5,000 Berrys and the option to answer later.",
});
convert(M, "family_marine_13_on_your_terms_i04_resolution", "active_civilian_deferred", {
  removeAddItem: true,
  effects: [
    { type: "setFlag", flagId: "family_marine_giant_terms_open" },
    { type: "modifyReputation", amount: 2 },
  ],
  fr: "Tu laisses le brassard. Les instructeurs retiennent toutefois qu'une future offre devra respecter tes conditions.",
  en: "You leave the bracer. The instructors still remember that any future offer will have to respect your terms.",
});

// -----------------------------------------------------------------------------
// PIRATE — remove the 33/33 item monoculture.
// -----------------------------------------------------------------------------

const P = sources.pirate;

convert(P, "family_pirate_13_flag_means_mine_i01_defer", "active_civilian_defer", {
  removeAddItem: true,
  effects: [{ type: "setFlag", flagId: "family_pirate_flag_undecided" }],
  fr: "Tu ne prends pas l'écusson. Le pavillon reste une question ouverte que l'équipage se souviendra de t'avoir laissée.",
  en: "You do not take the patch. The flag remains an open question the crew remembers leaving to you.",
});

convert(P, "family_pirate_13_safe_harbor_key_i01_use_network", "active_pirate_use_network", {
  removeAddItem: true,
  effects: [
    { type: "setFlag", flagId: "family_pirate_safe_harbor_access" },
    { type: "modifyReputation", amount: 2 },
  ],
  fr: "Tu rends la clé après avoir mémorisé les signaux. Le réseau de refuges accepte désormais de te reconnaître.",
  en: "You return the key after memorizing the signals. The safe-harbor network now agrees to recognize you.",
});
convert(P, "family_pirate_13_safe_harbor_key_i01_defer", "active_civilian_defer", {
  removeAddItem: true,
  effects: [{ type: "setFlag", flagId: "family_pirate_safe_harbor_known" }],
  fr: "Tu ne prends pas la clé, mais tu conserves l'adresse et le signe de reconnaissance. Le refuge pourra être retrouvé.",
  en: "You do not take the key, but keep the address and recognition sign. The harbor can be found again.",
});

convert(P, "family_pirate_13_ledger_of_names_i01_defer", "active_civilian_defer", {
  removeAddItem: true,
  effects: [{ type: "setFlag", flagId: "family_pirate_ledger_sealed" }],
  fr: "Tu laisses le registre scellé chez un dépositaire. Tu sais où le retrouver sans le transporter.",
  en: "You leave the ledger sealed with a keeper. You know where to recover it without carrying it.",
});

convert(P, "family_pirate_13_mothers_salt_chart_i01_defer", "active_civilian_defer", {
  removeAddItem: true,
  effects: [{ type: "setFlag", flagId: "family_pirate_chart_reserved" }],
  fr: "Tu laisses la carte à l'abri, mais mémorises où elle t'attendra si tu choisis un jour de la suivre.",
  en: "You leave the chart safe, but remember where it will wait if you ever choose to follow it.",
});

for (const spec of [
  ["family_pirate_13_crew_has_limits_i01_captain_rules", "active_pirate_captain_rules",
    [{ type: "setFlag", flagId: "family_pirate_crew_code" }, { type: "modifyReputation", amount: 2 }],
    "Tu emportes le code, pas un écusson. Des pirates du cercle commencent à reconnaître ces limites comme les tiennes.",
    "You carry the code, not a patch. Pirates around the circle begin to recognize those limits as yours."],
  ["family_pirate_13_crew_has_limits_i01_keep_home", "active_civilian_keep_home",
    [{ type: "modifyBerries", amount: 7500 }, { type: "setFlag", flagId: "family_pirate_home_boundary" }],
    "Tu refuses que le code pirate gouverne le foyer. 7 500 Berrys sont réservés à ton futur départ civil.",
    "You refuse to let pirate code rule the household. 7,500 Berrys are set aside for your future civilian departure."],
  ["family_pirate_13_crew_has_limits_i01_defer", "active_civilian_defer",
    [{ type: "setFlag", flagId: "family_pirate_crew_code_unresolved" }, { type: "modifyReputation", amount: 1 }],
    "Tu n'adoptes pas encore le code. L'équipage retient pourtant que tu as exigé des limites avant de répondre.",
    "You do not adopt the code yet. The crew still remembers that you demanded limits before answering."],
]) {
  convert(P, spec[0], spec[1], { removeAddItem: true, effects: spec[2], fr: spec[3], en: spec[4] });
}

for (const spec of [
  ["family_pirate_13_return_the_share_i01_pirate_repay", "active_pirate_pirate_repay",
    "family_pirate_debt_repaid", 2,
    "La dette est soldée et le reçu barré. Dans ce réseau pirate, on sait désormais que tu rembourses ce que ta famille doit.",
    "The debt is settled and the receipt crossed out. In this pirate network, people now know you repay what your family owes."],
  ["family_pirate_13_return_the_share_i01_repay_civil", "active_civilian_repay_civil",
    "family_pirate_debt_repaid", 2,
    "Tu soldes la dette sans rejoindre l'équipage. Le reçu barré vaut désormais plus que le registre que tu refuses d'emporter.",
    "You settle the debt without joining the crew. The crossed-out receipt matters more than the ledger you refuse to carry."],
]) {
  convert(P, spec[0], spec[1], {
    removeAddItem: true,
    effects: [
      { type: "setFlag", flagId: spec[2] },
      { type: "modifyReputation", amount: spec[3] },
    ],
    fr: spec[4], en: spec[5],
  });
}
// keep_debt deliberately keeps the physical ledger: the unresolved obligation is literally documented there.

for (const spec of [
  ["family_pirate_13_no_innocents_code_i01_pirate_code", "active_pirate_pirate_code",
    "family_pirate_no_innocents_code", 2,
    "Tu prends ce principe en mer sans transformer un écusson en morale. Des pirates savent désormais quelle limite tu revendiques.",
    "You take that principle to sea without turning a patch into morality. Pirates now know the line you claim."],
  ["family_pirate_13_no_innocents_code_i01_keep_code", "active_civilian_keep_code",
    "family_pirate_no_innocents_code", 1,
    "Tu gardes le principe sans garder le pavillon. Ceux qui ont entendu ta décision savent où tu places la limite.",
    "You keep the principle without keeping the flag. Those who heard your decision know where you draw the line."],
  ["family_pirate_13_no_innocents_code_i01_reject_symbol", "active_civilian_reject_symbol",
    "family_pirate_no_innocents_symbol_rejected", 1,
    "Tu refuses que le pavillon transforme une règle minimale en vertu. Cette prise de distance devient connue.",
    "You refuse to let the flag turn a minimum rule into virtue. That distance becomes known."],
]) {
  convert(P, spec[0], spec[1], {
    removeAddItem: true,
    effects: [{ type: "setFlag", flagId: spec[2] }, { type: "modifyReputation", amount: spec[3] }],
    fr: spec[4], en: spec[5],
  });
}

convert(P, "family_pirate_13_own_depth_i01_refuse_job", "active_civilian_refuse_job", {
  removeAddItem: true,
  effects: [
    { type: "setFlag", flagId: "family_pirate_diving_job_refused" },
    { type: "modifyReputation", amount: 1 },
  ],
  fr: "Tu laisses la cloche et refuses que ton corps devienne un outil d'équipage. Ceux qui proposaient le travail retiennent ta limite.",
  en: "You leave the bell and refuse to make your body a crew tool. Those offering the job remember your boundary.",
});

convert(P, "family_pirate_13_fallback_pursuit_i01_pirate_network", "active_pirate_pirate_network", {
  removeAddItem: true,
  effects: [
    { type: "setFlag", flagId: "family_pirate_safe_harbor_access" },
    { type: "modifyReputation", amount: 2 },
  ],
  fr: "Tu mémorises les signaux au lieu d'emporter la clé. Le réseau de refuges te reconnaît désormais comme l'un des siens.",
  en: "You memorize the signals instead of carrying the key. The safe-harbor network now recognizes you as one of its own.",
});
convert(P, "family_pirate_13_fallback_pursuit_i01_defer", "active_civilian_defer", {
  removeAddItem: true,
  effects: [{ type: "setFlag", flagId: "family_pirate_safe_harbor_known" }],
  fr: "Tu ne prends pas la clé. Tu gardes seulement le signe et l'adresse, assez pour retrouver le refuge plus tard.",
  en: "You do not take the key. You keep only the sign and address, enough to find the harbor later.",
});

convert(P, "family_pirate_13_fallback_household_i01_leave_home", "active_civilian_leave_home", {
  removeAddItem: true,
  effects: [
    { type: "modifyBerries", amount: 7500 },
    { type: "setFlag", flagId: "family_pirate_left_household" },
  ],
  fr: "Tu laisses l'écusson au foyer. Une bourse de 7 500 Berrys devient l'aide concrète avec laquelle tu partiras à quinze ans.",
  en: "You leave the patch at home. A 7,500-Berry purse becomes the practical help you will leave with at fifteen.",
});

convert(P, "family_pirate_13_fallback_legacy_i01_defer", "active_civilian_defer", {
  removeAddItem: true,
  effects: [{ type: "setFlag", flagId: "family_pirate_legacy_unresolved" }],
  fr: "Tu laisses le registre fermé chez ta famille. L'héritage reste accessible, mais aucune page ne décide encore pour toi.",
  en: "You leave the ledger closed with your family. The inheritance remains accessible, but no page decides for you yet.",
});

// -----------------------------------------------------------------------------
// ROYAL — keep public reputation where it is the natural inheritance, but
// diversify household, orphan-burden and fallen-house endings.
// -----------------------------------------------------------------------------

const R = sources.royal;

convert(R, "family_royal_13_family_not_institution_i01_reaction", "keep_family_leave_court", {
  removeReputation: true,
  effects: [{ type: "setFlag", flagId: "family_royal_family_without_court" }],
  fr: "Tu gardes le lien avec ta mère sans conserver d'obligation de cour. Cette frontière devient une part durable de ton héritage.",
  en: "You keep your bond with your mother without keeping a court obligation. That boundary becomes a lasting part of your inheritance.",
});
convert(R, "family_royal_13_family_not_institution_i01_reaction", "accept_some_duty", {
  effects: [{ type: "setFlag", flagId: "family_royal_limited_family_duty" }],
  fr: "Tu acceptes quelques obligations familiales, clairement limitées. À quinze ans, ta carrière restera civile, mais ce devoir pourra encore t'ouvrir des situations.",
  en: "You accept a limited set of family obligations. At fifteen your career stays civilian, but that duty can still open future situations.",
});
convert(R, "family_royal_13_family_not_institution_i01_reaction", "need_distance", {
  removeReputation: true,
  effects: [
    { type: "modifyBerries", amount: 5000 },
    { type: "setFlag", flagId: "family_royal_independent_household" },
  ],
  fr: "Tu demandes de la distance. 5 000 Berrys personnels rendent cette autonomie concrète sans effacer le lien familial.",
  en: "You ask for distance. A personal 5,000-Berry fund makes that autonomy concrete without erasing the family bond.",
});

convert(R, "family_royal_13_seal_without_throne_i01_reaction", "carry_history", {
  removeReputation: true,
  effects: [{ type: "setFlag", flagId: "family_royal_seal_archive" }],
  fr: "Tu conserves le sceau dans les archives familiales, comme preuve d'origine et non comme pouvoir professionnel.",
  en: "You keep the seal in the family archive as proof of origin, not professional authority.",
});
convert(R, "family_royal_13_seal_without_throne_i01_reaction", "use_only_for_access", {
  effects: [{ type: "setFlag", flagId: "family_royal_archive_access" }],
  fr: "Tu acceptes l'accès aux archives sans prétendre qu'il te donne raison. Ce privilège restera utilisable et contestable.",
  en: "You accept archive access without pretending it makes you right. That privilege remains usable and contestable.",
});
convert(R, "family_royal_13_seal_without_throne_i01_reaction", "leave_symbol", {
  removeReputation: true,
  effects: [{ type: "setFlag", flagId: "family_royal_origin_without_seal" }],
  fr: "Tu laisses le sceau au conseil. Ton origine reste vraie, mais aucun symbole matériel ne devient nécessaire pour la prouver.",
  en: "You leave the seal with the council. Your origin remains true, but no physical symbol becomes necessary to prove it.",
});

convert(R, "family_royal_13_pay_the_cost_i01_reaction", "rebuild_without_past", {
  removeReputation: true,
  effects: [
    { type: "modifyBerries", amount: 10000 },
    { type: "setFlag", flagId: "family_royal_rebuild_fund" },
  ],
  fr: "Tu renonces aux anciennes créances. 10 000 Berrys liquidés proprement deviennent un fonds pour reconstruire sans rejouer l'ancienne grandeur.",
  en: "You renounce the old claims. A cleanly liquidated 10,000 Berrys becomes a fund to rebuild without recreating former grandeur.",
});
convert(R, "family_royal_13_pay_the_cost_i01_reaction", "documented_restitution", {
  removeReputation: true,
  effects: [
    { type: "modifyBerries", amount: 25000 },
    { type: "modifyReputation", amount: 2 },
    { type: "setFlag", flagId: "family_royal_documented_restitution" },
  ],
  fr: "La cour reconnaît une part documentée de la saisie. 25 000 Berrys sont restitués sans effacer les dettes que la famille devait réellement.",
  en: "The court recognizes a documented share of the seizure. 25,000 Berrys are restored without erasing debts the family genuinely owed.",
});
convert(R, "family_royal_13_pay_the_cost_i01_reaction", "pursue_revenge", {
  effects: [{ type: "setFlag", flagId: "family_royal_restitution_claim_active" }],
  fr: "Tu gardes les noms et la créance ouverte. Ta réputation porte désormais une revendication que tu pourras poursuivre plus tard.",
  en: "You keep the names and the claim open. Your reputation now carries a demand you may pursue later.",
});
convert(R, "family_royal_13_pay_the_cost_i01_reaction", "abandon_restoration", {
  removeReputation: true,
  effects: [
    { type: "modifyBerries", amount: 5000 },
    { type: "setFlag", flagId: "family_royal_restoration_abandoned" },
  ],
  fr: "Tu abandonnes la restauration. 5 000 Berrys provenant des derniers actifs liquides deviennent un départ plutôt qu'un acompte sur le passé.",
  en: "You abandon restoration. 5,000 Berrys from the last liquid assets become a fresh start instead of a payment toward the past.",
});
convert(R, "family_royal_13_pay_the_cost_i01_reaction", "keep_name_not_entitlement", {
  removeReputation: true,
  effects: [
    { type: "setFlag", flagId: "family_royal_name_without_claim" },
    { type: "modifyReputation", amount: 1 },
  ],
  fr: "Tu gardes le nom sans transformer l'ancien confort en dette du monde envers toi. Cette position devient publiquement identifiable.",
  en: "You keep the name without turning former comfort into a debt the world owes you. That stance becomes publicly recognizable.",
});

// -----------------------------------------------------------------------------
// Saga pipeline — money is a valid persistent inheritance, and monocultures
// now surface automatically.
// -----------------------------------------------------------------------------

let lib = read(PATHS.lib);

lib = replaceRequired(
  lib,
  "  'addTrait',\n  'modifyReputation',",
  "  'addTrait',\n  'modifyBerries',\n  'modifyReputation',",
  "DEFAULT_REWARD_EFFECT_TYPES modifyBerries",
);

lib = replaceRequired(
  lib,
  "  validateTerminalRewards(source, chapterRoots, eventsById, immediateGraph, errors);\n",
  "  validateTerminalRewards(source, chapterRoots, eventsById, immediateGraph, errors);\n  validateInheritanceRewardDiversity(source, chapterRoots, eventsById, immediateGraph, errors, warnings);\n",
  "validateInheritanceRewardDiversity call",
);

const diversityMarker = "// D2.11 — Family inheritance reward diversity";
if (!lib.includes(diversityMarker)) {
  const anchor = "function validateTerminalRewards(\n";
  if (!lib.includes(anchor)) fail("Could not find validateTerminalRewards insertion point.");
  const fn = `
// D2.11 — Family inheritance reward diversity
function validateInheritanceRewardDiversity(
  source: SagaAuthoringSource,
  chapterRoots: Map<string, AuthoringEvent[]>,
  eventsById: Map<string, AuthoringEvent>,
  graph: Map<string, Set<string>>,
  errors: string[],
  warnings: string[],
): void {
  if (!source.trackId.startsWith('family_')) return;
  const terminalChapter = [...source.chapters].reverse().find(
    (chapter) => (chapterRoots.get(chapter)?.length ?? 0) > 0,
  );
  if (!terminalChapter) return;

  const leaves = (chapterRoots.get(terminalChapter) ?? []).flatMap((root) =>
    collectLeafOutcomes(root.id, eventsById, graph)
  );
  if (leaves.length < 6) return;

  const familyCounts = new Map<string, number>();
  for (const leaf of leaves) {
    const families = new Set<string>();
    for (const effect of Array.isArray(leaf.outcome.effects) ? leaf.outcome.effects : []) {
      const type = String(effect.type ?? '');
      if (type === 'addItem') families.add('tangible_asset');
      else if (type === 'modifyBerries' && Number(effect.amount) > 0) families.add('economic');
      else if (type === 'modifyReputation') families.add('reputation');
      else if (type === 'addTrait') families.add('trait');
      else if (type === 'setFlag') families.add('state_access');
      else if (type === 'setNpcStatus') families.add('npc');
      else if (type === 'acquireShip') families.add('ship');
      else if (type === 'setCareerAffiliation' || type === 'setCareerRank' || type === 'setCareerTitle') families.add('career');
      else if (type === 'setNpcDevilFruit' || type === 'awakenHaki' || type === 'raiseConquerorHakiTo') families.add('power');
    }
    for (const family of families) {
      familyCounts.set(family, (familyCounts.get(family) ?? 0) + 1);
    }
  }

  if (familyCounts.size <= 1) {
    errors.push(
      \`Family inheritance reward monoculture: "\${source.sagaId}" uses only \${[...familyCounts.keys()].join(', ') || 'no recognized reward family'} across \${leaves.length} Layer-5 leaves. Choose rewards from the fiction instead of defaulting every ending to one mechanic.\`,
    );
    return;
  }

  if (familyCounts.size < 3) {
    warnings.push(
      \`Family inheritance diversity: "\${source.sagaId}" uses only \${familyCounts.size} recognized reward families across \${leaves.length} Layer-5 leaves. Mature Sagas should normally reach at least three when fiction supports it.\`,
    );
  }

  const dominant = [...familyCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (dominant && dominant[1] / leaves.length > 0.75) {
    warnings.push(
      \`Family inheritance concentration: "\${source.sagaId}" gives \${dominant[0]} on \${dominant[1]}/\${leaves.length} Layer-5 leaves (>75%). Keep only if the Saga fiction genuinely warrants that dominance.\`,
    );
  }
}

`;
  lib = lib.replace(anchor, fn + anchor);
}

lib = replaceRequired(
  lib,
  "      if (!effects.some((effect) => rewardTypes.has(String(effect.type)))) {\n",
  "      if (!effects.some((effect) => rewardTypes.has(String(effect.type)) && (effect.type !== 'modifyBerries' || Number(effect.amount) > 0))) {\n",
  "positive modifyBerries terminal reward",
);

write(PATHS.lib, lib);

// -----------------------------------------------------------------------------
// Authorities and information docs
// -----------------------------------------------------------------------------

let eventRules = read(PATHS.eventRules);
eventRules = appendOnce(eventRules, "<!-- D2.11_FAMILY_INHERITANCE_RESOLUTION -->", `
<!-- D2.11_FAMILY_INHERITANCE_RESOLUTION -->
## 29. Family inheritance resolution — D2.11 authority

Layer 5 does not distribute a generic "reward". It resolves **what the character actually inherits from the lived Family story**.

### 29.1 Fiction first, mechanic second

For every terminal Outcome, author in this order:

1. state the inheritance in fiction;
2. identify what persists into the character's future;
3. only then choose the existing Effect that expresses it.

Do not start from \`addItem\`, \`modifyReputation\`, a Trait, or a quota and reverse-engineer prose around it.

Valid inheritance families include, when supported by the current runtime and the scene:

- Berrys / economic inheritance;
- Reputation / notoriety / social standing;
- a meaningful Item, document or keepsake;
- Equipment;
- a Trait when the Trait is genuinely formed here and cannot silently no-op as the sole reward;
- persistent NPC / animal / companion-related state when an existing runtime path can actually express it;
- network, access, obligation or opportunity state encoded by a meaningful reusable Flag/History hook;
- ship/power inheritance only when exceptionally justified;
- the separate Active career handoff resolved from History at 180 months;
- a light mixed inheritance when two components are independently earned by the fiction.

A Flag does not count as good authoring merely because it is persistent. It must represent a concrete access, obligation, relationship, claim, network, or future authoring hook that later content can test.

### 29.2 Explicit anti-pattern: reward monoculture

Reject this production pattern:

\`\`\`text
many Layer-5 leaves
-> invent a handful of souvenir objects
-> give one object to every leaf
-> validator passes
\`\`\`

Also reject the equivalent version where every leaf receives Reputation regardless of what happened.

A mature Family Saga should **normally use at least three distinct inheritance families** across its Layer-5 leaves when the fiction naturally supports them. This is a review target, not a per-Saga quota. If one family appears on more than roughly 75% of terminal leaves, the SELF_AUDIT must explain why that dominance is narratively necessary.

The Saga checker reports one-family monoculture as an error and strong concentration / low diversity as warnings. This is production tooling, not a new gameplay system.

### 29.3 Economic inheritance

\`modifyBerries\` is a valid persistent Layer-5 reward when the scene actually transfers money, a settlement, liquidated assets, a travel fund, saved wages, a pirate share, or another concrete economic inheritance.

Use current economy anchors:

- 2,500–7,500 Berrys: small personal stake;
- 10,000–25,000 Berrys: meaningful starting inheritance;
- above 25,000: exceptional and specifically justified.

For scale, a Dinghy costs 5,000 and a Sloop 25,000 Berrys. Do not casually hand out ship-scale wealth.

Social class still never grants automatic personal Berrys. Only an authored transfer does.

A negative \`modifyBerries\` never satisfies the terminal persistent-reward requirement.

### 29.4 Career handoff is separate

Layer 5 resolves intent at 156 months. The actual career mutation occurs only at the Childhood -> Active boundary at 180 months.

Current contracts:

- Civilian Family -> Active Civilian;
- Marine Family -> Outcome-specific Marine + \`marine_recruit\` or Civilian;
- Pirate Family -> Outcome-specific Pirate or Civilian;
- Revolutionary Family -> Outcome-specific Revolutionary + \`revolutionary_recruit\` or Civilian;
- Royal Family -> Active Civilian; \`royal_family\` remains inherited identity.

Do not use early \`setCareerAffiliation\` in Childhood Family Events.

### 29.5 Required Layer-5 SELF_AUDIT table

Every new/revised Family Saga must provide one row per reachable terminal leaf:

\`\`\`text
terminal Event/Outcome
-> narrative inheritance
-> mechanical inheritance family
-> exact Effect(s)
-> why this form follows from the story
-> future hook, if any
\`\`\`

Review the distribution across the whole Saga before integration. The goal is not equal counts; it is to prevent the validator from choosing the fiction.
`);
write(PATHS.eventRules, eventRules);

let major = read(PATHS.major);
major = replaceRequired(
  major,
  "> **Status: validated V2 narrative-design authority; runtime implementation pending.**",
  "> **Status: validated V2 narrative-design authority; D2 Childhood Family runtime implemented.**",
  "Major Narrative Tracks status",
);
major = appendOnce(major, "<!-- D2.11_FAMILY_SAGA_LESSONS -->", `
<!-- D2.11_FAMILY_SAGA_LESSONS -->
## D2.11 — Production lessons from Marine, Pirate and Royal

The first three integrated Family Sagas establish **multiple valid production shapes**, not a quality hierarchy.

- **Marine** demonstrates a deep multi-Immediate treatment and the high-yield \`Marine × Giant\` institutional-pressure association.
- **Pirate** demonstrates a broad, highly reactive Family DAG and the \`Pirate × Fish-Man\` coercion/consent association around aquatic capability.
- **Royal** demonstrates that a compact \`1 Major root -> 1 shared Immediate resolution\` pattern can carry a full-quality DAG when each scene is concrete. Its strongest long paths are **Royal × Orphan** and **Royal × Poor / Fallen House**; Fish-Man specialization is deliberately shorter and rejoins shared court/public nodes.

Event count, Immediate depth and authored volume are **not quality scores**. A node needs only the panels required for its dramatic situation. Quality is judged by continuity across the five ages, meaningful History callbacks, distinct lived Origins, concrete scenes, and a consequential inheritance resolution.

### Special Association discovery

Do not ask "which Race gets this Saga's special path?" Ask:

> Which Origins crossing most changes the lived family experience of this affiliation?

The answer may be Race, Family Structure, Social Class, current parent presence/state, Birth Location, a prior Family Outcome, or a compact combination. Special Associations are sparse authored pressure points, never a Cartesian matrix.

Validated examples now intentionally span different axes:

\`\`\`text
Marine × Giant
Pirate × Fish-Man
Royal × Orphan
Royal × Poor / Fallen House
\`\`\`

### Layer-5 handoff matrix

| Family track | Inherited identity after Childhood | Active entry at 180 months |
| --- | --- | --- |
| \`family_civilian\` | \`civilian\` | Civilian |
| \`family_marine\` | \`marine\` | Outcome-specific Marine + \`marine_recruit\` or Civilian |
| \`family_pirate\` | \`pirate\` | Outcome-specific Pirate or Civilian |
| \`family_revolutionary\` | \`revolutionary\` | Outcome-specific Revolutionary + \`revolutionary_recruit\` or Civilian |
| \`family_royal\` | \`royal_family\` | Civilian |

The inherited profile affiliation is never rewritten by this handoff.

### Inheritance diversity

The Layer-5 persistent consequence must follow the resolved story. Items, Equipment, Berrys, Reputation, durable NPC/access/network state, Traits and other supported assets are tools, not default templates.

A complete Saga that gives the same mechanical reward family to every terminal leaf is a production defect unless a future explicit authority documents an exceptional reason.
`);
write(PATHS.major, major);

let game = read(PATHS.game);
const oldGameFamily = `Une Childhood complète contient **exactement cinq root Events de Family Saga**, dus aux checkpoints 12, 48, 84, 120 et 156 mois. Chaque chapitre est un pool horizontal de variantes et évalue l'état **actuel** du personnage au moment de sa résolution : Race, structure familiale initiale, statut/présence des parents, relations, classe sociale, History, Traits et autres Conditions réellement pertinentes.

Une seule variante est vécue par chapitre. Le chapitre entier est ensuite considéré comme terminé via History. Chaque chapitre doit posséder exactement un fallback universel, utilisé seulement lorsqu'aucune variante spécialisée n'est éligible.`;

const newGameFamily = `Une Childhood complète contient **exactement cinq root Events de Family Saga**, dus aux checkpoints 12, 48, 84, 120 et 156 mois. Ces cinq checkpoints sont les couches temporelles d'un **DAG narratif connecté**, pas cinq pools indépendants. Après la première couche, le prochain node doit être descendant du Major node réellement vécu à la couche précédente, puis filtré par l'état actuel et History.

La couche 1 conserve un fallback générique. À partir de la couche 2, les fallbacks sont **route-local** : chaque node précédent possède exactement une continuation fallback sûre, tandis que les descendants spécialisés éligibles et plus spécifiques gagnent d'abord. Les pyramides peuvent croiser, rejoindre une route partagée puis diverger à nouveau sans effacer History.`;

game = replaceRequired(game, oldGameFamily, newGameFamily, "GAME_DESIGN Family DAG");
game = appendOnce(game, "<!-- D2.11_FAMILY_QUALITY_AND_INHERITANCE -->", `
<!-- D2.11_FAMILY_QUALITY_AND_INHERITANCE -->
## D2.11 — Qualité des Family Sagas et héritage final

Marine, Pirate et Royal sont trois Sagas de **même niveau de qualité cible** avec des granularités différentes. Marine n'est pas un gold standard mesuré au nombre d'Immediate. Une scène compacte est préférable à trois panels de remplissage; une scène complexe mérite davantage de beats lorsqu'ils portent réellement réaction, confrontation, révélation ou résolution.

La qualité d'une Family Saga se juge principalement sur:

- une trajectoire reconnaissable aux cinq âges;
- des descendants qui se souviennent des choix réellement vécus;
- des Origins différents qui produisent des enfances réellement différentes;
- une identité propre à l'affiliation;
- un Layer 5 qui résout ce que le personnage hérite réellement.

L'héritage mécanique final est choisi **après** l'héritage narratif. Il peut prendre la forme de Berrys, Reputation, Item, Equipment, Trait, état NPC/réseau/accès ou autre asset persistant déjà supporté. Aucun type n'est le reward par défaut.

Le détail authoring appartient à \`docs/content/EVENT_AUTHORING_RULES.md §29\` et à \`docs/design/MAJOR_NARRATIVE_TRACKS.md D2.11\`.
`);
write(PATHS.game, game);

let bible = read(PATHS.bible);
const oldBibleFamily = `- Childhood guarantees exactly five Family Legacy chapters for the inherited playable affiliation.
- A chapter is a horizontal variant pool, not a fixed Scheduled chain.
- Race, family structure, current parent state, social class, History and location may select different variants when they materially change the scene.
- Do not create Cartesian coverage. Create a specialized variant only when the fiction is substantially different.
- Every chapter requires one safety fallback, but the fallback must not compete with eligible specialized variants.
- Five Family roots reserve 25% of Childhood; the rest of Childhood must remain broad.`;

const newBibleFamily = `- Childhood guarantees exactly five Family Legacy roots for the inherited playable affiliation, due at the five temporal checkpoints.
- The five layers form one connected descendant DAG, not independent horizontal rerolls and not a fixed Scheduled chain.
- Race, family structure, current parent state, social class, History and location may create specialized descendants when they materially change the scene.
- Do not create Cartesian coverage. Create a specialized node only when the fiction is substantially different.
- Layer 1 has one generic fallback. From Layer 2 onward, fallback coverage is route-local: every previous node has exactly one safe fallback continuation.
- Crossings may combine earlier pyramids when the same concrete situation now applies for different historical reasons; History must remain available for callbacks.
- Five Family roots reserve 25% of Childhood; the rest of Childhood must remain broad.`;

bible = replaceRequired(bible, oldBibleFamily, newBibleFamily, "CONTENT_BIBLE Family DAG");

const oldSpecial = `The reference V1 example is \`Marine × Giant\`: Marine institutional interest in Giant military strength can justify Giant-only responses, descendants and a unique inheritance milestone.`;
const newSpecial = `Validated V1 examples deliberately span different axes: \`Marine × Giant\` (institutional military interest), \`Pirate × Fish-Man\` (coercion/consent around aquatic capability), \`Royal × Orphan\` (premature burden without parents), and \`Royal × Poor / Fallen House\` (status without resources, restitution/restoration pressure). Marine × Giant is an example, not a quality benchmark and not a rule that Special Associations must be Race-based.`;
bible = replaceRequired(bible, oldSpecial, newSpecial, "CONTENT_BIBLE Special Associations");

bible = appendOnce(bible, "<!-- D2.11_INHERITANCE_CONTENT_BIBLE -->", `
<!-- D2.11_INHERITANCE_CONTENT_BIBLE -->
## D2.11 Family inheritance content rule

For Layer 5, "persistent reward" means **the persistent form of the story's resolved inheritance**, not "give the player an Item."

At Saga scale, vary inheritance forms when the fiction supports it: money, reputation, tangible objects, equipment, durable relationship/NPC state, network or access state, Traits, and other existing persistent systems. Do not create a new definition merely to make a reward look different.

A full Saga should normally exercise at least three reward families. Strong dominance by one family is a review signal, not an invitation to rebalance mechanically without regard to the story.

Any proposed animal/companion inheritance must use an existing supported NPC/companion acquisition path. Do not invent a direct companion Effect solely for a Family reward.

Every Layer-5 SELF_AUDIT must map narrative inheritance -> mechanical inheritance -> reason for that mapping.
`);
write(PATHS.bible, bible);

let economy = read(PATHS.economy);
economy = appendOnce(economy, "<!-- D2.11_FAMILY_ECONOMIC_INHERITANCE -->", `
<!-- D2.11_FAMILY_ECONOMIC_INHERITANCE -->
## 9. Family economic inheritance — D2.11

Layer-5 Family resolution may grant Berrys with \`modifyBerries\` when the fiction transfers real money or liquid value: savings, a travel fund, wages, a pirate share, a settlement, restitution, liquidation of family assets, or another explicit transfer.

This does **not** change the rule that Social Class is household context rather than an automatic child wallet.

Authoring anchors:

| Transfer scale | Suggested amount |
| --- | ---: |
| small personal stake | 2,500–7,500 |
| meaningful starting inheritance | 10,000–25,000 |
| exceptional settlement/restitution | above 25,000 only with specific justification |

For comparison, the current ship ladder begins at 5,000 Berrys for a Dinghy and 25,000 for a Sloop. Family inheritance must not casually trivialize early Active progression.

A negative money effect is a cost, not a persistent reward. Do not make a repayment scene grant money merely because the Saga needs economic variety; choose the inheritance that the scene actually resolves.
`);
write(PATHS.economy, economy);

let concept = read(PATHS.concept);
const oldMajorSection = `## Accepted V2 Major Saga structures

_None yet._`;
const newMajorSection = `## Accepted V2 Major Saga structures

### \`family_marine\` — integrated

- five-layer connected Family DAG;
- 47 structural Major roots, with deeper multi-Immediate mini-arcs where needed;
- V1 single-parent identity: father;
- high-yield Special Association: Marine × Giant;
- Layer-5 History can hand off to Marine + \`marine_recruit\` or Civilian at age 15.

### \`family_pirate\` — integrated

- five-layer connected Family DAG;
- 45 structural Major roots / 180 total authored EventDefinitions at integration;
- V1 single-parent identity: mother;
- high-yield Special Association: \`pirate_fishman_underkeel\`;
- Layer-5 History can hand off to Pirate or Civilian at age 15.

### \`family_royal\` — integrated

- five-layer connected Family DAG;
- 45 structural Major roots / 90 total authored EventDefinitions at integration;
- V1 single-parent identity: mother;
- five-layer signature paths: \`royal_orphan_burden\` and \`royal_fallen_house\`;
- Fish-Man specialization is deliberately limited to early/middle layers before rejoining shared Royal nodes;
- Active entry remains Civilian; \`royal_family\` stays inherited identity.

### Cross-Saga production lesson

Marine, Pirate and Royal are equal-quality reference implementations with different appropriate granularity. Event count and Immediate depth are not quality scores. D2.11 inheritance review also rejects mechanical reward monoculture across Layer-5 leaves.`;

concept = replaceRequired(concept, oldMajorSection, newMajorSection, "EVENT_CONCEPT_INDEX accepted Major Sagas");
write(PATHS.concept, concept);

// -----------------------------------------------------------------------------
// Save mutated Saga sources.
// -----------------------------------------------------------------------------

for (const [key, source] of Object.entries(sources)) writeJson(PATHS[key], source);

// -----------------------------------------------------------------------------
// Audit report: generated from the exact pre/post local sources.
// -----------------------------------------------------------------------------

const after = Object.fromEntries(Object.entries(sources).map(([k, v]) => [k, rewardSnapshot(v)]));

function fmtCounts(snapshot) {
  const entries = Object.entries(snapshot.counts).sort((a, b) => b[1] - a[1]);
  return entries.length ? entries.map(([k, v]) => `${k}: ${v}`).join(", ") : "none";
}

const audit = `# OPFG — Family Inheritance Reward Audit

> **Status: support / review document, not gameplay authority.**
>
> Generated by the D2.11 authority + inheritance rework patch from the exact local Marine, Pirate and Royal authoring sources.

## Purpose

The first three integrated Family Sagas exposed a production bias: the technical rule "every Layer-5 leaf needs a persistent gameplay reward" was being satisfied too mechanically.

The problem was not one universal reward type across all Sagas. It was **intra-Saga monoculture**:

- Pirate overwhelmingly converted inheritance into pocket Items;
- Royal converted essentially every terminal inheritance into Reputation;
- Marine mixed some Reputation/Equipment but still leaned heavily on keepsakes.

D2.11 changes the authoring question from "which reward satisfies the validator?" to "what did this character actually inherit from this story?"

## Mechanical distribution snapshot

Counts below are **number of Layer-5 terminal leaves carrying each reward family**. A leaf may appear in more than one family when a mixed inheritance is justified.

| Saga | Leaves | Before | After |
| --- | ---: | --- | --- |
| Marine | ${before.marine.leaves} | ${fmtCounts(before.marine)} | ${fmtCounts(after.marine)} |
| Pirate | ${before.pirate.leaves} | ${fmtCounts(before.pirate)} | ${fmtCounts(after.pirate)} |
| Royal | ${before.royal.leaves} | ${fmtCounts(before.royal)} | ${fmtCounts(after.royal)} |

## Rework principles applied

### Marine

Symbolic military objects remain when the scene is genuinely about inheriting that object. Selected civilian/deferred routes now inherit starting money, protected/open testimony state, family-name state, or an unresolved future opportunity instead of being forced to carry the same object as the enlistment branch.

The Giant training bracer remains Equipment where it is the natural physical inheritance.

### Pirate

The five existing Pirate story objects remain useful, but they are no longer automatic leaf stamps. Safe-harbor routes can inherit **network access** without carrying a key. Crew-code and no-innocents routes inherit **social rules/reputation state**. A civilian household departure can inherit a small **travel fund**. Repayment routes inherit a **settled debt/reputation state** rather than a debt ledger they no longer need.

The unresolved-debt branch deliberately keeps the physical ledger because the obligation is still literally documented there.

### Royal

Public/court routes continue to use Reputation where public standing is the natural consequence. Family-without-court and seal routes now create **relationship/access/boundary state**. The Fallen House path can resolve into **rebuild money, documented restitution, an active restitution claim, abandonment of restoration, or a name retained without entitlement**.

This makes Royal wealth contextual rather than automatic: only authored transfers grant Berrys.

## New production checks

The Saga authoring tool now:

- recognizes positive \`modifyBerries\` as a valid terminal persistent reward;
- does not allow negative Berrys to satisfy the reward requirement;
- reports a one-family Layer-5 reward monoculture as an error for mature Family Sagas;
- warns below three recognized reward families;
- warns when one family appears on more than 75% of terminal leaves.

These are production checks, not new runtime gameplay systems.

## Revolutionary / Civilian handoff

Before either remaining Family Saga is integrated, its Layer-5 SELF_AUDIT must include one row per terminal leaf:

\`\`\`text
terminal Event/Outcome
-> narrative inheritance
-> mechanical inheritance
-> exact Effect(s)
-> why this mechanic follows from the story
-> future hook
\`\`\`

Do not pre-allocate reward categories. Draft the inheritance first, then encode it.

Expected Active handoff remains:

- Civilian -> Civilian;
- Revolutionary -> outcome-specific Revolutionary + \`revolutionary_recruit\` or Civilian;
- mutation occurs at 180 months, never inside Layer-5 Childhood Events.
`;

write("docs/content/events/v2/FAMILY_INHERITANCE_REWARD_AUDIT.md", audit);

// -----------------------------------------------------------------------------
// Final local structural assertions (not engine tests).
// -----------------------------------------------------------------------------

for (const [key, source] of Object.entries(sources)) {
  const snapshot = after[key];
  if (snapshot.leaves < 6) fail(`${source.sagaId}: unexpectedly few Layer-5 leaves (${snapshot.leaves}).`);
  const families = Object.keys(snapshot.counts);
  if (families.length < 3) fail(`${source.sagaId}: rework still has fewer than 3 reward families: ${families.join(", ")}`);
  if (!source.rules.persistentRewardEffectTypes.includes("modifyBerries")) {
    fail(`${source.sagaId}: modifyBerries missing from persistentRewardEffectTypes.`);
  }
}

// No early career mutation may be introduced.
for (const source of Object.values(sources)) {
  const earlyCareer = source.events
    .filter((e) => e.majorTrack?.chapterId !== undefined || e.kind === "immediate")
    .flatMap(allOutcomes)
    .flatMap((o) => o.effects ?? [])
    .filter((e) => e.type === "setCareerAffiliation");
  // Marine source historically may contain none after D2.9 handoff rework.
  if (earlyCareer.length > 0) fail(`${source.sagaId}: setCareerAffiliation found in authored Childhood Events after rework.`);
}

console.log("D2.11 Family authority + inheritance rework applied.");
console.log("");
for (const key of ["marine", "pirate", "royal"]) {
  console.log(`${key}: ${before[key].leaves} Layer-5 leaves`);
  console.log(`  before: ${fmtCounts(before[key])}`);
  console.log(`  after : ${fmtCounts(after[key])}`);
}
console.log("");
console.log("Updated authorities:");
console.log("  docs/GAME_DESIGN.md");
console.log("  docs/design/MAJOR_NARRATIVE_TRACKS.md");
console.log("  docs/content/EVENT_AUTHORING_RULES.md");
console.log("  docs/content/CONTENT_BIBLE.md");
console.log("  docs/design/ECONOMY_AND_ITEMS.md");
console.log("  docs/content/events/v2/EVENT_CONCEPT_INDEX_V2.md");
console.log("  docs/content/events/v2/FAMILY_INHERITANCE_REWARD_AUDIT.md");
console.log("Updated production tooling:");
console.log("  scripts/saga-content/lib.ts");
console.log("Updated Saga authoring sources:");
console.log("  family_marine / family_pirate / family_royal");
