import locations from '../content/data/locationsV1.json';
import fruits from '../content/data/devilFruitsV1.json';

const traitNames: Record<string, [string, string]> = {
  audacious: ['Audacieux', 'Audacious'], cautious: ['Prudent', 'Cautious'], merciful: ['Clément', 'Merciful'], ruthless: ['Impitoyable', 'Ruthless'],
  generous: ['Généreux', 'Generous'], greedy: ['Cupide', 'Greedy'], disciplined: ['Discipliné', 'Disciplined'], rebellious: ['Rebelle', 'Rebellious'],
  sociable: ['Sociable', 'Sociable'], solitary: ['Solitaire', 'Solitary'], patient: ['Patient', 'Patient'], impulsive: ['Impulsif', 'Impulsive'],
  honest: ['Honnête', 'Honest'], deceptive: ['Fourbe', 'Deceptive'], loyal: ['Loyal', 'Loyal'], disloyal: ['Déloyal', 'Disloyal'],
  forgiving: ['Sans rancune', 'Forgiving'], vengeful: ['Vindictif', 'Vengeful'], trusting: ['Confiant', 'Trusting'], suspicious: ['Méfiant', 'Suspicious'],
  resilient: ['Résilient', 'Resilient'], curious: ['Curieux', 'Curious'], ambitious: ['Ambitieux', 'Ambitious'], superstitious: ['Superstitieux', 'Superstitious'],
  competitive: ['Compétitif', 'Competitive'], protective: ['Protecteur', 'Protective'], resourceful: ['Débrouillard', 'Resourceful'], proud: ['Fier', 'Proud'],
};
const traitMeanings: Record<string, [string, string]> = {
  audacious: ['Agit malgré le risque et saisit les occasions dangereuses.', 'Acts despite risk; seizes dangerous opportunities.'], cautious: ['Évalue les risques évitables avant d’agir.', 'Evaluates avoidable risk before acting.'], merciful: ['Évite les souffrances inutiles et accepte la clémence ou la reddition.', 'Avoids unnecessary suffering; accepts mercy/surrender.'], ruthless: ['Accepte les mesures dures lorsqu’un obstacle doit être éliminé.', 'Accepts harsh measures when an obstacle must be removed.'],
  generous: ['Partage volontiers ressources, temps et gains.', 'Shares resources/time/gains willingly.'], greedy: ['Privilégie l’acquisition et la conservation des richesses et ressources.', 'Prioritizes acquiring and keeping wealth/resources.'], disciplined: ['Respecte responsabilités, règles et plans établis.', 'Follows responsibilities, rules and established plans.'], rebellious: ['Résiste aux règles et à l’autorité imposées.', 'Resists imposed rules and authority.'],
  sociable: ['Recherche la compagnie et crée des liens.', 'Seeks company and builds connections.'], solitary: ['Préfère agir seul et garder ses distances avec les groupes.', 'Prefers acting alone and keeping distance from groups.'], patient: ['Attend, observe et prépare plutôt que de se précipiter.', 'Waits, observes and prepares rather than rushing.'], impulsive: ['Suit son premier instinct avant d’envisager toutes les conséquences.', 'Acts on first instinct before considering all consequences.'],
  honest: ['Préfère la vérité à l’avantage obtenu par le mensonge.', 'Prefers truth over advantage through lying.'], deceptive: ['Recourt volontiers au mensonge, au bluff et à la manipulation.', 'Uses lies, bluff and manipulation willingly.'], loyal: ['Tient ses engagements envers personnes et groupes même au prix fort.', 'Keeps commitments to people/groups even when costly.'], disloyal: ['Peut rompre allégeance et confiance lorsque ses intérêts ou objectifs changent.', 'Is willing to break allegiance/trust when interests or goals change.'],
  forgiving: ['Laisse les anciennes offenses derrière lui et accepte la réconciliation.', 'Lets old offenses go and accepts reconciliation.'], vengeful: ['Cherche réparation ou vengeance pour les torts anciens.', 'Pursues repayment/revenge for old wrongs.'], trusting: ['Accorde aux personnes et propositions le bénéfice du doute.', 'Gives people/proposals the benefit of the doubt.'], suspicious: ['Recherche les motifs cachés, pièges et incohérences.', 'Looks for hidden motives, traps and inconsistencies.'],
  resilient: ['Se relève des revers et continue après l’adversité.', 'Recovers from setbacks and continues after adversity.'], curious: ['Recherche lieux inconnus, explications et découvertes.', 'Seeks unknown places, explanations and discoveries.'], ambitious: ['Recherche davantage de responsabilités, de prestige et d’accomplissements durables.', 'Seeks greater responsibility, prestige and lasting achievement.'], superstitious: ['Accorde du poids aux présages, malédictions, légendes et signes surnaturels.', 'Gives weight to omens, curses, legends and supernatural signs.'],
  competitive: ['Transforme comparaison et défi en désir de surpasser les autres.', 'Turns comparison/challenge into a desire to outperform others.'], protective: ['Se sent responsable de protéger les vulnérables et ses proches alliés.', 'Feels responsible for protecting vulnerable people or close allies.'], resourceful: ['Trouve des solutions pratiques avec les moyens disponibles.', 'Finds practical, workable solutions with available means; absorbs the former pragmatic concept.'], proud: ['Valorise sa dignité et réagit fortement à l’humiliation ou au mépris.', 'Values dignity and reacts strongly to humiliation or contempt.'],
};
const ranks: Record<string, [string, string]> = {
  marine_recruit: ['Recrue', 'Recruit'], marine_petty_officer: ['Officier marinier', 'Petty Officer'], marine_lieutenant: ['Lieutenant', 'Lieutenant'], marine_commander: ['Commandant', 'Commander'], marine_captain: ['Capitaine', 'Captain'], marine_commodore: ['Commodore', 'Commodore'], marine_rear_admiral: ['Contre-amiral', 'Rear Admiral'], marine_vice_admiral: ['Vice-amiral', 'Vice Admiral'], marine_admiral: ['Amiral', 'Admiral'], marine_fleet_admiral: ['Amiral en chef', 'Fleet Admiral'],
  revolutionary_recruit: ['Recrue révolutionnaire', 'Revolutionary Recruit'], revolutionary_agent: ['Agent révolutionnaire', 'Revolutionary Agent'], revolutionary_operator: ['Opérateur révolutionnaire', 'Revolutionary Operator'], revolutionary_officer: ['Officier révolutionnaire', 'Revolutionary Officer'], revolutionary_regional_commander: ['Commandant régional', 'Regional Commander'],
  bounty_hunter_novice: ['Chasseur novice', 'Novice Hunter'], bounty_hunter_tracker: ['Pisteur', 'Tracker'], bounty_hunter_confirmed: ['Chasseur confirmé', 'Confirmed Hunter'], bounty_hunter_elite: ['Chasseur d’élite', 'Elite Hunter'], bounty_hunter_master: ['Maître chasseur', 'Master Hunter'],
};
const roles: Record<string, [string, string]> = { navigator: ['Navigateur', 'Navigator'], medic: ['Médecin', 'Medic'], cook: ['Cuisinier', 'Cook'], shipwright: ['Charpentier naval', 'Shipwright'], helmsman: ['Timonier', 'Helmsman'], gunner: ['Canonnier', 'Gunner'], musician: ['Musicien', 'Musician'], scholar: ['Érudit', 'Scholar'], fighter: ['Combattant', 'Fighter'], quartermaster: ['Quartier-maître', 'Quartermaster'] };
const ships: Record<string, [string, string]> = { dinghy: ['Chaloupe', 'Dinghy'], sloop: ['Sloop', 'Sloop'], caravel: ['Caravelle', 'Caravel'], brig: ['Brick', 'Brig'], merchant_ship: ['Navire marchand', 'Merchant Ship'], galleon: ['Galion', 'Galleon'] };

export function createCatalogDictionary(locale: 'fr' | 'en'): Record<string, string> {
  const language = locale === 'fr' ? 0 : 1;
  const dictionary: Record<string, string> = {};
  const seas: Record<string, [string, string]> = { grand_line_paradise: ['Grand Line — Paradis', 'Grand Line — Paradise'], new_world: ['Nouveau Monde', 'New World'], sky: ['Ciel', 'Sky'], underwater: ['Sous-marin', 'Underwater'], calm_belt: ['Calm Belt', 'Calm Belt'], red_line: ['Red Line', 'Red Line'] };
  for (const [id, names] of Object.entries(seas)) dictionary[`sea.${id}.name`] = names[language];
  for (const [id, names] of Object.entries(traitNames)) {
    dictionary[`trait.${id}.name`] = names[language];
    dictionary[`trait.${id}.description`] = traitMeanings[id][language];
  }
  for (const [id, names] of Object.entries(ranks)) dictionary[`careerRank.${id}.name`] = names[language];
  for (const [id, names] of Object.entries(roles)) dictionary[`crewRole.${id}.name`] = names[language];
  for (const [id, names] of Object.entries(ships)) dictionary[`ship.${id}.name`] = names[language];
  for (const { id, name } of [...locations.blueLocations, ...locations.outsideBlueLocations]) dictionary[`location.${id}.name`] = name;
  for (const { id, displayName, playableV1 } of fruits.fruits) {
    dictionary[`devilFruit.${id}.name`] = displayName;
    if (playableV1) dictionary[`item.${id}_fruit_item.name`] = displayName;
  }
  dictionary['npc.player_parent_1.name'] = locale === 'fr' ? 'Parent 1' : 'Parent 1';
  dictionary['npc.player_parent_2.name'] = locale === 'fr' ? 'Parent 2' : 'Parent 2';
  Object.assign(dictionary, locale === 'fr' ? {
    'event.dead_end_on_land.title': 'Le large appelle', 'event.dead_end_on_land.text': 'Aucune nouvelle piste ne se présente ici, mais la mer reste ouverte.',
    'event.dead_end_on_land.choice.resume_voyage.text': 'Reprendre la mer', 'event.dead_end_on_land.choice.resume_voyage.outcome.back_at_sea.text': 'Vous gagnez le point d’accès maritime le plus proche et larguez les amarres.',
    'event.dead_end_at_sea.title': 'Une côte à l’horizon', 'event.dead_end_at_sea.text': 'Les courants finissent par révéler une continuation sûre.',
    'event.dead_end_at_sea.choice.follow_currents.text': 'Suivre les courants', 'event.dead_end_at_sea.choice.follow_currents.outcome.safe_landfall.text': 'Vous atteignez une destination où poursuivre votre histoire.',
  } : {
    'event.dead_end_on_land.title': 'The Open Sea Calls', 'event.dead_end_on_land.text': 'No new lead presents itself here, but the sea remains open.',
    'event.dead_end_on_land.choice.resume_voyage.text': 'Return to sea', 'event.dead_end_on_land.choice.resume_voyage.outcome.back_at_sea.text': 'You reach the nearest maritime access and cast off.',
    'event.dead_end_at_sea.title': 'Land on the Horizon', 'event.dead_end_at_sea.text': 'The currents eventually reveal a safe continuation.',
    'event.dead_end_at_sea.choice.follow_currents.text': 'Follow the currents', 'event.dead_end_at_sea.choice.follow_currents.outcome.safe_landfall.text': 'You reach a destination where your story can continue.',
  });
  return dictionary;
}
