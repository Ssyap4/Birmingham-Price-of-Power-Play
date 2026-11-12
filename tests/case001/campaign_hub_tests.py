"""Case 001: validate scalable campaign UI wiring and local-save protections."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[2]
def content(name):return (ROOT/name).read_text(encoding="utf-8")
html=content("index.html")
hub=content("campaign-hub-v1.js")
inventory=content("case-v33-inventory.js")
chapter=content("case-chapter-art-v1.js")
game=content("game.js")
profile=content("profile-page.js")
layout=content("case-v18.js")
assert 'campaignHistoryMenu' not in html and 'campaign-hub-v1.js' in html
assert 'campaign-tabs' in hub and 'campaignHistory' in hub
assert 'campaign-hub-v1.css' in html and 'case-ux-repair-v1.css' in html
assert all(s in hub for s in ["campaignDossiers","campaignAchievements","campaignHistory"])
assert 'caseId:CASE_ID' in hub and 'heroId:hero.id' in hub
assert 'const key=[CASE_ID,hero.id,s.started,s.node].join' in hub
assert 'r.caseId+\':\'+r.heroId+\':\'+r.ending' in hub
assert "['hero5'" in hub and "['combos30'" in hub and "['end6'" in hub
assert "birmingham_case_smol_heath_v1_" in hub
assert "birmingham_case_v20_findings_" in hub
assert "case-v18-footer" in layout and "footer.remove()" in layout
assert 'v33-solved-board' in inventory and 'solvedIds' in inventory
assert "shade.addEventListener('wheel'" not in inventory, "Wheel trap must be absent"
assert 'gameExitBtn' in content("session-controls-v1.js")
assert "document.querySelector('.bh-audio-controls')" in content("session-controls-v1.js")
assert all(x in chapter for x in ("intro.webp","office-approved.webp","canal-approved.webp","reed.webp","pump.webp"))
assert all(x in game for x in ("campaignDossiers","campaignAchievements","campaignHistory"))
assert all(x in profile for x in ("campaignDossiers","campaignAchievements","campaignHistory"))
assert all((ROOT/x).is_file() for x in [
"assets/case-scenes/intro.webp","assets/case-scenes/office-approved.webp",
"assets/case-scenes/canal-approved.webp","assets/case-scenes/reed.webp",
"assets/case-scenes/pump.webp"])
print("OK: campaign screens, 42 achievements and 30 single-grant hero/ending rewards wired")

assert 'mobile-runtime-v1.js' in html and 'mobile-runtime-v1.css' in html
mobile=content('mobile-runtime-v1.js')
assert "screen.orientation.lock('landscape')" not in mobile, "Portrait-first build must never force rotation"
assert "tg.expand" in mobile and "tg.ready" in mobile
assert "mobile-portrait-v1.css" in html, "Portrait-first responsive stylesheet must load"
assert "pointer-events:none!important" in content('case-health-v1.css')

hub_definitions=hub[hub.index('const ACH=['):hub.index('function metrics(')]
assert hub_definitions.count("\n ['")==18, "Expected 18 curated campaign achievements"
assert 'birmingham_campaign_unique_rewards_v1' in hub
assert 'function uniqueRewards(runs)' in hub
assert 'function renderUniqueRewards(el,runs)' in hub

# Every one of the approved 37 scene illustrations belongs to exactly one chapter thumbnail.
import json
js=content('case-v14.js')
found=re.search(r'const ART=\{([\s\S]*?)\};',js)
assert found, 'Story scene art table missing'
active=[x for x in re.findall(r"\w+\s*:\s*'([^']+)'",found.group(1))]
groups_match=re.search(r'const groups=(\[\[.*?\]\]);',chapter)
assert groups_match,'Chapter image group table missing'
groups=json.loads(groups_match.group(1))
flat=[art for group in groups for art in group]
assert len(active)==37 and len(flat)==37 and len(set(flat))==37
assert sorted(active)==sorted(flat), {'missing':sorted(set(active)-set(flat)),'unexpected':sorted(set(flat)-set(active))}

assert 'case-controls-mobile-v1.js' in html, 'Phone toolbar must load'
phone_controls=content('case-controls-mobile-v1.js')
assert "const shouldDock=!caseScreen.hidden&&compact.matches" in phone_controls
assert 'top.after(controls)' in phone_controls
assert '#caseGame > .bh-audio-controls' in content('mobile-runtime-v1.css')

# The old CSS !important is not allowed to override the active sidebar image.
legacy=content('case-v27-release.css')
assert 'url("assets/case-scenes/city.webp")!important' not in legacy
assert "side.style.setProperty('background-image'" in chapter
