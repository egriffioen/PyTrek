---
id: crawling-02
version: 1
title: Find the summit code
stage: milestone
type: puzzle
difficulty: medium
sources:
  - rq/web-scraping#extracting-data
  - rq/html-tags-and-attributes#finding-elements
  - lab/web-scraping#Q2
  - lab/html-tags-and-attributes#Q12
  - lecture/l24
uses: [crawl]
---

## Story

Somewhere on a public trail page, a ranger hid a summit code. Find it without
sneaking into staff-only pages.

## Learn

`soup.find_all("p", class_="clue")` finds paragraphs with `class="clue"`. Your
`crawl()` from the last checkpoint is loaded, so you can loop over every public
page.

## Task

Print the summit code hidden on the park's public pages.

```python starter
import requests
from bs4 import BeautifulSoup
# crawl(start) from the last checkpoint is already loaded.

for url in crawl("https://trailnet.test/"):
    # TODO: fetch the page, look for <p class="clue">, and print what it says
    pass
```

```python check
def check(ns, out):
    if "RANGERS-ONLY" in out:
        return False, "That code came from the staff-only ranger log. Your crawler shouldn't be going there."
    if "BRISTLECONE" in out:
        return True, "Summit code found: BRISTLECONE. You crawled the park the polite way. Trail complete!"
    return False, "No summit code in your output yet."
```

## Hints

- For each URL, make a soup from `requests.get(url).text`.
- Then `for clue in soup.find_all("p", class_="clue"): print(clue.get_text())`.
