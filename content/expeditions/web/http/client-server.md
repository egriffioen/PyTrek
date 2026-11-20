---
id: http-02
version: 1
title: Who asks, who answers
stage: checkpoint
type: concept
difficulty: easy
sources:
  - rq/intro-to-www#client-server
  - rq/intro-to-www#http-requests
  - lecture/l21
choices:
  - text: "Your program is the client; the computer running trailnet.test is the server."
    correct: true
    feedback: "Yes. The client asks (sends a request); the server answers (sends a response)."
  - text: "trailnet.test is the client, because it sends you the page."
    feedback: "Sending the page is the server's job. Who started the conversation?"
  - text: "There's no server; the page is already on your computer."
    feedback: "The page lives on another computer until your program asks for it."
  - text: "Your program and trailnet.test are both servers."
    feedback: "One side asks and the other answers. Which side is asking?"
---

## Story

Hikers say TrailNet pages are vanishing. Before you can investigate, you need
to know how a program even gets a web page.

## Learn

The web runs on **requests** and **responses**. A **client** (a browser, or
your Python program) sends an HTTP request to a **server**, the computer that
stores the site. The server sends back a response: a status code, some
headers, and usually the page itself.

## Task

Your Python program runs `requests.get("https://trailnet.test/")`. Which is
the client and which is the server?
