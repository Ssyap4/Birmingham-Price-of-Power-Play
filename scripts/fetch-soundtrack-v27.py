"""Acquire only the seven approved recordings, validate audio and create a review artifact.
No credentials, no writes to Git refs, no runtime third-party requests.
"""
import hashlib, json, pathlib, subprocess, tempfile, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
data = json.loads((ROOT / "docs/criminal-operations/soundtrack-v27.json").read_text())
out = ROOT / "soundtrack-v27-review"
out.mkdir(exist_ok=True)
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def probe(path):
    meta = json.loads(subprocess.check_output(["ffprobe","-v","error","-show_streams","-show_format","-of","json",str(path)]))
    audio = [s for s in meta["streams"] if s["codec_type"] == "audio"]
    assert len(audio) == 1, "expected a single audio stream"
    return float(meta["format"]["duration"])
def fetch(url, target):
    req = urllib.request.Request(url, headers={"User-Agent":"BirminghamPriceOfPower/1.0 (licensed soundtrack asset retrieval)"})
    with urllib.request.urlopen(req, timeout=45) as response:
        payload = response.read(30_000_001)
        if not 10_000 < len(payload) <= 30_000_000:
            raise ValueError("Invalid payload size")
    target.write_bytes(payload)
records = []
for track in data["tracks"]:
    with tempfile.TemporaryDirectory() as temp:
        source = pathlib.Path(temp) / "source.mp3"
        errors = []
        for url in track["downloads"]:
            try:
                fetch(url, source)
                seconds = probe(source)
                if not 30 <= seconds <= 900:
                    raise ValueError("Unexpected duration")
                if track["duration"] is not None and abs(seconds-track["duration"])>5:
                    raise ValueError("Duration does not match catalog")
                break
            except Exception as exc:
                errors.append(f"{url}: {exc}")
        else:
            raise RuntimeError(f"{track['title']}: {errors}")
        target = out / track["file"]
        target.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["ffmpeg","-nostdin","-hide_banner","-loglevel","error","-y","-i",str(source),"-map","0:a:0","-vn","-map_metadata","-1","-c:a","libmp3lame","-b:a","96k","-ar","44100","-ac","2",str(target)],check=True)
        duration = probe(target)
        assert abs(duration-seconds)<1 and target.stat().st_size>10000
        subprocess.run(["ffmpeg","-nostdin","-v","error","-xerror","-i",str(target),"-f","null","-"],check=True)
        records.append({**track,"downloadedFrom":url,"sourceSha256":sha(source),"sha256":sha(target),"bytes":target.stat().st_size,"durationSeconds":round(duration,3),"changes":"MP3 re-encoded at 96 kbps; metadata removed"})
        print(track["title"], target.stat().st_size, sha(target), flush=True)
(out/"soundtrack-proof.json").write_text(json.dumps(records,indent=2)+"\n")
(out/"MUSIC-CREDITS.txt").write_text("\n".join(f"{t['title']} — {t['author']} | {t['license']} {t['licenseUrl']} | {t['source']} | {t['changes']}" for t in records)+"\n")
