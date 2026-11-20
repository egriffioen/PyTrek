---
id: http-02
version: 2
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
    feedback: "Yes. The client starts the conversation with a request; the server answers with a response."
  - text: "trailnet.test is the client, because it's the one sending the page back to you."
    feedback: "Both sides send something, so that can't be the difference. The client is whoever *starts* the conversation by asking."
  - text: "Only a web browser can be a client, so your Python program has to go through the browser."
    feedback: "Any program that sends a request is a client. requests.get talks to the server directly; no browser needed."
  - text: "trailnet.test is just the page's address; the server is the internet itself."
    feedback: "The internet carries the messages, but a specific computer stores TrailNet's pages and answers for them. That computer is the server."
---

## Story

Ruth slides a sticky note across the desk: *"Before you go poking at the
website, make sure you know who's talking to whom. You'll be reading a lot of
conversations."*

## Learn

The web runs on **requests** and **responses**. A **client** (a browser, or
your Python program) sends an HTTP request to a **server**, the computer that
stores the site. The server sends back a response: a status code, some
headers, and usually the page itself.

## Task

Your Python program runs `requests.get("https://trailnet.test/")`. Which is
the client and which is the server?
