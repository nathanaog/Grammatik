# Builds ../index.html from the sources in this folder.
# Run from inside build/:  python3 build.py
import re, json, glob, subprocess, sys, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

# 1) check every dialogue gap against the grammar tables; stop on any error
chk = subprocess.run(['node', 'checkdlg.js'], capture_output=True, text=True)
print(chk.stdout.strip().splitlines()[-1] if chk.stdout.strip() else chk.stderr)
if 'ERR' in chk.stdout or chk.returncode:
    print(chk.stdout); sys.exit('Dialogue check failed — fix the errors above.')
nc = subprocess.run(['node', 'dumpn.js'], capture_output=True, text=True)
print(nc.stdout.strip().splitlines()[-1] if nc.stdout.strip() else nc.stderr)
if 'all answers verified' not in nc.stdout:
    print(nc.stdout); sys.exit('Article/adjective card check failed.')
sem = subprocess.run(['node', 'semcheck.js'], capture_output=True, text=True)
if 'clean' not in sem.stdout:
    print(sem.stdout); sys.exit('Semantic check flagged gaps — fix or adjust the reasons above.')

# 2) assemble
strip = lambda s: re.sub(r"if \(typeof module[\s\S]*$", "", s)
head = open('head.html').read()
gen = strip(open('gen.js').read())
dlg_txt = '\n'.join(open(f).read() for f in sorted(glob.glob('dialogues/*.txt')))
out = (head + open('data.js').read() + "\n" + gen + "\n" + open('dlg.js').read() + "\n" + open('ndata.js').read() + "\n" + open('ngen.js').read() + "\n"
       + "const DLG_TXT = " + json.dumps(dlg_txt, ensure_ascii=False) + ";\n"
       + open('app.js').read() + "\n" + open('dapp.js').read()
       + "\n</script>\n</body>\n</html>\n")
open('../index.html', 'w').write(out)
print(f'index.html: {len(out):,} bytes')
