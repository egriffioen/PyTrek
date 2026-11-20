---
id: http-01
version: 2
title: What the 404 is telling you
stage: checkpoint
type: concept
difficulty: easy
sources:
  - rq/intro-to-www#status-codes
  - rq/intro-to-www#http-requests
  - lecture/l21
choices:
  - text: "The server is up and answered you, but it has no page at that address."
    correct: true
    feedback: "Right. A 404 is the server *answering*: \"I'm here, but there's nothing at that path.\""
  - text: "TrailNet's server is down, so the page couldn't load."
    feedback: "If the server were down, nothing would answer and you'd get a connection error, not a status code. A 404 means something *did* answer."
  - text: "The page is still there, but hikers aren't allowed to see it."
    feedback: "That would be 403 Forbidden: the page exists but you may not have it. A 404 says there's nothing there to give."
  - text: "The page crashed while the server was building it."
    feedback: "Problems on the server's side are 500-level codes, like 500 Internal Server Error. The 400s mean the request asked for something the server can't provide."
---

## Story

You show Ruth the `404`. She frowns. "The volunteers keep telling me the
website is *down*. Is that what this means?"

## Learn

Every HTTP response comes with a **status code**. Codes in the 200s mean
success, 300s mean "look somewhere else," 400s mean the request asked for
something the server can't give, and 500s mean the server itself had a
problem. A few to know: `200 OK`, `403 Forbidden`, `404 Not Found`,
`500 Internal Server Error`.

## Task

What does the `404` from Old Trail actually tell you?
