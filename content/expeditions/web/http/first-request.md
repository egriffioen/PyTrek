---
id: http-03
version: 1
title: Knock on the door
stage: checkpoint
type: tweak
difficulty: easy
sources:
  - rq/intro-to-www#http-requests
  - rq/intro-to-www#status-codes
  - rq/html-tags-and-attributes#using-requests
  - project/04#part-2-task-1
  - lecture/l21
---

## Story

Start with a trail you know is fine: Aspen Loop. Then try the Old Trail page
that hikers are complaining about.

## Learn

`requests.get(url)` sends a request and gives back a **response** object.
`response.status_code` is the server's status code, and `response.text` is
the page it sent back.

## Task

Run the code to see Aspen Loop's status code. Then change **one thing** so it
requests `https://trailnet.test/trails/old-trail.html` instead, and run it
again.

```python starter
import requests

response = requests.get("https://trailnet.test/trails/aspen-loop.html")
print(response.status_code)
```

```python check
def check(ns, out):
    asked = [short(u) for u in LOG]
    if "/trails/old-trail.html" not in asked:
        return False, "Run it once as is, then change the URL to the Old Trail page."
    if "404" not in out:
        return False, "You requested the Old Trail page; now print its status_code."
    return True, "404! The server is up, but the Old Trail page is gone."
```

## Hints

- Only the URL inside `requests.get(...)` needs to change.
- Replace `aspen-loop.html` with `old-trail.html`.
