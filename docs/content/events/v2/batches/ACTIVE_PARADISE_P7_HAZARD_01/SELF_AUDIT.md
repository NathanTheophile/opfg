# ACTIVE_PARADISE_P7_HAZARD_01 — SELF AUDIT

- [x] Current `dev` baseline inspected before authoring: HEAD `63b93cead6bf7b845839c40371048005e3ca7a08`, Content Schema 16, Save 23.
- [x] No engine/schema/save/UI/navigation files authored.
- [x] 45 counted local roots: exactly 5 per main P7 stop.
- [x] One extra Normal route-wide arc seed; total Normal roots 46.
- [x] Dice roots 28/46 (60.9%).
- [x] Exactly one bounded route-wide Scheduled arc: L1 seed + four Scheduled nodes, +3 months each.
- [x] Every local root is route-owned through History `hasPlayed(active_paradise_route_start_p7_hazard)`.
- [x] Banaro and Sabaody shared-stop roots are explicitly route-gated.
- [x] No recruitment Effects; no new persistent NPC/Item/Ship/Flag definitions.
- [x] No fixed NPC CrewRole assumptions; only valid current runtime CrewRole IDs are referenced.
- [x] No Event Choice reproduces an annual role power; no passive-role global modifiers are granted by content.
- [x] No seeded NPC personal fallback name appears in prose.
- [x] FR/EN key sets are identical.
- [x] Static batch validator passes locally on the generated bundle.
- [ ] `npm run validate-content`, `npm test`, `npm run build` require a full repository checkout. This execution environment has no GitHub network access for `git clone`, so those three repository-wide commands could not be truthfully run here.
