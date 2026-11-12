"""Regression tests for the CI scope selector: never skip gameplay changes."""
import os
import subprocess
import tempfile
from pathlib import Path

import ci_scope


def git(root, *args):
    return subprocess.check_output(['git', *args], cwd=root, text=True).strip()


def main():
    old_cwd = Path.cwd()
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        def write(path, contents):
            file = root / path
            file.parent.mkdir(parents=True, exist_ok=True)
            if isinstance(contents, bytes):
                file.write_bytes(contents)
            else:
                file.write_text(contents, encoding='utf-8')
        def commit(message):
            git(root, 'add', '-A')
            git(root, 'commit', '-qm', message)
            return git(root, 'rev-parse', 'HEAD')
        git(root, 'init', '-q')
        git(root, 'config', 'user.name', 'CI Test')
        git(root, 'config', 'user.email', 'ci@example.invalid')
        write('case-v14.js', "const ART={intro:'intro-meeting'};\nconst mechanics = 42;\n")
        write('index.html', '<html>test</html>')
        base = commit('baseline')
        os.chdir(root)
        try:
            write('case-v14.js', "const ART={intro:'intro-meeting',yard:'yard'};\nconst mechanics = 42;\n")
            write('assets/case-scenes/yard.webp', b'RIFF0000WEBP')
            art = commit('approved art')
            scope = ci_scope.classify('pull_request', 'synchronize', art, base, True)
            assert scope[:3] == (False, False, True), scope
            assert ci_scope.classify('pull_request', 'ready_for_review', art, base, True)[0] is True
            write('case-v14.js', "const ART={intro:'intro-meeting',yard:'yard'};\nconst mechanics = 43;\n")
            logic = commit('mechanics')
            scope = ci_scope.classify('pull_request', 'synchronize', logic, art, True)
            assert scope[0] is True, scope
            write('style.css', 'body{padding:5px}')
            css = commit('style')
            scope = ci_scope.classify('pull_request', 'synchronize', css, logic, True)
            assert scope[:3] == (False, True, False), scope
            write('tests/case001/portrait_browser_tests.py', '# visual test adjusted\n')
            visual_test = commit('visual QA only')
            scope = ci_scope.classify('pull_request', 'synchronize', visual_test, css, True)
            assert scope[:3] == (False, True, False), scope
            write('case-v18.js', 'const mechanics=44;')
            script_change = commit('game logic')
            scope = ci_scope.classify('pull_request', 'synchronize', script_change, visual_test, True)
            assert scope[0] is True, scope
            assert ci_scope.classify('push', '', css, logic, True)[0] is True
            assert ci_scope.classify('workflow_dispatch', '', css, logic, False)[0] is False
        finally:
            os.chdir(old_cwd)
    print('OK: scope selector rejects gameplay edits and permits image-only changes')


if __name__ == '__main__':
    main()
