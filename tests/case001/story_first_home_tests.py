"""Fast structural acceptance for the active portrait-first cinematic menu."""
from pathlib import Path
root=Path(__file__).resolve().parents[2]
html=(root/"index.html").read_text(encoding="utf-8")
css=(root/"cinema-home-v1.css").read_text(encoding="utf-8")
audio=(root/"audio-v1.js").read_text(encoding="utf-8")
assert 'id="home" class="screen cinema-home"' in html
ids=("districtsCard","criminalEntry","storyStart","profileCard","cabinetProfile")
assert all(html.count('id="'+i+'"')==1 for i in ids)
assert html.count('<button class="cabinet-entry')==6
assert html.index('id="districtsCard"') < html.index('id="criminalEntry"')
assert html.index('id="criminalEntry"') < html.index('data-mode="classic"')
assert '<strong>Достижения</strong>' in html
assert '<strong>Профиль</strong>' in html
assert 'cabinetSettings' not in html
assert 'cabinet-menu-v1.css' not in html
assert 'home-story-first-v1.js' not in html
assert 'player-overview-cinema-v1.css' in html
assert 'aria-label="Главное меню"' in html
assert 'cinema-rainfall' in css and 'cinema-smoke' in css and 'cinema-vinyl' in css
assert 'prefers-reduced-motion:reduce' in css
assert 'night-on-the-docks.mp3' in audio and 'menu-original.ogg' in audio
assert 'case-fog.ogg' in audio and 'case-ledger.ogg' in audio and 'case-shadows.ogg' in audio
assert "assets/cabinet/cinema-home-art-v12.webp" in css
print("PASS: isolated cinematic home V12, six routes, original two-track audio")
