import type { ItemId } from '@/game/model/schema';

import civilianTrustLedger from '@/assets/item-icons/civilian_trust_ledger.png';
import civilianWorkshopToolkit from '@/assets/item-icons/civilian_workshop_toolkit.png';
import civilianWorkshopCat from '@/assets/item-icons/civilian_workshop_cat.png';
import marineCourtyardHound from '@/assets/item-icons/marine_courtyard_hound.png';
import pirateSafeHarborGull from '@/assets/item-icons/pirate_safe_harbor_gull.png';
import revolutionaryCourierFerret from '@/assets/item-icons/revolutionary_courier_ferret.png';
import royalPalaceHound from '@/assets/item-icons/royal_palace_hound.png';
import familyMarineFieldCompass from '@/assets/item-icons/family_marine_field_compass.png';
import familyMarineInsignia from '@/assets/item-icons/family_marine_insignia.png';
import familyMarineSealedReport from '@/assets/item-icons/family_marine_sealed_report.png';
import familyMarineServiceJournal from '@/assets/item-icons/family_marine_service_journal.png';
import familyPirateBlackFlagPatch from '@/assets/item-icons/family_pirate_black_flag_patch.png';
import familyPirateDebtLedger from '@/assets/item-icons/family_pirate_debt_ledger.png';
import familyPirateDiverBell from '@/assets/item-icons/family_pirate_diver_bell.png';
import familyPirateSafeHarborKey from '@/assets/item-icons/family_pirate_safe_harbor_key.png';
import familyPirateSaltChart from '@/assets/item-icons/family_pirate_salt_chart.png';
import familyRoyalPlainSeal from '@/assets/item-icons/family_royal_plain_seal.png';
import familyRoyalUnmarkedTravelBoots from '@/assets/item-icons/family_royal_unmarked_travel_boots.png';
import giantMarineTrainingBracer from '@/assets/item-icons/giant_marine_training_bracer.png';
import miraLetterOfPassage from '@/assets/item-icons/mira_letter_of_passage.png';
import paradiseLogPose from '@/assets/item-icons/paradise_log_pose.png';
import revolutionaryBoundaryKeys from '@/assets/item-icons/revolutionary_boundary_keys.png';
import revolutionaryHandoffNotebook from '@/assets/item-icons/revolutionary_handoff_notebook.png';
import sealedChart from '@/assets/item-icons/sealed_chart.png';
import timber from '@/assets/item-icons/timber.png';
import tripleLogPose from '@/assets/item-icons/triple_log_pose.png';

const ITEM_ICON_URLS: Readonly<Partial<Record<ItemId, string>>> = {
  civilian_workshop_cat: civilianWorkshopCat,
  marine_courtyard_hound: marineCourtyardHound,
  pirate_safe_harbor_gull: pirateSafeHarborGull,
  revolutionary_courier_ferret: revolutionaryCourierFerret,
  royal_palace_hound: royalPalaceHound,
  civilian_trust_ledger: civilianTrustLedger,
  civilian_workshop_toolkit: civilianWorkshopToolkit,
  family_marine_field_compass: familyMarineFieldCompass,
  family_marine_insignia: familyMarineInsignia,
  family_marine_sealed_report: familyMarineSealedReport,
  family_marine_service_journal: familyMarineServiceJournal,
  family_pirate_black_flag_patch: familyPirateBlackFlagPatch,
  family_pirate_debt_ledger: familyPirateDebtLedger,
  family_pirate_diver_bell: familyPirateDiverBell,
  family_pirate_safe_harbor_key: familyPirateSafeHarborKey,
  family_pirate_salt_chart: familyPirateSaltChart,
  family_royal_plain_seal: familyRoyalPlainSeal,
  family_royal_unmarked_travel_boots: familyRoyalUnmarkedTravelBoots,
  giant_marine_training_bracer: giantMarineTrainingBracer,
  mira_letter_of_passage: miraLetterOfPassage,
  paradise_log_pose: paradiseLogPose,
  revolutionary_boundary_keys: revolutionaryBoundaryKeys,
  revolutionary_handoff_notebook: revolutionaryHandoffNotebook,
  sealed_chart: sealedChart,
  timber,
  triple_log_pose: tripleLogPose,
};

export function getItemIconUrl(itemId: ItemId): string | undefined {
  return ITEM_ICON_URLS[itemId];
}
