export type UITunerSectionId =
  | 'foundation'
  | 'shared'
  | 'hud'
  | 'event'
  | 'stats'
  | 'crew'
  | 'outcome'
  | 'tooltips'
  | 'glass'
  | 'palette';

export type UITunerRangeDefinition = {
  kind: 'range';
  id: string;
  label: string;
  description?: string;
  section: UITunerSectionId;
  variable: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unit: string;
};

export type UITunerColorDefinition = {
  kind: 'color';
  id: string;
  label: string;
  description?: string;
  section: UITunerSectionId;
  variable: string;
  defaultValue: string;
};

export type UITunerDefinition =
  | UITunerRangeDefinition
  | UITunerColorDefinition;

export type UITunerValue = number | string;
export type UITunerValues = Record<string, UITunerValue>;

export const UI_TUNER_SECTIONS: Array<{
  id: UITunerSectionId;
  label: string;
}> = [
  { id: 'foundation', label: 'Fondations' },
  { id: 'shared', label: 'Autorités partagées' },
  { id: 'hud', label: 'HUD supérieur' },
  { id: 'event', label: 'Events / Choices' },
  { id: 'stats', label: 'Stats joueur' },
  { id: 'crew', label: 'Crew' },
  { id: 'outcome', label: 'Outcomes' },
  { id: 'tooltips', label: 'Tooltips' },
  { id: 'glass', label: 'Boutons glass' },
  { id: 'palette', label: 'Palette stats' },
];

const range = (
  id: string,
  label: string,
  section: UITunerSectionId,
  variable: string,
  defaultValue: number,
  min: number,
  max: number,
  step: number,
  unit: string,
  description?: string,
): UITunerRangeDefinition => ({
  kind: 'range',
  id,
  label,
  section,
  variable,
  defaultValue,
  min,
  max,
  step,
  unit,
  description,
});

const color = (
  id: string,
  label: string,
  section: UITunerSectionId,
  variable: string,
  defaultValue: string,
  description?: string,
): UITunerColorDefinition => ({
  kind: 'color',
  id,
  label,
  section,
  variable,
  defaultValue,
  description,
});

export const UI_TUNER_DEFINITIONS: UITunerDefinition[] = [
  // Foundation: mirrors the centralized tunable bridge in ui-system.css.
  range('layoutGutter', 'Gouttière globale', 'foundation', '--ui-layout-gutter', 16, 8, 48, 1, 'px'),
  range('panelRadius', 'Radius panels', 'foundation', '--ui-panel-radius', 16, 0, 32, 1, 'px'),
  range('controlRadius', 'Radius contrôles', 'foundation', '--ui-control-radius', 12, 0, 24, 1, 'px'),
  range('surfaceSoftAlpha', 'Opacité surface soft', 'foundation', '--ui-surface-soft-alpha', 48, 0, 100, 1, '%'),
  range('surfaceAlpha', 'Opacité surface', 'foundation', '--ui-surface-alpha', 68, 0, 100, 1, '%'),
  range('surfaceRaisedAlpha', 'Opacité surface raised', 'foundation', '--ui-surface-raised-alpha', 82, 0, 100, 1, '%'),
  range('surfaceStrongAlpha', 'Opacité surface strong', 'foundation', '--ui-surface-strong-alpha', 92, 0, 100, 1, '%'),
  range('borderSubtleAlpha', 'Alpha bordure subtile', 'foundation', '--ui-border-subtle-alpha', 12, 0, 80, 1, '%'),
  range('borderDefaultAlpha', 'Alpha bordure normale', 'foundation', '--ui-border-default-alpha', 20, 0, 80, 1, '%'),
  range('borderStrongAlpha', 'Alpha bordure forte', 'foundation', '--ui-border-strong-alpha', 32, 0, 90, 1, '%'),
  range('shadowControlAlpha', 'Ombre contrôles', 'foundation', '--ui-shadow-control-alpha', 20, 0, 70, 1, '%'),
  range('shadowPanelAlpha', 'Ombre panels', 'foundation', '--ui-shadow-panel-alpha', 30, 0, 70, 1, '%'),
  range('shadowOverlayAlpha', 'Ombre overlays', 'foundation', '--ui-shadow-overlay-alpha', 42, 0, 80, 1, '%'),
  range('motionFast', 'Motion rapide', 'foundation', '--ui-motion-fast', 120, 1, 500, 5, 'ms'),
  range('motionNormal', 'Motion normale', 'foundation', '--ui-motion-normal', 180, 1, 700, 5, 'ms'),
  range('motionSlow', 'Motion lente', 'foundation', '--ui-motion-slow', 280, 1, 1000, 5, 'ms'),

  // Shared authorities from tokens.css. These are consumed by several component families.
  range('panelHeadingSize', 'Titre compact — taille', 'shared', '--ui-panel-heading-size', 0.68, 0.45, 1.2, 0.01, 'rem'),
  range('panelHeadingWeight', 'Titre compact — graisse', 'shared', '--ui-panel-heading-weight', 800, 400, 950, 10, ''),
  range('panelHeadingTracking', 'Titre compact — tracking', 'shared', '--ui-panel-heading-tracking', 0.13, 0, 0.3, 0.01, 'em'),
  range('panelHeadingLineHeight', 'Titre compact — interligne', 'shared', '--ui-panel-heading-line-height', 1.1, 0.8, 1.8, 0.05, ''),
  range('parchmentMarginInline', 'Parchemin — marge X', 'shared', '--ui-parchment-margin-inline', 0.72, 0, 2, 0.01, 'rem'),
  range('parchmentPaddingInline', 'Parchemin — padding X', 'shared', '--ui-parchment-padding-inline', 0.78, 0, 2, 0.01, 'rem'),
  range('parchmentMobileMarginInline', 'Parchemin mobile — marge X', 'shared', '--ui-parchment-mobile-margin-inline', 0.5, 0, 1.5, 0.01, 'rem'),
  range('parchmentMobilePaddingInline', 'Parchemin mobile — padding X', 'shared', '--ui-parchment-mobile-padding-inline', 0.68, 0, 1.5, 0.01, 'rem'),
  range('nineSliceOpacityDefault', 'Nine-slice — opacité', 'shared', '--opfg-nine-slice-opacity-default', 0.9, 0, 1, 0.01, ''),
  range('nineSliceOpacityMuted', 'Nine-slice muted — opacité', 'shared', '--opfg-nine-slice-opacity-muted', 0.65, 0, 1, 0.01, ''),
  range('nineSliceOverlap', 'Nine-slice — overlap anti-seam', 'shared', '--opfg-nine-slice-overlap', 2, 0, 5, 0.25, 'px'),
  range('hoverBrightness', 'Hover — luminosité commune', 'shared', '--ui-hover-brightness', 1.08, 0.8, 1.35, 0.01, ''),

  // HUD. Header geometry is shared by Inventory / Ship / Crew headers.
  range('hudGroupGap', 'Gap du trio', 'hud', '--ui-hud-group-gap', 7, 0, 36, 1, 'px'),
  range('hudSideWidth', 'Largeur Inventaire / Bateau', 'hud', '--ui-hud-side-width', 256, 180, 360, 2, 'px'),
  range('hudCenterWidth', 'Largeur panel central', 'hud', '--ui-hud-center-width', 480, 360, 700, 2, 'px'),
  range('hudPanelMinHeight', 'Hauteur panneaux', 'hud', '--ui-hud-panel-min-height', 96, 96, 190, 1, 'px'),
  range('hudIdentityPx', 'Identité — padding X', 'hud', '--ui-hud-panel-px', 14, 5, 30, 1, 'px', 'Le padding vertical historique est désormais surchargé par les autorités de composition et n’est plus exposé.'),
  range('hudHeaderMinHeight', 'Header partagé — hauteur min', 'hud', '--opfg-hud-header-min-height', 3, 1.5, 4, 0.05, 'rem'),
  range('hudHeaderIconColumn', 'Header partagé — colonne icône', 'hud', '--opfg-hud-header-icon-column', 2.05, 1, 3, 0.05, 'rem'),
  range('hudHeaderColumnGap', 'Header partagé — gap', 'hud', '--opfg-hud-header-column-gap', 0.35, 0, 1.25, 0.05, 'rem'),
  range('hudNameSize', 'Nom joueur', 'hud', '--ui-hud-name-size', 20, 12, 32, 0.5, 'px'),
  range('hudTitleSize', 'Titre / affiliation', 'hud', '--ui-hud-title-size', 10.5, 7, 18, 0.1, 'px'),
  range('hudInfoSize', 'Infos centrales', 'hud', '--ui-hud-info-size', 11.5, 8, 18, 0.1, 'px'),
  range('hudInfoColumnGap', 'Gap colonnes centrales', 'hud', '--ui-hud-info-column-gap', 16, 4, 42, 1, 'px'),
  range('hudInfoRowGap', 'Gap lignes centrales', 'hud', '--ui-hud-info-row-gap', 3, 0, 14, 1, 'px'),
  range('hudSlotSize', 'Taille slots', 'hud', '--ui-hud-slot-size', 31, 22, 48, 0.5, 'px'),
  range('hudSlotGap', 'Gap slots', 'hud', '--ui-hud-slot-gap', 5, 0, 15, 0.5, 'px'),
  range('hudSlotRadius', 'Radius slots', 'hud', '--ui-hud-slot-radius', 6, 0, 16, 0.5, 'px'),
  range('hudMonthPipWidth', 'Largeur jauges mensuelles', 'hud', '--ui-hud-month-pip-width', 32, 14, 60, 1, 'px'),
  range('hudMonthPipHeight', 'Hauteur jauges mensuelles', 'hud', '--ui-hud-month-pip-height', 7, 3, 14, 0.5, 'px'),
  range('hudMonthPipGap', 'Gap jauges mensuelles', 'hud', '--ui-hud-month-pip-gap', 5, 0, 16, 0.5, 'px'),
  range('hudMonthPipRadius', 'Radius jauges mensuelles', 'hud', '--ui-hud-month-pip-radius', 999, 0, 999, 1, 'px'),
  range('hudShipIconSize', 'Icône bateau', 'hud', '--ui-hud-ship-icon-size', 35, 24, 58, 1, 'px'),
  range('mobileDrawerWidth', 'Largeur tiroirs mobile', 'hud', '--ui-mobile-drawer-width', 336, 240, 480, 4, 'px'),
  range('adventureStackGap', 'Gap Event / Conséquence', 'hud', '--ui-adventure-stack-gap', 8, 0, 30, 1, 'px'),

  // Event / choices. Body horizontal geometry now comes from shared parchment tokens.
  range('eventHeaderPx', 'Header X', 'event', '--ui-event-header-px', 10, 4, 48, 1, 'px'),
  range('eventHeaderPt', 'Header haut', 'event', '--ui-event-header-pt', 14.4, 4, 36, 0.1, 'px'),
  range('eventHeaderPb', 'Header bas', 'event', '--ui-event-header-pb', 7.7, 0, 36, 0.1, 'px'),
  range('eventTitleSize', 'Titre Event', 'event', '--ui-event-title-size', 16.3, 12, 40, 0.1, 'px'),
  range('eventBodySize', 'Corps Event', 'event', '--ui-event-body-size', 14.7, 10, 24, 0.1, 'px'),
  range('eventBodyLeading', 'Interligne Event', 'event', '--ui-event-body-leading', 21.8, 14, 38, 0.1, 'px'),
  range('eventChoiceAreaPx', 'Zone Choices — X', 'event', '--ui-event-choice-area-px', 10, 0, 40, 0.5, 'px'),
  range('eventChoiceAreaPy', 'Zone Choices — Y', 'event', '--ui-event-choice-area-py', 8, 0, 30, 0.5, 'px'),
  range('choiceMinHeight', 'Hauteur Choice', 'event', '--ui-choice-min-height', 32, 30, 92, 0.2, 'px'),
  range('choiceGap', 'Gap Choices', 'event', '--ui-choice-gap', 5, 0, 28, 0.2, 'px'),
  range('choicePx', 'Choice X', 'event', '--ui-choice-px', 12.5, 4, 40, 0.5, 'px'),
  range('choicePy', 'Choice Y', 'event', '--ui-choice-py', 8, 2, 28, 0.1, 'px'),
  range('choiceRadius', 'Radius Choice', 'event', '--ui-choice-radius', 8, 0, 28, 0.5, 'px'),
  range('choiceTextSize', 'Texte Choice', 'event', '--ui-choice-text-size', 12, 9, 22, 0.1, 'px'),

  // Player stats rail.
  range('statsCompactWidth', 'Rail fermé', 'stats', '--ui-stats-compact-width', 84, 58, 130, 1, 'px'),
  range('statsExpandedWidth', 'Rail ouvert', 'stats', '--ui-stats-expanded-width', 224, 150, 340, 1, 'px'),
  range('statsListPx', 'Liste — padding X', 'stats', '--ui-stats-list-px', 7, 0, 24, 0.5, 'px'),
  range('statsListPt', 'Liste — padding haut', 'stats', '--ui-stats-list-pt', 13, 0, 30, 0.5, 'px'),
  range('statsListPb', 'Liste — padding bas', 'stats', '--ui-stats-list-pb', 9, 0, 30, 0.5, 'px'),
  range('statRowHeight', 'Hauteur ligne', 'stats', '--ui-stat-row-height', 49, 34, 72, 1, 'px'),
  range('statIconColumn', 'Colonne icône', 'stats', '--ui-stat-icon-column', 29.6, 18, 52, 0.2, 'px'),
  range('statValueColumn', 'Colonne valeur', 'stats', '--ui-stat-value-column', 29.6, 18, 52, 0.2, 'px'),
  range('statIconSize', 'Icône stat', 'stats', '--ui-stat-icon-size', 24.8, 12, 40, 0.2, 'px'),
  range('statWatermarkSize', 'Watermark', 'stats', '--ui-stat-watermark-size', 99, 45, 150, 1, 'px'),
  range('statWatermarkOpacity', 'Alpha watermark', 'stats', '--ui-stat-watermark-opacity', 0.2, 0, 0.6, 0.01, ''),
  range('statLabelSize', 'Label stat', 'stats', '--ui-stat-label-size', 12.2, 8, 18, 0.1, 'px'),
  range('statValueSize', 'Valeur / modificateur', 'stats', '--ui-stat-value-size', 13.1, 8, 20, 0.1, 'px'),
  range('statGaugeHeight', 'Jauge', 'stats', '--ui-stat-gauge-height', 6.7, 2, 14, 0.1, 'px'),
  range('traitsHeight', 'Zone Traits', 'stats', '--ui-traits-height', 81, 48, 140, 1, 'px'),

  // Crew rail.
  range('crewWidth', 'Crew fermé', 'crew', '--ui-crew-width', 160, 110, 240, 1, 'px'),
  range('crewExpandedWidth', 'Crew ouvert', 'crew', '--ui-crew-expanded-width', 288, 190, 420, 1, 'px'),
  range('crewGap', 'Gap membres', 'crew', '--ui-crew-gap', 6.7, 0, 20, 0.1, 'px'),
  range('crewRowHeight', 'Hauteur membre', 'crew', '--ui-crew-row-height', 42.4, 30, 72, 0.2, 'px'),
  range('crewRowPx', 'Membre — padding X', 'crew', '--ui-crew-row-px', 10, 0, 28, 0.5, 'px'),
  range('crewNameSize', 'Nom membre', 'crew', '--ui-crew-name-size', 12.8, 9, 20, 0.1, 'px'),
  range('crewStatNumberSize', 'Valeur stat membre', 'crew', '--ui-crew-stat-number-size', 8.6, 6, 16, 0.1, 'px'),

  // Outcome feedback and stat-impact animation.
  range('outcomeEffectHeight', 'Hauteur effet', 'outcome', '--ui-outcome-effect-height', 32, 22, 54, 1, 'px'),
  range('outcomeEffectPx', 'Effet — padding X', 'outcome', '--ui-outcome-effect-px', 11.5, 2, 28, 0.5, 'px'),
  range('outcomeEffectGap', 'Gap effets', 'outcome', '--ui-outcome-effect-gap', 8, 2, 22, 0.5, 'px'),
  range('outcomeEffectIcon', 'Icône effet', 'outcome', '--ui-outcome-effect-icon-size', 17.3, 10, 30, 0.1, 'px'),
  range('outcomeEffectLabelSize', 'Texte effet', 'outcome', '--ui-outcome-effect-label-size', 12.2, 8, 20, 0.1, 'px'),
  range('outcomeWatermarkOpacity', 'Alpha watermark effet', 'outcome', '--ui-outcome-watermark-opacity', 0.16, 0, 0.6, 0.01, ''),
  range('impactDuration', 'Durée impact', 'outcome', '--ui-impact-duration', 760, 120, 1800, 10, 'ms'),
  range('impactNumberSize', 'Nombre impact', 'outcome', '--ui-impact-number-size', 32.6, 12, 80, 0.2, 'px'),
  range('impactWatermarkSize', 'Nombre watermark', 'outcome', '--ui-impact-watermark-size', 92.8, 30, 180, 0.2, 'px'),
  range('impactWatermarkAlpha', 'Alpha impact watermark', 'outcome', '--ui-impact-watermark-alpha', 0.2, 0, 0.6, 0.01, ''),

  // Context tooltips.
  range('tooltipMaxWidth', 'Largeur max', 'tooltips', '--ui-tooltip-max-width', 320, 180, 520, 5, 'px'),
  range('tooltipRadius', 'Radius', 'tooltips', '--ui-tooltip-radius', 11.5, 0, 26, 0.5, 'px'),
  range('tooltipPx', 'Padding X', 'tooltips', '--ui-tooltip-px', 12.5, 4, 30, 0.5, 'px'),
  range('tooltipPy', 'Padding Y', 'tooltips', '--ui-tooltip-py', 11, 4, 30, 0.5, 'px'),
  range('tooltipTitleSize', 'Titre', 'tooltips', '--ui-tooltip-title-size', 12.5, 8, 20, 0.1, 'px'),
  range('tooltipMetaSize', 'Métadonnées', 'tooltips', '--ui-tooltip-meta-size', 10.9, 7, 18, 0.1, 'px'),
  range('tooltipDetailSize', 'Description', 'tooltips', '--ui-tooltip-detail-size', 11.2, 8, 18, 0.1, 'px'),
  range('tooltipDetailLeading', 'Description — interligne', 'tooltips', '--ui-tooltip-detail-leading', 16, 10, 28, 0.5, 'px'),

  // Shared glass material.
  range('glassBlur', 'Blur', 'glass', '--ui-glass-blur', 5, 0, 20, 0.5, 'px'),
  range('glassSaturation', 'Saturation', 'glass', '--ui-glass-saturation', 1.08, 0.5, 2, 0.01, ''),
  range('glassBorderAlpha', 'Bordure', 'glass', '--ui-glass-border-alpha', 42, 0, 100, 1, '%'),
  range('glassHoverBorderAlpha', 'Bordure hover', 'glass', '--ui-glass-hover-border-alpha', 58, 0, 100, 1, '%'),
  range('glassShadowY', 'Ombre Y', 'glass', '--ui-glass-shadow-y', 6, 0, 24, 1, 'px'),
  range('glassShadowBlur', 'Ombre blur', 'glass', '--ui-glass-shadow-blur', 18, 0, 60, 1, 'px'),
  range('glassStretchX', 'Stretch hover X', 'glass', '--ui-glass-hover-stretch-x', 1.012, 0.98, 1.08, 0.001, ''),
  range('glassStretchY', 'Stretch hover Y', 'glass', '--ui-glass-hover-stretch-y', 0.998, 0.94, 1.04, 0.001, ''),

  // Shared stat palette authority used by Player / Crew / Choice / Outcome.
  color('healthColor', 'Santé', 'palette', '--stat-health', '#c94f4a'),
  color('moraleColor', 'Moral', 'palette', '--stat-morale', '#4fa58b'),
  color('strengthColor', 'Force', 'palette', '--stat-strength', '#d8783f'),
  color('agilityColor', 'Agilité', 'palette', '--stat-agility', '#8aaa4d'),
  color('observationColor', 'Observation', 'palette', '--stat-observation', '#54a9b7'),
  color('intelligenceColor', 'Intelligence', 'palette', '--stat-intelligence', '#806eb0'),
  color('navigationColor', 'Navigation', 'palette', '--stat-navigation', '#397fa8'),
  color('charismaColor', 'Charisme', 'palette', '--stat-charisma', '#bd6687'),
  color('luckColor', 'Chance', 'palette', '--stat-luck', '#d1a33c'),
];

export const UI_TUNER_DEFAULT_VALUES: UITunerValues = Object.fromEntries(
  UI_TUNER_DEFINITIONS.map((definition) => [
    definition.id,
    definition.defaultValue,
  ]),
);

export const UI_TUNER_QUICK_PRESETS: Array<{
  id: string;
  label: string;
  values: Partial<UITunerValues>;
}> = [
  {
    id: 'compact',
    label: 'Compact',
    values: {
      hudSideWidth: 224,
      hudCenterWidth: 472,
      hudPanelMinHeight: 116,
      hudIdentityPx: 11,
      hudSlotSize: 28,
      hudMonthPipWidth: 28,
      hudMonthPipHeight: 6,
      hudSlotGap: 4,
      statsCompactWidth: 74,
      statsExpandedWidth: 202,
      statsListPt: 9,
      statsListPb: 7,
      statRowHeight: 43,
      statIconSize: 21,
      statWatermarkSize: 86,
      traitsHeight: 68,
      crewWidth: 148,
      crewExpandedWidth: 260,
      crewRowHeight: 38,
      choiceMinHeight: 36,
      choiceGap: 5,
      choicePy: 6,
      eventChoiceAreaPy: 6,
      parchmentMarginInline: 0.58,
      parchmentPaddingInline: 0.68,
    },
  },
  {
    id: 'balanced',
    label: 'Balanced',
    values: UI_TUNER_DEFAULT_VALUES,
  },
  {
    id: 'spacious',
    label: 'Spacious',
    values: {
      hudSideWidth: 278,
      hudCenterWidth: 552,
      hudPanelMinHeight: 144,
      hudIdentityPx: 18,
      hudSlotSize: 35,
      hudMonthPipWidth: 38,
      hudMonthPipHeight: 8,
      hudSlotGap: 7,
      statsCompactWidth: 96,
      statsExpandedWidth: 250,
      statsListPt: 16,
      statsListPb: 12,
      statRowHeight: 55,
      statIconSize: 28,
      statWatermarkSize: 112,
      traitsHeight: 92,
      crewWidth: 176,
      crewExpandedWidth: 320,
      crewRowHeight: 48,
      choiceMinHeight: 52,
      choiceGap: 10,
      choicePy: 11,
      eventChoiceAreaPy: 10,
      parchmentMarginInline: 0.85,
      parchmentPaddingInline: 0.95,
    },
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    values: {
      surfaceRaisedAlpha: 72,
      surfaceStrongAlpha: 84,
      borderDefaultAlpha: 16,
      borderStrongAlpha: 26,
      shadowPanelAlpha: 42,
      panelRadius: 18,
      nineSliceOpacityMuted: 0.42,
      glassBlur: 8,
      glassSaturation: 1.18,
      glassBorderAlpha: 34,
      hudNameSize: 23,
      statWatermarkOpacity: 0.27,
      tooltipRadius: 14,
    },
  },
];
