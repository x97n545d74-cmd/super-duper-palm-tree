"""Checks the private-repository push against a fake GitHub. No network."""
import os
import pathlib
import sys
import unittest
from unittest import mock

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import private  # noqa: E402


class FakeGitHub:
    """Enough of GitHub's git API to hold one repository in memory."""

    def __init__(self, files=None, refuse_blobs=False):
        self.blobs, self.trees, self.commits, self.refs, self.calls = {}, {}, {}, {}, []
        self.refuse_blobs = refuse_blobs
        if files is not None:
            entries = {n: self._blob(d) for n, d in files.items()}
            t = self._tree(entries)
            self.commits["c0"] = {"tree": t, "parents": []}
            self.refs["main"] = "c0"

    def _blob(self, data):
        sha = private.blob_sha(data)
        self.blobs[sha] = data
        return sha

    def _tree(self, entries):
        sha = "t%d" % len(self.trees)
        self.trees[sha] = dict(entries)
        return sha

    def files(self, branch="main"):
        tree = self.trees[self.commits[self.refs[branch]]["tree"]]
        return {n: self.blobs[s] for n, s in tree.items()}

    def __call__(self, method, path, body=None):
        self.calls.append((method, path.split("/git/")[-1]))
        part = path.split("/git/")[-1]
        if method == "GET" and part.startswith("ref/heads/"):
            b = part[len("ref/heads/"):]
            return (200, {"object": {"sha": self.refs[b]}}) if b in self.refs else (404, None)
        if method == "GET" and part.startswith("commits/"):
            c = self.commits[part[len("commits/"):]]
            return 200, {"tree": {"sha": c["tree"]}}
        if method == "GET" and part.startswith("trees/"):
            t = self.trees[part[len("trees/"):]]
            return 200, {"tree": [{"path": n, "sha": s, "type": "blob"} for n, s in t.items()]}
        if method == "POST" and part == "blobs":
            if self.refuse_blobs:
                return 403, None
            import base64
            return 201, {"sha": self._blob(base64.b64decode(body["content"]))}
        if method == "POST" and part == "trees":
            entries = dict(self.trees[body["base_tree"]]) if "base_tree" in body else {}
            entries.update({e["path"]: e["sha"] for e in body["tree"]})
            return 201, {"sha": self._tree(entries)}
        if method == "POST" and part == "commits":
            sha = "c%d" % len(self.commits)
            self.commits[sha] = {"tree": body["tree"], "parents": body["parents"]}
            return 201, {"sha": sha}
        if method == "PATCH" and part.startswith("refs/heads/"):
            self.refs[part[len("refs/heads/"):]] = body["sha"]
            return 200, {}
        if method == "POST" and part == "refs":
            self.refs[body["ref"][len("refs/heads/"):]] = body["sha"]
            return 201, {}
        return 500, None


class Push(unittest.TestCase):
    def test_keeps_the_other_chains_file_and_no_history(self):
        gh = FakeGitHub({"scraped.json": b'{"old": 1}'})
        self.assertEqual(private.push(gh, "o/r", "main", {"live.json": b'{"items": []}'}, "m"), "pushed")
        self.assertEqual(gh.files(), {"scraped.json": b'{"old": 1}', "live.json": b'{"items": []}'})
        self.assertEqual(gh.commits[gh.refs["main"]]["parents"], [])          # the branch keeps no history
        self.assertEqual(private.push(gh, "o/r", "main", {"scraped.json": b'{"new": 2}'}, "m"), "pushed")
        self.assertEqual(gh.files(), {"scraped.json": b'{"new": 2}', "live.json": b'{"items": []}'})

    def test_new_branch_is_created(self):
        gh = FakeGitHub({"scraped.json": b"x"})
        self.assertEqual(private.push(gh, "o/r", "test", {"live.json": b"y"}, "m"), "pushed")
        self.assertEqual(gh.files("test"), {"live.json": b"y"})
        self.assertEqual(gh.files("main"), {"scraped.json": b"x"})

    def test_unchanged_file_is_not_pushed(self):
        gh = FakeGitHub({"live.json": b"same"})
        self.assertEqual(private.push(gh, "o/r", "main", {"live.json": b"same"}, "m"), "unchanged")
        self.assertFalse([c for c in gh.calls if c[0] != "GET"])

    def test_read_only_key_is_explained(self):
        gh = FakeGitHub({"live.json": b"a"}, refuse_blobs=True)
        result = private.push(gh, "o/r", "main", {"live.json": b"b"}, "m")
        self.assertIn("Contents: Read and write", result)
        self.assertEqual(gh.files(), {"live.json": b"a"})


class Check(unittest.TestCase):
    def test_each_answer(self):
        for status, ok, words in ((200, True, "works"), (401, False, "refused"), (404, False, "cannot see"),
                                  (500, True, "trying")):
            got_ok, msg = private.check(lambda m, p, b=None, s=status: (s, None), "o/r")
            self.assertEqual(got_ok, ok)
            self.assertIn(words, msg)

    def test_key_loses_spaces_and_branch_follows_live(self):
        with mock.patch.dict(os.environ, {"PRIVATE_DATA_TOKEN": " github_pat_abc \n", "LIVE": "true"}):
            self.assertEqual(private.key(), "github_pat_abc")
            self.assertEqual(private.settings()[1], "main")
        with mock.patch.dict(os.environ, {"LIVE": "false"}):
            self.assertEqual(private.settings()[1], "test")


if __name__ == "__main__":
    unittest.main()
