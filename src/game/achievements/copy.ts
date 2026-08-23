import type { LocaleId } from '../localization';
import type { AchievementFamily, AchievementId } from './model';

export interface AchievementText {
  name: string;
  description: string;
}

const fr: Record<AchievementId, AchievementText> = {
  progression_first_active: { name: 'Le grand départ', description: "Atteindre la phase Active pour la première fois." },
  origins_human_childhood: { name: 'Enfance humaine', description: "Terminer une Childhood en tant qu'Humain." },
  origins_fishman_childhood: { name: 'Enfant des profondeurs', description: 'Terminer une Childhood en tant qu’Homme-Poisson.' },
  origins_mink_childhood: { name: 'Enfant de Zou', description: 'Terminer une Childhood en tant que Mink.' },
  origins_giant_childhood: { name: 'Enfant des géants', description: 'Terminer une Childhood en tant que Géant.' },
  origins_all_playable_races: { name: 'Toutes les enfances', description: 'Terminer une Childhood avec chacune des races jouables.' },
  family_civilian_collection: { name: 'Souvenirs civils', description: 'Obtenir les trois souvenirs uniques de l’enfance Civil.' },
  family_marine_collection: { name: 'Souvenirs de la Marine', description: 'Obtenir les trois souvenirs uniques de l’enfance Marine.' },
  family_pirate_collection: { name: 'Souvenirs pirates', description: 'Obtenir les trois souvenirs uniques de l’enfance Pirate.' },
  family_revolutionary_collection: { name: 'Souvenirs révolutionnaires', description: 'Obtenir les trois souvenirs uniques de l’enfance Révolutionnaire.' },
  family_all_collections: { name: 'Une enfance bien remplie', description: 'Compléter les quatre collections de souvenirs de Childhood.' },
  grade_marine_fleet_admiral: { name: 'Au sommet de la Marine', description: 'Atteindre le grade d’Amiral en chef.' },
  bounty_100m: { name: '100 millions', description: 'Atteindre une prime de 100 000 000 Berrys.' },
  power_first_devil_fruit: { name: 'Un fruit bien étrange', description: 'Manger un Fruit du Démon.' },
  power_haki_observation: { name: 'Haki de l’Observation', description: 'Éveiller le Haki de l’Observation.' },
  power_haki_armament: { name: 'Haki de l’Armement', description: 'Éveiller le Haki de l’Armement.' },
  world_start_all_blues: { name: 'Les quatre Blues', description: 'Commencer au moins une partie dans chacun des quatre Blues.' },
  world_reach_paradise: { name: 'Bienvenue à Paradise', description: 'Atteindre Paradise.' },
  world_reach_new_world: { name: 'Le Nouveau Monde', description: 'Atteindre le New World.' },
  crew_first_member: { name: 'Premier nakama', description: 'Recruter ton premier membre d’équipage.' },
  ending_first: { name: 'Une destinée', description: 'Terminer une carrière pour la première fois.' },
};

const en: Record<AchievementId, AchievementText> = {
  progression_first_active: { name: 'The Great Departure', description: 'Reach the Active phase for the first time.' },
  origins_human_childhood: { name: 'Human Childhood', description: 'Complete a Childhood as a Human.' },
  origins_fishman_childhood: { name: 'Child of the Depths', description: 'Complete a Childhood as a Fish-Man.' },
  origins_mink_childhood: { name: 'Child of Zou', description: 'Complete a Childhood as a Mink.' },
  origins_giant_childhood: { name: 'Child of Giants', description: 'Complete a Childhood as a Giant.' },
  origins_all_playable_races: { name: 'Every Childhood', description: 'Complete a Childhood with every playable race.' },
  family_civilian_collection: { name: 'Civilian Keepsakes', description: 'Obtain the three unique Civilian childhood keepsakes.' },
  family_marine_collection: { name: 'Marine Keepsakes', description: 'Obtain the three unique Marine childhood keepsakes.' },
  family_pirate_collection: { name: 'Pirate Keepsakes', description: 'Obtain the three unique Pirate childhood keepsakes.' },
  family_revolutionary_collection: { name: 'Revolutionary Keepsakes', description: 'Obtain the three unique Revolutionary childhood keepsakes.' },
  family_all_collections: { name: 'A Childhood Well Lived', description: 'Complete all four Childhood keepsake collections.' },
  grade_marine_fleet_admiral: { name: 'At the Top of the Marines', description: 'Reach the rank of Fleet Admiral.' },
  bounty_100m: { name: '100 Million', description: 'Reach a bounty of 100,000,000 Berries.' },
  power_first_devil_fruit: { name: 'A Strange Fruit', description: 'Eat a Devil Fruit.' },
  power_haki_observation: { name: 'Observation Haki', description: 'Awaken Observation Haki.' },
  power_haki_armament: { name: 'Armament Haki', description: 'Awaken Armament Haki.' },
  world_start_all_blues: { name: 'The Four Blues', description: 'Start at least one run in each of the four Blues.' },
  world_reach_paradise: { name: 'Welcome to Paradise', description: 'Reach Paradise.' },
  world_reach_new_world: { name: 'The New World', description: 'Reach the New World.' },
  crew_first_member: { name: 'First Nakama', description: 'Recruit your first crewmate.' },
  ending_first: { name: 'A Destiny', description: 'Complete a career for the first time.' },
};

export const ACHIEVEMENT_FAMILY_LABELS: Record<LocaleId, Record<AchievementFamily, string>> = {
  fr: {
    progression: 'Progression', origins: 'Origins', family: 'Family Saga', grades: 'Grades', bounty: 'Prime',
    powers: 'Pouvoirs', world: 'Monde', crew: 'Équipage', endings: 'Fins',
  },
  en: {
    progression: 'Progression', origins: 'Origins', family: 'Family Saga', grades: 'Ranks', bounty: 'Bounty',
    powers: 'Powers', world: 'World', crew: 'Crew', endings: 'Endings',
  },
};

export const ACHIEVEMENT_UI_COPY = {
  fr: { unlocked: 'Achievement débloqué', progress: 'débloqués' },
  en: { unlocked: 'Achievement unlocked', progress: 'unlocked' },
} as const;

export const getAchievementText = (id: AchievementId, locale: LocaleId): AchievementText =>
  (locale === 'fr' ? fr : en)[id];
