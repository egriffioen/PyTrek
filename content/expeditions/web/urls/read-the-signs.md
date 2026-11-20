---
id: urls-01
version: 1
title: Read the trail signs
stage: checkpoint
type: finish
difficulty: medium
sources:
  - rq/hyperlinks#relative-vs-absolute
  - rq/hyperlinks#urljoin
  - rq/html-tags-and-attributes#accessing-attributes
  - lab/hyperlinks#Q10
  - lab/html-tags-and-attributes#Q5
  - project/04#part-4-task-1
  - lecture/l23
provides: [get_links]
---

## Story

Every page has signposts (links) pointing to other pages. Some are written as
full addresses, some are shortcuts.

## Learn

`soup.find_all("a")` returns every link tag, and `tag.get("href")` reads its
address. Many hrefs are **relative**, like `aspen-loop.html`.
`urljoin(page_url, href)` turns them into full URLs:
`urljoin("https://trailnet.test/trails/", "aspen-loop.html")` gives
`"https://trailnet.test/trails/aspen-loop.html"`.

## Task

Write `get_links(url)` that downloads the page and returns a **list of absolute
URLs** for every link on it.

```python starter
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def get_links(url):
    """Return a list of absolute URLs for every <a href> on the page at url."""
    # TODO
    return []

print(get_links("https://trailnet.test/trails/"))
```

```python check
def check(ns, out):
    f = ns.get("get_links")
    if not callable(f):
        return False, "Define a function named get_links(url)."
    got = f(B + "/trails/")
    if not isinstance(got, (list, set, tuple)):
        return False, f"get_links should return a list, but it returned a {type(got).__name__}."
    got = {str(u) for u in got}
    rel = sorted(u for u in got if not u.startswith("http"))
    if rel:
        return False, f"Some links are still relative, like {rel[0]!r}. Use urljoin(url, href) to make them full URLs."
    exp = {B + "/trails/aspen-loop.html", B + "/trails/cedar-ridge.html", B + "/trails/old-trail.html", B + "/"}
    if got != exp:
        missing, extra = sorted(exp - got), sorted(got - exp)
        parts = []
        if missing:
            parts.append("missing " + ", ".join(missing))
        if extra:
            parts.append("unexpected " + ", ".join(extra))
        return False, "On /trails/ your list is " + "; ".join(parts) + "."
    about = {str(u) for u in f(B + "/about.html")}
    if about != {B + "/"}:
        return False, f"Works on /trails/, but on /about.html you returned {sorted(about)}. Expected only {B}/"
    return True, "Every signpost read correctly, including the relative ones."
```

## Hints

- Loop over `soup.find_all("a")` and get each tag's href. Skip tags with no href.
- Append `urljoin(url, href)` to a list, then return the list.
