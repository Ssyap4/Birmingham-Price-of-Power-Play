# Case 001 — scene-by-scene art acceptance audit

Status: IN PROGRESS. This is a **code/manifest audit**, not a claim that the rendered images were visually inspected or approved. Do not mark any frame visually approved without viewing the actual WebP in the running UI.

Finale source assets: six user-approved 1600×900 WebP images were committed with this update. Exact image content should still be visually inspected in a live game session after CI. No playable protagonist appears in any of the six.

## Acceptance rules
Each scene must depict its precise location (interior/exterior), action, NPCs, props, time of day, and adjacent-scene continuity. Never depict one of the five playable protagonists. Reuse is permitted only if all these details genuinely match. Verify crop and readability at mobile widths.

## Scene manifest and review actions
| Scene | Current asset | Required visible event | Status |
|---|---|---|---|
| intro | intro-meeting | Evelyn approaches investigator outside office on rainy Watery Lane | visually inspect |
| envelope | letter | D-17 mark and wax-sealed envelope close-up | visually inspect |
| widow | widow | Evelyn at Price home handing over key | visually inspect |
| interview | interview-kitchen | Evelyn at kitchen table with cold tea | **approved WebP installed; browser QA pending** |
| office | office-cinematic | Price office, concealed invoice/bookshelf | visually inspect |
| searchOffice | office | rear room, fireplace ash and canal mud on windowsill | **new rear-room frame required** |
| canal | canal-cinematic | D-17 canal docks, guard and locked warehouse | visually inspect |
| bribe | canal | guard bargaining at dock shelter | **separate guard conversation frame recommended** |
| sneak | d17-sneak | exterior rear yard, broken bottle and torn receipt | visually inspect |
| unlock | d17-unlock | key opening warehouse door, crates inside | visually inspect |
| warehouse | d17-warehouse | double ledger under floorboard inside warehouse | visually inspect |
| listen | d17-sneak | listener concealed outside brick wall | **new listening frame required** (shared rear-yard image not enough) |
| reed | police-cinematic | Reed at police station offering protection | visually inspect |
| reedProof | police-cinematic | Reed confronted with signed document | **new document-confrontation frame required** |
| accuse | police-cinematic | Reed dismisses accusation, messenger outside | **new dismissal frame required** |
| pretend | police-cinematic | Reed provides pump-station address | **new address-exchange frame required** |
| confession | police-cinematic | Reed refuses written confession | **new refusal frame required** |
| escort | pump-cinematic | Reed guides investigator to rear entrance, then vanishes | visually inspect; no protagonist shown |
| warn | evelyn-warning | Evelyn protects children and hands over Arthur note | visually inspect |
| pump | pump-arrival | through dirty window Arthur bound; Crane with revolver | visually inspect |
| yard | pump-yard | station ventilation grille and rear courtyard | visually inspect |
| rescue | pump-captive | Arthur being freed from chair, Crane alert | visually inspect |
| confront | pump-confront | Crane confronts captive Arthur with revolver and folder | visually inspect |
| trade | pump-basement | ledger exchanged for Arthur's release | **new exchange frame required** |
| expose | pump-basement | double ledger and numbered payments exposed to Crane | **new exposure frame required** |
| pressure | pump-basement | Crane drops folder and backs away | **new retreat frame required** |
| heroJack | canal | guard gives Jack receipt | **new character-neutral receipt frame required** |
| heroFinn | d17-unlock | lockpicks opening warehouse side lock | **new lockpick detail frame required** |
| heroEleanor | canal-cinematic | photographic copy of invoice at cargo dock | **new camera/invoice frame required; avoid playable character** |
| heroVictor | d17-sneak | forged ID presented at warehouse checkpoint | **new forged-ID detail frame required** |
| heroSamuel | pump-yard | service gallery mechanism and technical access | **new mechanism frame required** |
| endingRescue | endingRescue | bruised Arthur embraces Evelyn at home | **approved asset installed in PR #17; browser QA pending** |
| endingEvidence | endingEvidence | incriminating documents and injury evidence | **approved asset installed in PR #17; browser QA pending** |
| endingDeal | endingDeal | sealed envelope on table, no hands | **approved asset installed in PR #17; browser QA pending** |
| endingTruth | endingTruth | press/police investigation and evidence | **approved asset installed in PR #17; browser QA pending** |
| endingPower | endingPower | empty office, dossiers and Birmingham map | **approved asset installed in PR #17; browser QA pending** |
| endingDeath | endingDeath | bloodied cap on rainy cobblestones | **approved asset installed in PR #17; browser QA pending** |

### Important
A passing filename/location test does not establish scene-specific visual correctness. The shared `d17-sneak` image for `listen` and `heroVictor` is a temporary exterior-location correction, not final scene art. Likewise the shared police and pump basement illustrations are temporary placeholders. Keep the approved menu art unchanged.
