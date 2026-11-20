---
id: html-01
version: 1
title: Arrive at the trailhead
stage: checkpoint
type: finish
difficulty: easy
sources:
  - rq/html-tags-and-attributes#using-requests
  - rq/html-tags-and-attributes#beautiful-soup
  - rq/html-tags-and-attributes#getting-content
  - lab/html-tags-and-attributes#Q4
  - lecture/l21
---

## Story

You've joined the rangers of Pythonia National Park. First stop: the park's
website, TrailNet.

## Learn

`requests.get(url)` downloads a page, and `.text` is its HTML as a string.
`BeautifulSoup(html, "html.parser")` turns that string into something you can
search. `soup.title` is the page's `<title>` tag.

## Task

Print the **text** of the homepage's `<title>` tag (just the words, not the tag).

```python starter
import requests
from bs4 import BeautifulSoup

response = requests.get("https://trailnet.test/")
soup = BeautifulSoup(response.text, "html.parser")

# TODO: print the text inside the page's <title> tag
```

```python check
def check(ns, out):
    if "TrailNet Home" in out and "<title>" not in out:
        return True, "You found the trailhead! The page title is 'TrailNet Home'."
    if "<title>" in out:
        return False, "Close! You printed the whole tag. Print only the text inside it."
    return False, "I don't see the page title in your output yet."
```

## Hints

- `soup.title` gives you the whole tag.
- Add `.get_text()` (or `.string`) to get only the words inside it.
