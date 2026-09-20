# Run doc — Cup of Jay (static site)

No build step and no dependencies (`package.json` is absent; `package-lock.json` is a leftover). Everything is plain HTML/CSS/JS served as-is.

## Reproduce artifacts
Nothing to build or copy — no `.env` files, no generated assets. A fresh checkout is ready to serve as-is.

## Run the server
Any static file server from the project root works. The one used here:

```
python -m http.server 8123 --bind 127.0.0.1
```

- Port: **8123** (project default for this site; it was free)
- Serve from the repo root so `index.html`, `style.css`, `webpet/`, `assets/` etc. resolve
- Detached start (Windows PowerShell, stdout/stderr to separate files):

```
powershell -NoProfile -Command "(Start-Process -FilePath 'python.exe' -ArgumentList '-m','http.server','8123','--bind','127.0.0.1' -WorkingDirectory '<repo-root>' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"
```

Note: the `Start-Process` call can hang the calling shell for a while even though the server starts fine — verify with `curl http://127.0.0.1:8123/` and `Get-CimInstance Win32_Process -Filter "Name='python.exe'"` rather than waiting on the command.
