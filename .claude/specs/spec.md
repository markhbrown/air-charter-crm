# Senior Web Developer – Technical Test (1‑Day Hackathon)

## 1\. Project brief – Air Charter Broker CRM

You have been engaged by an air charter broker to prototype an internal CRM to help their small team manage day‑to‑day sales activity.
Today, the broker is using a mix of spreadsheets, emails, and WhatsApp to track:

- Which **companies** they work with
- The **contacts** at those companies
- The **inquiries** (requests for charter quotes) coming in each day
  This makes it hard to answer basic questions such as:
- “How many new inquiries did we get this week, and from which clients?”
- “Which deals are currently in ‘Quoting’ vs ‘Won’ vs ‘Lost’?”
- “Who are our key contacts at a given operator or corporate client?”
  Your task is to design and build a small but well-structured web application that could form the foundation of this CRM.
  You have **one working day (7 hours)** to work on this.
  If you feel you need more time to complete a coherent solution, you can request an extension and should call out what you would do with more time.
  At the end, you should be able to:
- Walk us through your **approach and decisions**
- Demo the app
- Show your **GitHub repo structure and branching approach**
- Explain how you used AI/vibe coding tools (if you did)

---

## 2\. Functional requirements

## Core domain

Your CRM should model the following:

- **Company**
  - Name
  - Country
  - Notes
- **Contact**
  - Name
  - Email
  - Role (e.g. Ops Manager, CEO)
  - Belongs to a Company
- **Inquiry**
  - Linked to a Company and (optionally) a Contact
  - Origin airport
  - Destination airport
  - Date of flight
  - Status (e.g. New, Quoting, Won, Lost)

## Minimum features

At minimum, please implement:

- A way to **sign in** and use the application (see security section below)
- A UI to **create and list Companies**
- A UI to **create and list Contacts**, associated with a Company
- A UI to **create and list Inquiries**, associated with a Company (and optionally a Contact)
- Basic validation and error handling (e.g. required fields, sensible defaults, user feedback on errors)
  You are **encouraged (but not required)** to add more features if time allows, for example:
- Filtering or searching inquiries by status, date, or company
- Sorting lists (e.g. latest inquiries first)
- Simple dashboards or counts (e.g. “New this week”, “Open inquiries”)
- Notes or activity log against an Inquiry
- Lightweight role or permissions modelling (e.g. broker vs admin)
  If you add additional features, please document them briefly in the README.

---

## 3\. Security & data access

Security and data access are important in this role.
You must:

- Use **Supabase** for:
  _ Authentication (sign-up / sign-in) **and/or**
  _ **Row Level Security (RLS)** policies to ensure users can only access their own data (or a defined subset)
  At minimum, your solution should demonstrate **one** of:

1. Supabase Auth, with users only able to see their own records via RLS policies; or
2. A clear explanation and partial implementation of how you would secure the data using Supabase RLS in a multi-user environment.
   You do **not** need full role-based access control, but you should show that you understand:

- How data is tied to a user (e.g. storing `user_id` and using it in RLS)
- How to prevent users from accessing other users’ records
  Please include a short note in your README describing your security approach and any limitations.

---

## 4\. Tech stack & tools

Please use:

- **Next.js** (TypeScript)
- **Vercel** for hosting and deployment
- **Supabase** for the database, and for auth/RLS as above
- **GitHub** for version control and collaboration
  Strongly encouraged:
- **ShadCN** (or similar component library) for UI components where possible
- **AI-assisted / vibe coding tools** such as Cursor, VS Code + Copilot, Claude, Gemini, etc.
- Optional automation/integration tools such as **n8n**, GitHub Actions, or similar, if you want to demonstrate additional initiative
  If you use AI or automation tools, please:
- Mention which ones you used
- Explain how they assisted your workflow (e.g. scaffolding, refactoring, tests, docs)

---

## 5\. Architecture & GitHub expectations

## Application design

We will be looking for:

- A sensible **data model** and relationships in Supabase (companies, contacts, inquiries, and any additional tables you add)
- A clear separation of concerns in your Next.js project (e.g. `app/` or `pages/`, `components/`, `lib/`/`services/` for data access)
- Thoughtful decisions about where logic lives (server components, server actions, API routes, client components)
- Use of ShadCN or similar for consistent UI patterns where practical

## Git & branching

Assume this project will eventually have multiple developers working on it.
In your GitHub repo, please demonstrate:

- A **main branch** that represents deployable code
- At least one **feature branch** (e.g. `feature/crm-schema`, `feature/inquiries-ui`) merged via pull request or similar, showing how you would work in a team
- Meaningful commit messages that reflect your progress and thought process
  In your README, include a short subsection:
  > ***Branching & collaboration*** *– explaining the branching model you chose (e.g. simple feature branches off* *`main`\_\_) and how you would extend it for a small team.*

---

## 6\. Deliverables

By the end of the exercise, please provide:

1. **GitHub repository**
   - Clear **README** including:
     - Project overview
     - Setup instructions (including Supabase env vars)
     - How to run locally
     - Link to the live deployment on Vercel
     - Security/auth approach and any limitations
     - Brief notes on AI/automation tools used
     - “If I had more time” – what you would do next
2. **Deployed app on Vercel**
   - A working URL we can use to try the app
   - Either a demo account or simple sign-up/sign-in flow
3. **Presentation & walkthrough (during interview)**
4. Be prepared to spend 15–20 minutes walking us through:
   - Your understanding of the brief and how you scoped the work
   - Your **data model** (tables, relationships, any RLS you implemented)
   - Key parts of your **file structure** and why you organised it that way
   - How you approached security with Supabase Auth / RLS
   - Your **GitHub branching strategy** and how you’d scale it to a small team
   - Where and how you used AI/vibe coding tools
   - Trade-offs you made given the timebox, and what you would improve in a real engagement

---

## 7\. What we will evaluate

- **System design & data modelling** – how you structure the CRM domain and security
- **Code quality & structure** – clarity, modularity, TypeScript usage, conventions
- **Web fundamentals** – handling of data fetching, errors, loading states, and basic performance considerations
- **UI & UX** – practical, usable screens with coherent layout and component use
- **Security awareness** – correct use of Supabase auth/RLS at an appropriate level for a 1‑day build
- **Collaboration readiness** – Git branches, commit hygiene, and how you’d work with other developers
- **Use of modern tools** – how you integrate AI-assisted coding and any extra tools (e.g. n8n) thoughtfully rather than as a gimmick

The goal is not to produce a perfect product in 7 hours, but to show how you think and operate as a senior engineer: how you structure problems, make trade-offs, and use modern tooling to deliver value quickly.
