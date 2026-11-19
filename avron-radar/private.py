#!/usr/bin/env python3
"""Pushes the scraped-data files to the user's private repository (config.json: private_data), where
their personal dashboard reads them with a read-only key.

  python3 avron-radar/private.py check          is the key in PRIVATE_DATA_TOKEN usable? (exit 1 if not)
  python3 avron-radar/private.py push FILE...   put these files on the branch, keeping the others there

Two chains write to the same branch: the main radar (scraped.json, every 30 minutes) and the live news
lane (live.json, every 3 minutes). Each push builds a new commit on top of the branch's current files
through GitHub's API, replacing only its own file, so neither chain overwrites the other's file and
nothing has to be downloaded. The commit has no parent, so the branch holds only the latest files.
Runs started from another branch than the default write to the test branch.
"""
import base64
import datetime
import hashlib
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
API = "https://api.github.com"


def settings():
    cfg = json.loads((HERE / "config.json").read_text(encoding="utf-8")).get("private_data") or {}
    live = os.environ.get("LIVE") == "true"
    return cfg.get("repo", ""), cfg.get("branch" if live else "test_branch", "test")


def key():
    return "".join((os.environ.get("PRIVATE_DATA_TOKEN") or "").split())     # spaces and line breaks copied with it


def make_api(token):
    """api(method, path, body) -> (status, parsed JSON or None). Never raises on HTTP errors."""
    def api(method, path, body=None):
        req = urllib.request.Request(API + path, method=method,
                                     data=None if body is None else json.dumps(body).encode(),
                                     headers={"Authorization": "Bearer " + token, "Accept": "application/vnd.github+json",
                                              "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "avron-radar"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                text = r.read().decode()
                return r.status, (json.loads(text) if text else None)
        except urllib.error.HTTPError as e:
            return e.code, None
        except (urllib.error.URLError, TimeoutError, OSError):
            return 0, None
    return api


def check(api, repo):
    """(usable, message) for the key behind api."""
    status, _ = api("GET", "/repos/" + repo)
    if status == 200:
        return True, "private data key: works and can see " + repo
    if status == 401:
        return False, ("::warning::Private data key refused by GitHub (wrong, expired or revoked; GitHub revokes any key "
                       "committed to a public repository). Make a new key and save it only as the PRIVATE_DATA_TOKEN secret.")
    if status in (403, 404):
        return False, ("::warning::Private data key works but cannot see %s. Edit the key: Repository access, "
                       "Only select repositories, %s." % (repo, repo))
    return True, "::warning::Private data key check: GitHub answered %s; trying the pushes anyway" % status


def blob_sha(data):
    return hashlib.sha1(b"blob %d\0" % len(data) + data).hexdigest()


def push(api, repo, branch, files, message):
    """files: {name in the repository: bytes}. Returns 'pushed', 'unchanged' or an error message."""
    base = "/repos/" + repo + "/git"
    status, ref = api("GET", base + "/ref/heads/" + branch)
    if status not in (200, 404):
        return "could not read the branch (GitHub answered %s)" % status
    tree_sha, have = None, {}
    if status == 200:
        status, commit = api("GET", base + "/commits/" + ref["object"]["sha"])
        if status != 200:
            return "could not read the latest commit (GitHub answered %s)" % status
        tree_sha = commit["tree"]["sha"]
        status, tree = api("GET", base + "/trees/" + tree_sha)
        if status == 200:
            have = {e["path"]: e["sha"] for e in tree.get("tree", []) if e.get("type") == "blob"}
    changed = {n: d for n, d in files.items() if have.get(n) != blob_sha(d)}
    if not changed:
        return "unchanged"
    entries = []
    for name, data in sorted(changed.items()):
        status, blob = api("POST", base + "/blobs", {"content": base64.b64encode(data).decode(), "encoding": "base64"})
        if status != 201:
            return "could not upload %s (GitHub answered %s%s)" % (
                name, status, "; the key needs Contents: Read and write" if status in (403, 404) else "")
        entries.append({"path": name, "mode": "100644", "type": "blob", "sha": blob["sha"]})
    body = {"tree": entries}
    if tree_sha:
        body["base_tree"] = tree_sha       # keep the other chain's files
    status, tree = api("POST", base + "/trees", body)
    if status != 201:
        return "could not build the file list (GitHub answered %s)" % status
    status, commit = api("POST", base + "/commits", {"message": message, "tree": tree["sha"], "parents": []})
    if status != 201:
        return "could not make the commit (GitHub answered %s)" % status
    if ref is not None:
        status, _ = api("PATCH", base + "/refs/heads/" + branch, {"sha": commit["sha"], "force": True})
        ok = status == 200
    else:
        status, _ = api("POST", base + "/refs", {"ref": "refs/heads/" + branch, "sha": commit["sha"]})
        ok = status == 201
    return "pushed" if ok else "could not move the branch (GitHub answered %s)" % status


def main(argv):
    repo, branch = settings()
    token = key()
    if not repo or not token:
        print("private data: no repository or no PRIVATE_DATA_TOKEN; skipped")
        return 1
    api = make_api(token)
    if argv[:1] == ["check"]:
        ok, msg = check(api, repo)
        print(msg)
        return 0 if ok else 1
    if argv[:1] == ["push"] and argv[1:]:
        paths = [pathlib.Path(p) for p in argv[1:]]
        missing = [str(p) for p in paths if not p.is_file()]
        if missing:
            print("private data: no such file: " + ", ".join(missing))
            return 1
        names = ", ".join(p.name for p in paths)
        stamp = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5, minutes=30))).strftime("%Y-%m-%d %H:%M IST")
        result = push(api, repo, branch, {p.name: p.read_bytes() for p in paths}, "%s %s" % (names, stamp))
        if result in ("pushed", "unchanged"):
            print("private data: %s %s to %s:%s" % (result, names, repo, branch))
            return 0
        print("::warning::Private data push of %s failed: %s" % (names, result))
        return 1
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
