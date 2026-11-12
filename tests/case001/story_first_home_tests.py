"""Static checks for story-first main-menu hierarchy and navigation wiring."""
from pathlib import Path
root = Path(__file__).resolve().parents[2]
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "cabinet-menu-v1.css").read_text(encoding="utf-8")
js = (root / "home-story-first-v1.js").read_text(encoding="utf-8")
assert 'id="storyStart"' in html
assert 'id="districtsCard"' in html
assert 'id="profileCard"' in html
assert 'id="profileBtn"' in html
assert html.index('id="districtsCard"') < html.index('data-mode="classic"')
assert html.index('data-mode="classic"') < html.index('id="profileCard"')
assert 'data-mode="classic"' in html and 'id="cabinetSettings"' in html
assert 'Хроники Бирмингема' in html
assert 'cabinet-menu-v1.css' in html and 'home-story-first-v1.js' in html
assert 'class="cabinet-scene"' in html
assert 'class="cabinet-menu"' in html
assert 'cabinet-entry-primary' in html
assert 'cabinet-room' in html
assert 'aria-label="Главное меню"' in html
assert 'dossier.click()' in js
assert '<strong>Достижения</strong>' in html
assert 'cabinet-settings-v1.js' in html
assert 'prefers-reduced-motion' in css
assert 'max-width:700px' in css
print("OK: cabinet navigation and responsive menu structure")
