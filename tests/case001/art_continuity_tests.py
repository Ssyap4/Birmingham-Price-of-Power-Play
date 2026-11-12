"""Protect Case 001 against wrong-location art and missing illustration files."""
from pathlib import Path
import hashlib
import re

ROOT = Path(__file__).resolve().parents[2]
SOURCE = (ROOT / "case-v14.js").read_text(encoding="utf-8")


def object_block(name):
    match = re.search(r"const " + re.escape(name) + r"=\{(.*?)\};", SOURCE, re.S)
    assert match, f"Cannot locate {name} scene mapping"
    return match.group(1)


art = dict(re.findall(r"([A-Za-z][A-Za-z0-9]*):'([^']+)'", object_block("ART")))
scenes = set(re.findall(r"^([A-Za-z][A-Za-z0-9]*):\{(?:chapter:|end:)", SOURCE, re.M)) | {"endingDeath"}
assert scenes, "No scenes found"
assert len(art) == 37, f"Expected 37 scene nodes, got {len(art)}"
assert scenes == set(art), f"Art mapping mismatch: missing={scenes-set(art)}, extra={set(art)-scenes}"
for scene, filename in art.items():
    path = ROOT / "assets" / "case-scenes" / (filename + ".webp")
    assert path.is_file() and path.stat().st_size > 0, f"{scene}: missing {path}"

# Semantic location rules: a scene at the Price home must never show an office.
# Add newly authored scenes to the appropriate group before publishing.
location_art = {
    "home": ({"widow", "interview", "warn"}, {"widow", "widow-home", "evelyn-warning", "interview-kitchen"}),
    "office": ({"envelope", "office", "searchOffice"}, {"office", "office-cinematic", "office-approved", "letter", "searchOffice", "envelope"}),
    "police": ({"reed", "reedProof", "accuse", "pretend", "confession"}, {"reed", "reedProof", "accuse", "pretend", "confession"}),
    "canal": ({"canal", "bribe", "heroJack", "heroEleanor"}, {"canal", "canal-cinematic", "canal-approved", "bribe", "heroEleanor", "heroJack"}),
    "warehouse": ({"sneak", "unlock", "warehouse", "listen", "heroFinn", "heroVictor"}, {"warehouse", "warehouse-interior", "d17-sneak", "d17-unlock", "d17-warehouse", "listen", "heroFinn", "heroVictor"}),
    "pump": ({"escort", "pump", "yard", "rescue", "confront", "trade", "expose", "pressure", "heroSamuel"}, {"pump-cinematic", "pump-basement", "pump-arrival", "pump-yard", "pump-captive", "pump-confront", "trade", "expose", "pressure", "escort", "pump", "confront", "rescue", "heroSamuel", "yard"}),
    "ending": ({"endingRescue", "endingEvidence", "endingDeal", "endingTruth", "endingPower", "endingDeath"}, {"endingRescue", "endingRescue-approved", "endingEvidence", "endingDeal", "endingDeal-approved", "endingTruth", "endingPower", "endingPower-approved", "endingDeath"}),
    "intro": ({"intro"}, {"intro", "intro-meeting", "smallheath", "street-cinematic"}),
}
# Protect deliberate visual beats from reverting to one repeated picture per location.
story_beats = {
    "intro": "intro",
    "envelope": "envelope",
    "widow": "widow-home",
    "interview": "interview-kitchen",
    "reed": "reed",
    "reedProof": "reedProof",
    "accuse": "accuse",
    "pretend": "pretend",
    "confession": "confession",
    "office": "office-approved",
    "endingRescue": "endingRescue-approved",
    "endingDeal": "endingDeal-approved",
    "searchOffice": "searchOffice",
    "canal": "canal-approved",
    "warn": "evelyn-warning",
    "sneak": "d17-sneak",
    "unlock": "d17-unlock",
    "warehouse": "d17-warehouse",
    "pump": "pump",
    "trade": "trade",
    "expose": "expose",
    "pressure": "pressure",
    "escort": "escort",
    "yard": "yard",
    "rescue": "rescue",
    "confront": "confront",
    "heroJack": "heroJack",
    "heroFinn": "heroFinn",
    "heroVictor": "heroVictor",
    "heroSamuel": "heroSamuel",
    "listen": "listen",
    "heroEleanor": "heroEleanor",
}
for scene, expected in story_beats.items():
    assert art[scene] == expected, f"{scene}: expected story-beat art '{expected}', got '{art[scene]}'"
assert art["intro"] == "intro", "Approved rain-soaked opening must be used"
assert hashlib.sha256((ROOT / "assets/case-scenes/intro.webp").read_bytes()).hexdigest() == "33e511c0362063675bb4f79a7a35faebea213c88188318637ff35740ee600065", "Approved intro changed"
assert art["interview"] != art["widow"], "The Evelyn kitchen interview must not reuse the living-room art"
assert art["widow"] == "widow-home", "Evelyn must hand over key 17 in the approved modest home scene"
assert hashlib.sha256((ROOT / "assets/case-scenes/widow-home.webp").read_bytes()).hexdigest() == "572811a0262bd11aebf16ad36bc221b7e827313b5d73f21d8b97e5a64340edcf", "Approved Evelyn key handover art changed"
assert art["envelope"] != art["office"], "The envelope clue and office investigation must look different"
# Approved evidence: oil-stained D-17 envelope with lifted sealing wax.
assert art["envelope"] == "envelope", "Envelope evidence must have its own approved close-up"
assert hashlib.sha256((ROOT / "assets/case-scenes/envelope.webp").read_bytes()).hexdigest() == "4005ac22ada654fce5e19a833941f3259f6aaa6730fc4938b2ef99942a926c20", "Approved D-17 envelope art changed"
# Approved charred-accounting evidence, distinct from the general Price office.
assert art["searchOffice"] == "searchOffice", "Rear-office evidence must have dedicated illustration"
assert art["searchOffice"] != art["office"], "Rear office and main office must be visually distinct"
# Approved Price accountancy office with hidden shelf and invoice stamped D-17.
assert art["office"] == "office-approved", "The main Price office must use the approved hidden-invoice image"
assert hashlib.sha256((ROOT / "assets/case-scenes/office-approved.webp").read_bytes()).hexdigest() == "278c2155b8a6b2a40f87cfd04b03dfe9b31889493b3f17641cea2120241f5a39", "Approved Arthur office image changed"
assert hashlib.sha256((ROOT / "assets/case-scenes/searchOffice.webp").read_bytes()).hexdigest() == "510c69bf45894917bd4f18c10b3c9851b9dafc065c9b9de998aaba68b615dffb", "Approved rear-office evidence artwork changed"
assert art["canal"] != art["bribe"], "Arriving at the canal and bargaining with the guard must look different"
# Approved Digbeth quay: closed D-17, watchman asleep under the canopy, wet canal, no playable hero.
assert art["canal"] == "canal-approved", "Digbeth arrival must use approved canal warehouse artwork"
assert hashlib.sha256((ROOT / "assets/case-scenes/canal-approved.webp").read_bytes()).hexdigest() == "4f4554817f9dcf4ae3cefba48fdf632f596acc3ff4abaa06bd90d0ba0803d538", "Approved canal image changed"
# Keep the D-17 approach outside and the unlocked door inside.
assert art["sneak"] == "d17-sneak", "The backyard approach must not show an indoor warehouse"
assert art["unlock"] == "d17-unlock", "Opening D-17 must show the warehouse interior"
assert art["listen"] == "listen" and art["listen"] != art["sneak"], "Approved listening illustration must remain distinct from sneaking"
assert art["heroVictor"] != art["warehouse"], "The checkpoint scene must not show the warehouse interior"
assert art["heroVictor"] == "heroVictor", "Victor must use approved checkpoint scene art"
assert hashlib.sha256((ROOT / "assets/case-scenes/heroVictor.webp").read_bytes()).hexdigest() == "5a07dd915e60ec0e97bae45343ed7f769cbae18153a0e3486875d63584360566", "Approved Victor art changed"
assert art["heroSamuel"] == "heroSamuel", "Samuel must use approved service gallery scene art"
assert hashlib.sha256((ROOT / "assets/case-scenes/heroSamuel.webp").read_bytes()).hexdigest() == "abdbd91905df9a63831a51c3fa2bcd0bedae2bc7baf727b977615d215f880653", "Approved Samuel art changed"
assert art["heroSamuel"] != art["yard"], "Samuel’s opened service gallery must have its own art"
# Approved yard: rain-soaked pump yard, damaged grate, ventilation crawlspace, and voices inside.
assert art["yard"] == "yard", "Pumping station yard must use its approved broken-grate art"
assert hashlib.sha256((ROOT / "assets/case-scenes/yard.webp").read_bytes()).hexdigest() == "e7ebec1023f18a4c69016e57037198109c3cd9a4f349cb775752f6d5110dfa7a", "Approved yard scene changed"
assert art["sneak"] != art["unlock"], "The yard and doorway need different visual angles"
assert len({art[s] for s in ("pump", "yard", "rescue", "confront")}) == 4, "Pumping station narrative beats require distinct images"
# Protect the six user-approved ending illustrations from reverting to archive art.
ending_scenes = ("endingRescue", "endingEvidence", "endingDeal", "endingTruth", "endingPower", "endingDeath")
assert len({art[s] for s in ending_scenes}) == 6, "Finales must use six distinct images"
for scene in ending_scenes:
    approved_name = {"endingRescue": "endingRescue-approved", "endingDeal": "endingDeal-approved", "endingPower": "endingPower-approved"}.get(scene, scene)
    assert art[scene] == approved_name, f"{scene}: must use approved {approved_name}.webp"

# Approved Finn: unlocked D-17 lock, lockpicks and duplicate accounts ledger.
assert art["heroFinn"] == "heroFinn", "Finn must use his approved double-ledger illustration"
assert art["heroFinn"] != art["unlock"], "Finn's unique route must not reuse the general warehouse unlock"
assert hashlib.sha256((ROOT / "assets/case-scenes/heroFinn.webp").read_bytes()).hexdigest() == "a31acc9c87fbbbbc5486ec39c8d3a9de66957f3dc2e36b70b219bf3d7e3b9b67", "Approved Finn art changed"

# Approved Jack encounter: frightened guard hands over Reed's night-shift payroll slip.
assert art["heroJack"] == "heroJack", "Jack's guard encounter must use approved scene art"
assert art["heroJack"] != art["canal"], "Guard interrogation is not a canal panorama"
assert hashlib.sha256((ROOT / "assets/case-scenes/heroJack.webp").read_bytes()).hexdigest() == "cc24acb300183e71094253cd29df5d9f394bbc01b5fa98d9cc870e6a3a1ef4f0", "Approved Jack art changed"

# Approved Eleanor clue: period camera and two-stamp dockside invoice, without protagonist.
assert art["heroEleanor"] == "heroEleanor", "Eleanor must use the approved photographic evidence scene"
assert art["heroEleanor"] != art["canal"], "Eleanor's evidence is not a generic canal image"
assert hashlib.sha256((ROOT / "assets/case-scenes/heroEleanor.webp").read_bytes()).hexdigest() == "96bc277e3c04fe51950bb9452c362254df3df68e09de19b8c3b5e3dc0cd4e694", "Approved Eleanor art changed"

# Approved watchman passing the route at the canal wharf.
assert art["bribe"] == "bribe", "Watchman's route handover must use its own art"
assert art["bribe"] != art["canal"], "Route handover is not a generic canal view"
assert hashlib.sha256((ROOT / "assets/case-scenes/bribe.webp").read_bytes()).hexdigest() == "dfccdeda7fcc1ab8ae04bc0acd89f3c7514aebe83e7d20c87fbec8b77fd07c41", "Approved watchman illustration changed"

# Approved overheard conversation through D-17 warehouse door.
assert art["listen"] == "listen", "Overheard conversation must use its own illustration"
assert art["listen"] != art["sneak"], "Listening and sneaking are different story beats"
assert hashlib.sha256((ROOT / "assets/case-scenes/listen.webp").read_bytes()).hexdigest() == "4c804a76ca3f6ce7f007ad98ace570ce3e01188ccea7ce9a5da86d3ea0c9f3c1", "Approved listening illustration changed"

# Approved rescue: Arthur rising with loosened ropes as Crane turns toward the disturbance.
assert art["rescue"] == "rescue", "Rescue must not reuse captive illustration"
assert art["rescue"] != art["pump"], "Rescue and captivity require different art"
assert hashlib.sha256((ROOT / "assets/case-scenes/rescue.webp").read_bytes()).hexdigest() == "43a54df5cc594b1440160afd5ab62de4e87be313e2a798e68687aa1040b61d1a", "Approved rescue art changed"

# Approved captive Arthur and Crane confrontation shots, distinct from generic pump art.
APPROVED_CAPTIVE_SHA256 = {
    "pump": "cf41e8aabd352af7402d660aafa478a465d64c2854b3baec07f40edb7d77cf76",
    "confront": "1811b9adc299654937830b9dec60ebc4e4a11f9a39ae382e4a88d1d9d9981853",
}
assert art["pump"] != art["confront"], "Different beats require different art"
for scene, expected_sha in APPROVED_CAPTIVE_SHA256.items():
    assert art[scene] == scene, f"{scene}: approved illustration was replaced"
    path = ROOT / "assets" / "case-scenes" / (scene + ".webp")
    assert hashlib.sha256(path.read_bytes()).hexdigest() == expected_sha, f"{scene}: approved illustration changed"

# Four individually approved pumping-station illustrations.
APPROVED_PUMP_SHA256 = {
    "trade": "ef7da0710f6c8695a9257a5a6693fdcc75d48c24b50edddbb19fe79fd5187def",
    "expose": "c361bba3506eb1c878c1e041cfd14b1d9a8da42ba276055cccad92f83784f866",
    "pressure": "9a1ea938d04f2ed01ce46585909277b34c5ea5f1be7b5dc991666f3f3bcf68a5",
    "escort": "5be77510a9caa7803061f32b369f00391a279e583b2a72383e35427615c64e1d",
}
assert len({art[s] for s in APPROVED_PUMP_SHA256}) == 4, "Pump scenes must use distinct images"
for scene, expected_sha in APPROVED_PUMP_SHA256.items():
    assert art[scene] == scene, f"{scene}: approved pumping station illustration replaced"
    path = ROOT / "assets" / "case-scenes" / (scene + ".webp")
    assert hashlib.sha256(path.read_bytes()).hexdigest() == expected_sha, f"{scene}: approved pumping station image changed"

# Five individually approved Sergeant Reed scenes, pinned against accidental swaps.
APPROVED_REED_SHA256 = {
    "reed": "2a83927b1f07225b920722c69d7700621d0591afce5186b5e97e0ff41b15e088",
    "reedProof": "f3dde781d63020a502929b76e26fc6e39c69d9f6ad1163a464dee457c6781df8",
    "accuse": "63b3eac0da86b32720e111a8de761da8d36e1db7be03f5f17435331bb22986e3",
    "pretend": "bd7a884cf326b1a9c8812d8cb71dbc02fa1b9eddb5e902b6c2a5d146d458b045",
    "confession": "ecf134717fd71cbdc69ee0fe8c3068ab8e7f3fb71cf8b9bf2acbb94400fa4e57",
}
assert len({art[s] for s in APPROVED_REED_SHA256}) == 5, "Reed scenes must have five different pictures"
for scene, expected_sha in APPROVED_REED_SHA256.items():
    assert art[scene] == scene, f"{scene}: approved illustration was replaced"
    path = ROOT / "assets" / "case-scenes" / (scene + ".webp")
    assert hashlib.sha256(path.read_bytes()).hexdigest() == expected_sha, f"{scene}: approved Reed WebP changed"

# Newly approved rescue ending: Arthur and Evelyn reunited in their modest home.
assert art["endingRescue"] == "endingRescue-approved", "Rescue ending must use approved home reunion"
assert hashlib.sha256((ROOT / "assets/case-scenes/endingRescue-approved.webp").read_bytes()).hexdigest() == "aa0bdb13ee24b2d5aa964ff7af5e5de55c80e7092e8224ce5507b16bd7493dc0", "Approved Arthur and Evelyn reunion image changed"

# Approved bargain ending: Crane destroys D-17 papers while freed Arthur stands nearby.
assert art["endingDeal"] == "endingDeal-approved", "Deal finale must show Crane burning the evidence"
assert hashlib.sha256((ROOT / "assets/case-scenes/endingDeal-approved.webp").read_bytes()).hexdigest() == "dec9fbcdf8d3c33a8d0da81e21dff7ddc74f79915fddc97d7af56c5380317b70", "Approved endingDeal art changed"

# Approved power ending: kept leverage on Crane, sealed evidence and an empty chair.
assert art["endingPower"] == "endingPower-approved", "Power ending must use approved kept-compromat illustration"
assert hashlib.sha256((ROOT / "assets/case-scenes/endingPower-approved.webp").read_bytes()).hexdigest() == "52e4c0de9efa426d44d8931da1684c4f9dc8a2cd225fe013c5d321fb668eb762", "Approved endingPower art changed"

# Frozen, user-approved finale WebP digests. A swapped image or accidental overwrite
# is a release-blocking error even if the filenames and dimensions are correct.
# Change these only after explicitly showing and approving the replacement art.
APPROVED_INTERVIEW_SHA256 = "d9bab567035935f1402340702a47a1a98e1fd49cfb497bdbe2def6f84343a63e"
assert hashlib.sha256((ROOT / "assets/case-scenes/interview-kitchen.webp").read_bytes()).hexdigest() == APPROVED_INTERVIEW_SHA256, "Approved Evelyn kitchen was swapped"

APPROVED_FINALE_SHA256 = {
    "endingRescue": "80640d5d8cd02d79ec9d57f90dec54a9b54da58a1247c1f473f1881a2b86af45",
    "endingEvidence": "ba1737adffeb9a5bbb54ba4e5a4bc652ec73c46d28c88332d1577c4ffbe71a02",
    "endingDeal": "aa4014f42d3e9cf628a2e4ca4bbbb39913d19dc0b82c0068ee0c13d6a839c514",
    "endingTruth": "717b46a12e4b5f9d653fe57f8a51c9e3a9a33898d4390fe4f8a5f55b67d08037",
    "endingPower": "cf45afbecc8e108168b1b6f7e86332562ea15951e82fc6b34c19514715867580",
    "endingDeath": "4a57e210b055fa67eba6d464b8db68137549fcd399dc57b64f0a0ede6b5230eb",
}
for ending, expected_sha in APPROVED_FINALE_SHA256.items():
    path = ROOT / "assets" / "case-scenes" / (ending + ".webp")
    actual_sha = hashlib.sha256(path.read_bytes()).hexdigest()
    assert actual_sha == expected_sha, f"{ending}: approved image content changed or file was swapped"

covered = set()
for group, (scene_ids, allowed_art) in location_art.items():
    covered.update(scene_ids)
    for scene in scene_ids:
        assert scene in art, f"{group}: missing scene {scene}"
        assert art[scene] in allowed_art, f"{scene}: '{art[scene]}' is wrong for {group}; allowed {sorted(allowed_art)}"
assert covered == scenes, f"Unclassified scenes: {scenes-covered}"
print(f"OK: {len(scenes)} art paths exist; broad location rules and six approved finale SHA-256 checks pass (not a full visual review)")
