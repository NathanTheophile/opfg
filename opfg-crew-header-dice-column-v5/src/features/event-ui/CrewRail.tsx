import {
  Brain,
  ChevronRight,
  Clover,
  Compass,
  Dumbbell,
  Eye,
  Hammer,
  Heart,
  HeartPulse,
  MessageCircle,
  Music2,
  Smile,
  Sparkles,
  Swords,
  Utensils,
} from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { Panel } from '@/components/ui';
import './crew-rail.css';

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

interface CrewStat {
  id: string;
  label: string;
  value: number | string;
  icon: IconType;
}

interface CrewMemberPreview {
  id: string;
  name: string;
  role: string;
  roleIcon: IconType;
  stats: CrewStat[];
}

const STAT_ICONS: Record<string, IconType> = {
  health: Heart,
  morale: Smile,
  strength: Dumbbell,
  observation: Eye,
  intelligence: Brain,
  navigation: Compass,
  charisma: MessageCircle,
  luck: Clover,
  awakening: Sparkles,
};

function stats(values: Array<number | string>): CrewStat[] {
  return [
    { id: 'health', label: 'Santé', value: values[0], icon: STAT_ICONS.health },
    { id: 'morale', label: 'Moral', value: values[1], icon: STAT_ICONS.morale },
    { id: 'strength', label: 'Force', value: values[2], icon: STAT_ICONS.strength },
    { id: 'observation', label: 'Observation', value: values[3], icon: STAT_ICONS.observation },
    { id: 'intelligence', label: 'Intelligence', value: values[4], icon: STAT_ICONS.intelligence },
    { id: 'navigation', label: 'Navigation', value: values[5], icon: STAT_ICONS.navigation },
    { id: 'charisma', label: 'Charisme', value: values[6], icon: STAT_ICONS.charisma },
    { id: 'luck', label: 'Chance', value: values[7], icon: STAT_ICONS.luck },
    { id: 'awakening', label: 'Éveil', value: values[8], icon: STAT_ICONS.awakening },
  ];
}

const MOCK_CREW: CrewMemberPreview[] = [
  {
    id: 'nami',
    name: 'Nami',
    role: 'Navigatrice',
    roleIcon: Compass,
    stats: stats([24, 31, 14, 34, 32, 41, 27, 29, '—']),
  },
  {
    id: 'zoro',
    name: 'Zoro',
    role: 'Combattant',
    roleIcon: Swords,
    stats: stats([38, 30, 43, 31, 18, 12, 15, 21, '—']),
  },
  {
    id: 'sanji',
    name: 'Sanji',
    role: 'Cuisinier',
    roleIcon: Utensils,
    stats: stats([32, 28, 35, 30, 25, 17, 32, 20, '—']),
  },
  {
    id: 'chopper',
    name: 'Chopper',
    role: 'Médecin',
    roleIcon: HeartPulse,
    stats: stats([29, 34, 28, 26, 39, 15, 22, 25, '—']),
  },
  {
    id: 'franky',
    name: 'Franky',
    role: 'Charpentier',
    roleIcon: Hammer,
    stats: stats([40, 35, 39, 24, 33, 20, 29, 18, '—']),
  },
  {
    id: 'brook',
    name: 'Brook',
    role: 'Musicien',
    roleIcon: Music2,
    stats: stats([26, 38, 27, 31, 24, 18, 36, 30, '—']),
  },
];

export function CrewRail() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="opfg-crew-rail" aria-label="Équipage">
      <Panel
        variant="strong"
        padding="none"
        className="opfg-crew-header"
        aria-label={`Équipage ${MOCK_CREW.length} sur 10`}
      >
        <span>CREW</span>
        <strong>{MOCK_CREW.length}/10</strong>
      </Panel>

      {MOCK_CREW.map((member) => {
        const RoleIcon = member.roleIcon;
        const expanded = expandedId === member.id;

        return (
          <Panel
            key={member.id}
            variant="strong"
            padding="none"
            className={`opfg-crew-member-panel ${expanded ? 'is-expanded' : ''}`}
          >
            <button
              type="button"
              className="opfg-crew-member__toggle"
              onClick={() => setExpandedId((current) => current === member.id ? null : member.id)}
              aria-expanded={expanded}
              aria-label={`${expanded ? 'Replier' : 'Déplier'} ${member.name}`}
            >
              <span
                className="opfg-crew-member__role"
                data-tooltip={member.role}
                aria-label={member.role}
              >
                <RoleIcon className="size-[1.05rem]" aria-hidden="true" />
              </span>

              <strong className="opfg-crew-member__name">{member.name}</strong>

              <ChevronRight
                className="opfg-crew-member__chevron size-4"
                aria-hidden="true"
              />
            </button>

            <div className="opfg-crew-member__stats" aria-hidden={!expanded}>
              {member.stats.map((stat) => {
                const StatIcon = stat.icon;

                return (
                  <span
                    key={stat.id}
                    className="opfg-crew-stat"
                    data-stat={stat.id}
                    data-tooltip={stat.label}
                  >
                    <StatIcon className="size-3" aria-hidden="true" />
                    <b>{stat.value}</b>
                  </span>
                );
              })}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}
