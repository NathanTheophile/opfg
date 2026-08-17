# REPORT — ACTIVE_GENERIC_LAND_01_SOCIAL

## Handoff

- HEAD read before authoring: `dc3819121ae8e74aaa898afefedbc7cdb5666df8`
- Content Schema: `15`
- Runtime files: **38**
- Normal roots: **20**
- Immediate Events: **18**
- Scheduled Events: **0**
- Mini-arc roots: **15/20 = 75%**
- Dice roots: **12/20 = 60%**
- New persistent definitions/proposals: **none**
- Restrictive root eligibility: **1/20** (`locationHasTag(royal)`); the other **19/20** are broad `active + onLand`.
- Career compatibility: Civilian / Pirate / Marine / Revolutionary.
- Reputation: monotonic positive-only changes.
- Bounty: untouched.
- Navigation/world movement: untouched.

## Editorial result

The 20 roots are separated by immediate social friction rather than by cosmetic nouns:

1. mistaken public praise;
2. factional toast pressure;
3. reserved-status seating;
4. hospitality with political/social strings;
5. public judging and appeal;
6. rumor becoming a song;
7. ceremonial honor carrying obligations;
8. public queue accusation;
9. call-and-response performance pressure;
10. accidental local insult and apology;
11. children imposing a nickname;
12. mourning etiquette;
13. public caricature reaction;
14. competing petitions seeking visible endorsement;
15. dance-circle challenge;
16. royal reception rank ordering;
17. a communal table forcing side-taking;
18. a stranger borrowing the player's reputation;
19. incompatible hospitality invitations;
20. two processions disputing precedence.

No tavern framing is used.

## Mechanical spread

The batch uses public notoriety as its main mechanical axis without turning every scene into a reward:

- failed social Dice can increase Reputation because embarrassment/scandal still makes the player known;
- several failures also cost Morale or, in the dance scene, Health;
- two deterministic escape options consume Berrys only when the player has enough;
- many choices intentionally resolve through History/opportunity with no numeric reward;
- Stat changes remain occasional and small.

No negative Reputation is authored.

## Isolation decision

No persistent NPC is introduced or reused as a mandatory actor. A generic land-social batch cannot safely teleport `childhood_friend`, parents, Mira or another location-untracked NPC into arbitrary land contexts merely to obtain Relationship effects.

No persistent Item is created, granted, removed or destroyed. Existing unique Family/track assets are not consumed to decorate generic social scenes.

## Validation status

Passed local structural/editorial checks captured in `AUDIT.json` and summarized in `MANIFEST.md`.

Not run here:

- `npm run validate-content`
- `npm test`
- `npm run build`

Reason: this environment has GitHub read access but no mounted/network-enabled checkout. GitHub content-write APIs were deliberately not used because they commit directly.

## Integration need

Apply the runtime directory and namespaced support directory to a real checkout on current `dev`, merge the FR/EN fragments into runtime locale dictionaries, then run the full repository validation pipeline.
