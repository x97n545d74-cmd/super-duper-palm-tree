#!/usr/bin/env python3
"""Estimate how long a Hinglish VO script takes to read aloud.

Calibrated on AVRON's own Tia Mirza reads (faster-whisper word timings):
thali 2.47 w/s, Viviana 2.49-2.54, fuel gap 2.44, Musk 2.71, footballer 2.04.
Default 2.45 words/s, pauses included.

Digits are read as words, so a token like 3,59,000 or 18.5% costs more than
one word. Each numeric token is charged by its spoken length (rough
Hindi/English place-value count).

Usage:
  python3 vo_fit.py script.txt [--target 60] [--wps 2.45]
  cat script.txt | python3 vo_fit.py - --target 60
Lines starting with '#' or '|' and text inside [brackets] are ignored, so a
production note or table row doesn't get counted.
"""
import argparse
import re
import sys

NUM = re.compile(r"^[₹$]?\d[\d,]*(\.\d+)?(%|x|cr|lakh|k)?$", re.I)


def spoken_len(tok: str) -> int:
    digits = re.sub(r"[^\d.]", "", tok)
    whole, _, frac = digits.partition(".")
    whole = whole.lstrip("0") or "0"
    n = len(whole)
    # Indian place values: each of crore / lakh / hazaar / sau group adds ~2 words
    words = 1 if n <= 2 else 2 if n == 3 else 3 if n <= 5 else 5 if n <= 7 else 7
    if frac:
        words += 1 + len(frac)  # "point" + each digit
    if tok.startswith(("₹", "$")):
        words += 1
    if tok.endswith("%"):
        words += 1  # "percent"
    return words


def count(text: str) -> tuple[int, int]:
    words = numbers = 0
    for line in text.splitlines():
        s = line.strip()
        if not s or s.startswith(("#", "|")):
            continue
        s = re.sub(r"\[[^\]]*\]", " ", s)
        for tok in re.findall(r"[^\s]+", s):
            tok = tok.strip(".,!?…:;\"'()“”‘’—-")
            if not tok:
                continue
            if NUM.match(tok):
                numbers += 1
                words += spoken_len(tok)
            else:
                words += 1
    return words, numbers


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("--target", type=float, default=60.0)
    ap.add_argument("--wps", type=float, default=2.45)
    a = ap.parse_args()
    text = sys.stdin.read() if a.path == "-" else open(a.path, encoding="utf-8").read()
    words, numbers = count(text)
    secs = words / a.wps
    budget = int(a.target * a.wps)
    verdict = "FITS" if secs <= a.target else f"OVER by {secs - a.target:.1f}s, cut ~{words - budget} words"
    print(f"spoken words (numbers expanded): {words}  numeric tokens: {numbers}")
    print(f"estimated read at {a.wps} w/s: {secs:.1f}s  target {a.target:.0f}s  budget {budget} words")
    print(verdict)


if __name__ == "__main__":
    main()
