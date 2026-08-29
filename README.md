# Support Ticket Portal

A Support Ticket Portal prototype built with Laravel 11 and React. This application allows client organizations to submit and track support tickets, and enables internal support agents to manage, prioritize, and resolve them securely.

**Author:** Martha Yulinda Lbn Tobing

---

## Setup Instructions

1. Clone the repository: `git clone https://github.com/marthayulinda/support-ticket-portal`
2. Install PHP dependencies: `composer install`
3. Install Node dependencies: `npm install`
4. Copy the environment file: `cp .env.example .env`
5. Generate the application key: `php artisan key:generate`
6. Configure your database credentials in the `.env` file (e.g., MySQL or SQLite).
7. Run migrations and seed the database: `php artisan migrate:fresh --seed`
8. Compile frontend assets: `npm run dev`
9. Start the local server: `php artisan serve`
10. Run tests: `php artisan test`

### Test Credentials (from Seeder)
* **Agent:** `agent@envolutions.test` | Password: `password`
* **Client (Acme Corp):** `client@acme.test` | Password: `password`
* **Client (Globex Inc):** `client@globex.test` | Password: `password`

---

## 1. Frontend Approach

**Choice:** React paired with Inertia.js and Tailwind CSS.

**Why:** The assignment requested a JavaScript frontend consuming data from Laravel, explicitly advising against server-driven UI approaches like Livewire/Volt. 
I chose Inertia.js because it perfectly aligns with Laravel's conventional MVC architecture. It allows React to render views based on standard Laravel Controller responses (returning JSON data seamlessly under the hood) without the overhead of building a separate, complex API layer or managing client-side state (like Redux). This resulted in a fast, SPA-like user experience while keeping the backend logic strictly inside Laravel. Tailwind CSS was used for rapid, responsive, and clean UI development.

## 2. Architecture & Key Design Decisions

* **Thin Controllers, Fat Models:** Business logic, such as SLA calculation, is kept out of the controllers. I utilized Laravel's Eloquent `creating` model event on the `Ticket` model to automatically calculate and assign the `sla_deadline` before the ticket is inserted into the database.
* **Dynamic Accessors:** Instead of storing the real-time SLA status (On Track, Due Soon, Overdue) in the database, I used a Laravel Eloquent Accessor (`getSlaStatusAttribute`). This ensures the UI always displays the most accurate status calculated dynamically against the current server time (`Carbon::now()`).
* **Route Grouping & Separation of Concerns:** Client routes and Agent routes are strictly separated using prefixes and dedicated controllers (`ClientTicketController` vs `AgentTicketController`) to prevent accidental data exposure and maintain clean code boundaries.

## 3. SLA Rules

SLA deadlines are calculated strictly based on the ticket's priority at the time of creation or update.
* **High Priority:** 4 Hours limit.
* **Normal Priority:** 24 Hours limit.
* **Low Priority:** 3 Days limit.

**SLA UI Indicators:**
* `On Track`: The deadline is more than 2 hours away.
* `Due Soon`: The deadline is approaching within the next **2 hours**.
* `Overdue`: The current time has surpassed the deadline.

## 4. Roles & Permission Model

Authentication is handled via standard Laravel Breeze, customized to require an `organization_id` upon registration. Authorization is enforced using **Laravel Policies** and **Gates**.

* **Client Users:** 
  * Tied to a specific `organization_id`.
  * Policies restrict them to only `view`, `create`, and `reply` to tickets belonging to their organization.
  * **Visibility Enforcement:** Internal notes (`is_internal = true`) are filtered out at the Eloquent query level within the `ClientTicketController`. This guarantees that internal notes are never passed to the Inertia payload or rendered in the Client's React DOM.
* **Support Agents:** 
  * Identified by the `role = 'agent'` column.
  * Have global read access to all organizations' tickets.
  * Can update ticket statuses, priorities, assign tickets to themselves or peers, and write `is_internal` replies.

## 5. Scope of Work

**What was implemented:**
* Full authentication and customized registration (assigning clients to companies).
* Complete ticket lifecycle (Open -> In Progress -> Resolved -> Closed).
* Automated SLA calculation and real-time status indication.
* Role-specific dashboards (Client vs. Agent).
* Multi-parameter filtering for Agents (by Organization, Status, and Priority).
* Full conversation threading, including the critical isolation of Internal Notes.
* Automated Feature Tests covering SLA accuracy, Role isolation, and Internal Note visibility.

**What was deliberately left out (Timeboxing constraints):**
* Email/System notifications and Laravel Queues.
* File attachments for tickets.
* Advanced text formatting (WYSIWYG editor) for ticket descriptions and replies.

---

## 6. Next Steps & Known Limitations

If I were to expand this prototype into a production-ready application, I would focus on the following improvements:

1. **Invitation-Based Registration (Limitation Shortcut):** Currently, the registration page allows public sign-ups where users can freely select an organization from a dropdown. In a real B2B environment, this is a security risk. **Next step:** Disable open registration and implement an Admin-only invitation system, sending secure, tokenized registration links via email.
2. **SLA Configuration (Refactoring):** I am not entirely satisfied with hardcoding the SLA hours (4h, 24h, 3 days) directly inside the Model. **Next step:** Move these rules into a `configs/sla.php` file or a dedicated database table so administrators can adjust SLA policies without altering the code.
3. **Audit Trails:** Implement a `ticket_logs` table (perhaps using model observers) to track every state change (e.g., "Agent A changed status from Open to In Progress at [Time]") to maintain a strict historical record.
4. **Queue & Events:** Implement Laravel Queues to send automated email alerts to clients when a ticket status changes, and to agents when a ticket becomes "Due Soon".