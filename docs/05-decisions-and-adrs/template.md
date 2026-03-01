# Architecture Decision Record (ADR) Template

Every time the team sits down and makes a major choice, log it here using a simple template:

* **Title:** e.g., *0003-Extract-Emails-to-Background-Service*
* **Status:** Accepted / Proposed / Rejected
* **Context:** "Sending emails during the HTTP request is causing the frontend to hang."
* **Decision:** "We will offload email processing to a background worker / asynchronous function."
* **Consequences:** "Pros: Faster API response. Cons: Harder to track if an email fails to send."
