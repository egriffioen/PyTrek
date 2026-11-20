---
id: http-04
version: 2
title: Read, don't write
stage: checkpoint
type: concept
difficulty: easy
sources:
  - rq/intro-to-www#http-methods
  - lecture/l21
choices:
  - text: "GET, because it only asks the server to send something back."
    correct: true
    feedback: "Right. GET retrieves; it isn't supposed to change anything on the server."
  - text: "POST, because your program has to send the URL to the server."
    feedback: "Every request sends the URL, including GET. POST is for sending *new data* to the server, like submitting a form."
  - text: "PUT, so the server gives you the most up-to-date version of the page."
    feedback: "PUT *replaces* a page with what you send. A plain GET already returns the page as it is right now."
  - text: "Either GET or POST; they both read pages, but POST is more secure."
    feedback: "They do different jobs: GET reads, POST submits data. Neither one is a security feature by itself."
---

## Story

Ruth taps the desk. "One rule. Whoever did this has been *changing* pages.
Whatever's on the site right now is evidence. Don't touch it. Look, don't
write."

## Learn

Every HTTP request has a **method** that says what the client wants: **GET**
retrieves a resource, **POST** sends new data (like a form), **PUT** replaces
a resource, and **DELETE** removes one. `requests.get` sends a GET request.

## Task

Which HTTP method should your investigation use to read trail pages without
changing anything?
