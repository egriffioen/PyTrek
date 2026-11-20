---
id: http-04
version: 1
title: Read, don't write
stage: checkpoint
type: concept
difficulty: easy
sources:
  - rq/intro-to-www#http-methods
  - lecture/l21
choices:
  - text: "GET: it asks the server to send a page back."
    correct: true
    feedback: "Right. GET retrieves; it shouldn't change anything on the server."
  - text: "POST: it sends data to the server, like submitting a form."
    feedback: "POST is for sending data in. A ranger who only reads pages doesn't need it."
  - text: "DELETE: it removes a page from the server."
    feedback: "That's what the culprit might have done! A good detective only reads."
  - text: "PUT: it uploads a new version of a page."
    feedback: "That would change the site. Which method only reads?"
---

## Story

Someone has been *changing* TrailNet's pages. Your job is only to look, so you
don't destroy evidence.

## Learn

Every HTTP request has a **method** saying what the client wants: **GET**
retrieves a resource, **POST** sends data (like a form), **PUT** replaces a
resource, and **DELETE** removes one. `requests.get` sends a GET request.

## Task

Which HTTP method should your investigation use to read trail pages without
changing anything?
