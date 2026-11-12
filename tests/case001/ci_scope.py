"""Choose fast art/UI QA or full Case 001 regression for an incremental PR update.

A CI run triggered by a PR synchronization normally represents one pushed commit.
Visual-only changes (CSS, images, UI screenshots and QA wiring) run fast browser checks.
Game logic, persistence, branching and unknown changes require full story regression.
Weekly scheduled runs remain full; manual full suite is opt-in.
"""
import argparse
import os
import re
import subprocess
from pathlib import Path


def git(*args):
    return subprocess.check_output(['git', *args], text=True).strip()


def art_table_only(base, head):
    """Prove case-v14.js has *no* modifications outside const ART."""
    def without_art(rev):
        source = git('show', f'{rev}:case-v14.js')
        matches = list(re.finditer(r'const ART=\{[\s\S]*?\};', source))
        if len(matches) != 1:
            raise ValueError('Cannot uniquely identify const ART')
        m = matches[0]
        return source[:m.start()] + '<SCENE_ART_TABLE>' + source[m.end():]
    try:
        return without_art(base) == without_art(head)
    except (subprocess.CalledProcessError, ValueError):
        return False


def stylesheet_links_only(base, head):
    """HTML-only addition/removal of CSS links is presentation, not gameplay."""
    def strip_stylesheets(rev):
        source = git('show', f'{rev}:index.html')
        tags = re.findall(r'<link\s+rel="stylesheet"\s+href="[^"]+\.css(?:\?[^"]*)?"\s*/?>', source)
        if not tags:
            raise ValueError('Missing stylesheet links')
        return re.sub(r'<link\s+rel="stylesheet"\s+href="[^"]+\.css(?:\?[^"]*)?"\s*/?>', '', source)
    try:
        return strip_stylesheets(base) == strip_stylesheets(head)
    except (subprocess.CalledProcessError, ValueError):
        return False


def classify(event, action, head, before, manual_full):
    if event == 'schedule':
        return True, True, True, 'weekly scheduled full regression'
    if event == 'push':
        return True, True, True, 'main integration full regression'
    if event == 'workflow_dispatch':
        return manual_full, manual_full, True, 'manual full' if manual_full else 'manual quick'
    if event != 'pull_request' or action != 'synchronize':
        return True, True, True, 'PR baseline or approval transition'

    try:
        # Use the webhook's previous head when supplied. GitHub PR synchronize
        # events may omit it; in our single-commit art workflow use HEAD^.
        base = before if re.fullmatch('[0-9a-f]{40}', before or '') else git('rev-parse', f'{head}^')
        git('merge-base', '--is-ancestor', base, head)
        paths = git('diff', '--name-only', '--diff-filter=ACDMRT', base, head).splitlines()
    except subprocess.CalledProcessError:
        return True, True, True, 'cannot establish safe change range'
    if not paths:
        return True, True, True, 'no incremental diff; fail closed'

    art = False
    ui = False
    full = False
    for path in paths:
        if path == 'index.html':
            if stylesheet_links_only(base, head):
                ui = True
            else:
                full = True
        elif path == 'case-v14.js':
            if art_table_only(base, head):
                art = True
            else:
                full = True
        elif path == 'tests/case001/art_continuity_tests.py' or path == 'tests/case001/scene_art_gallery.py' or path == 'SCENE_MANIFEST_v5.json':
            art = True
        elif path.startswith('assets/') and path.lower().endswith(('.webp', '.png', '.jpg', '.jpeg', '.svg')):
            art = True
        elif path.endswith('.css'):
            ui = True
        elif path in (
            'tests/case001/story_home_browser_tests.py',
            'tests/case001/portrait_browser_tests.py',
            'tests/case001/mobile_layout_tests.py',
            'tests/case001/mobile_safety_tests.py',
            'tests/case001/campaign_browser_tests.py',
            '.github/workflows/case001-tests.yml',
        ):
            # Browser UI/test infrastructure changes are quick-QA, not story logic.
            ui = True
        elif path.endswith(('.md', '.txt')) or path.startswith('docs/'):
            pass
        else:
            full = True
    if full:
        ui = True
    return full, ui, art, ', '.join(paths[:12])


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--event', required=True)
    p.add_argument('--action', default='')
    p.add_argument('--head', default='')
    p.add_argument('--before', default='')
    p.add_argument('--manual-full', default='true')
    p.add_argument('--out', default='')
    a = p.parse_args()
    full, ui, art, reason = classify(a.event, a.action, a.head, a.before, a.manual_full.lower() != 'false')
    report = f'full={str(full).lower()}\nui={str(ui).lower()}\nart={str(art).lower()}\n'
    print(f'Case 001 QA scope: full={full}, ui={ui}, art={art}; {reason}')
    if a.out:
        with open(a.out, 'a', encoding='utf-8') as f:
            f.write(report)
    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a', encoding='utf-8') as f:
            f.write(f'### Case 001 QA scope\n- Full story suite: **{full}**\n- Browser UI: **{ui}**\n- Artwork QA: **{art}**\n- Changed: `{reason}`\n')


if __name__ == '__main__':
    main()
