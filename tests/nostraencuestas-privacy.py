"""El inyector de métricas no debe exponer enlaces ni datos administrativos."""
from pathlib import Path
import shutil
import subprocess
import tempfile
import textwrap

workflow = Path('.github/workflows/inject-analytics.yml').read_text()
code = workflow.split('        run: |\n', 1)[1].split('\n      - name: Commit changes', 1)[0]
with tempfile.TemporaryDirectory() as directory:
    pages = ['encuesta-matricula.html', 'admin-preinscripciones.html']
    for page in pages:
        shutil.copyfile(page, Path(directory) / page)
    Path(directory, 'public.html').write_text('<html><head></head><body></body></html>')
    subprocess.run(['python3', '-c', textwrap.dedent(code)], cwd=directory, check=True)
    for page in pages:
        original = Path(page).read_text()
        assert Path(directory, page).read_text() == original, page
        assert 'googletagmanager.com' not in original, page
    assert 'googletagmanager.com' in Path(directory, 'public.html').read_text()
print('PASS: páginas privadas sin métricas; seguimiento público conservado.')
