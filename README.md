# Collection

## Problem Statement

Collections is largely reactive, with standard dunning after missed payments instead of early risk detection and outreach tailored to the borrower's situation.

**Build direction:** An early-warning collections agent that scores a mock portfolio, flags likely missed payments 7–14 days early, explains risk drivers, and recommends channel and message treatments.

**Expected outcomes:**
- Identify at least 60% of accounts that will miss a payment 7–14 days ahead of due date
- Increase cure rate against a control group
- Reduce cost-to-collect by replacing blanket outreach with targeted recommendations

**Data inputs:** Repayment history, balances, transaction data, behavioural signals, past collections outcomes, and treatment history.

## Solution

### Description

Customer data is ingested from an upstream source — for this hackathon, a mock portfolio file stands in for real data. Each account is evaluated against a predefined risk matrix that produces a risk score and surfaces the key drivers behind it.

The risk score is passed to an LLM alongside a predefined treatment matrix. The LLM uses both to generate a personalised treatment recommendation per account — covering channel, message tone, and timing.

A human-in-the-loop (HITL) review step sits before any treatment is actioned. Reviewers can approve, edit, reject, or escalate each recommendation. A monitoring dashboard provides visibility across the portfolio — scores, treatment status, and outcomes.

### Process Flow

```
Customer signals
-> Early-warning risk scoring
-> Risk driver explanation
-> Personalised treatment recommendation
-> Message or action draft
-> Human approval
-> Outcome tracking
```

### Core Concept

| Step                   | Purpose                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Customer signals       | Collect repayment, balance, transaction, behaviour, and treatment-history signals.      |
| Risk scoring           | Identify customers likely to miss payment in the next 7-14 days.                        |
| Risk explanation       | Show the main reasons behind each risk score in simple language.                        |
| Personalised treatment | Recommend channel, message tone, timing, and treatment path based on the customer case. |
| Human approval         | Let a reviewer approve, edit, reject, or escalate the recommendation.                   |
| Outcome tracking       | Measure whether the treatment improves cure rate and reduces unnecessary outreach.      |
