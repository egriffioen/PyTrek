---
id: http-01
version: 1
title: The missing trail page
stage: checkpoint
type: concept
difficulty: easy
sources:
  - rq/intro-to-www#status-codes
  - rq/intro-to-www#http-requests
  - lecture/l21
choices:
  - text: "404: the server answered, but it has no page at that address."
    correct: true
    feedback: "Right. The server is up; that page just isn't there (anymore)."
  - text: "404: the park's server is down and didn't answer at all."
    feedback: "If the server didn't answer, you wouldn't get any status code back."
  - text: "200: the page loaded, but it's empty."
    feedback: "200 means OK: the page was found and sent."
  - text: "500: you typed the URL wrong."
    feedback: "5xx codes mean something went wrong on the server's side, not yours."
---

## Story

A hiker reports that the Old Trail page "just says Trail not found." You ask
TrailNet for `https://trailnet.test/trails/old-trail.html` to see for yourself.

## Learn

Every HTTP response comes with a **status code**. Codes in the 200s mean
success, 300s mean "look somewhere else," 400s mean the request asked for
something the server can't give (like a page that doesn't exist), and 500s
mean the server itself had a problem.

## Task

Which status code would you expect back, and what does it tell you?
