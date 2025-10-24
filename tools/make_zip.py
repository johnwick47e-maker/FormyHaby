import os, zipfile
from pathlib import Path

root = Path('.').resolve()
out = root / 'For-Haby.zip'

print(f'Creating {out} from {root}...')
with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
    for folder, subs, files in os.walk(root):
        folder_path = Path(folder)
        for f in files:
            fp = folder_path / f
            # skip the output zip if it already exists
            if fp.resolve() == out.resolve():
                continue
            # include file with relative path
            rel = fp.relative_to(root)
            zf.write(fp, rel.as_posix())
print('Done.')
print('ZIP file created at:', out)
