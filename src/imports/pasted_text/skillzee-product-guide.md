# Skillzee Product Guide

## Overview

Skillzee is a student-to-student learning marketplace built around one clear idea: students already have practical skills that other students are willing to pay for, as long as the experience feels trusted, affordable, and easy to use.

The platform positions itself as a campus-focused learning company where:

- learners can discover short, useful sessions from other students
- trainers can turn their knowledge into earnings and reputation
- both sides can coordinate quickly through chat, WhatsApp, and email
- the platform can manage trust, booking, reviews, reminders, certificates, and payouts in one journey

Skillzee is not just a listing board. It is designed as a complete service flow from discovery to booking, communication, session delivery, proof of completion, and trainer earnings.

## What The Company Offers

Skillzee serves students who want fast, practical help in skills such as design, analytics, coding, communication, portfolio building, interview preparation, and other peer-led topics.

Its value proposition is:

- affordable learning from relatable student trainers
- faster access to practical help than traditional coaching options
- trainer earning opportunities inside a trusted marketplace
- clear communication tools that reduce drop-off after booking
- visible proof of quality through ratings, reviews, badges, and leaderboard signals

## Main User Roles

### Learners

Learners use Skillzee to:

- search for useful skills and sessions
- compare trainers, prices, ratings, and delivery modes
- book a session at a preferred time
- chat before and after the session
- join the session through a meeting link or in-app video
- download certificates after completion
- review trainers after attending

### Trainers

Trainers use Skillzee to:

- create a public skill listing
- describe their topic, format, pricing, and availability
- receive bookings from learners
- coordinate through chat, WhatsApp, or email
- conduct the session
- build ratings, reviews, badges, and points
- track earnings and wallet activity

### Admin Or Marketplace Operators

Admins use Skillzee to:

- monitor total users and booking activity
- review platform revenue and gross revenue
- identify top-performing skills
- understand marketplace growth and performance health

## Core Features And Functionalities

### 1. Student Profile System

Skillzee supports profile-based trust building with:

- name, college, phone number, and profile image
- learner, trainer, or dual-role participation
- personal bio for credibility and context
- interests that support skill recommendations
- badges and points that add visible social proof

### 2. Skill Discovery Marketplace

The platform helps users browse and compare sessions through:

- searchable skill listings
- category-based browsing
- online or offline mode filtering
- trending skills
- recommended skills
- leaderboard-based trainer discovery
- favorites and saved-skill capability

### 3. Skill Detail Experience

Each skill can present:

- title and full description
- category and tags
- price and session duration
- online or offline delivery mode
- session format such as Google Meet or in-app video
- trainer profile summary
- availability slots
- learner reviews and rating summary
- direct booking access
- direct trainer contact options

### 4. Booking Workflow

The booking flow supports:

- selecting a skill
- choosing date and time
- adding notes or learning goals
- viewing total cost
- seeing platform commission and trainer payout split
- moving into a confirmed booking state
- joining follow-up communication or session access from the booking

### 5. Multi-Channel Communication

Skillzee supports three communication paths:

- in-app chat for booking-linked conversation history
- WhatsApp handoff for quick mobile-friendly coordination
- email fallback for formal or alternate contact

This is one of the platform’s strongest usability advantages because many student marketplaces lose trust when users have no easy way to coordinate after payment.

### 6. Session Delivery

The platform supports session completion through:

- external meeting links
- in-app video rooms
- booking-linked chat before, during, and after the session

### 7. Ratings, Reviews, And Trust Signals

Skillzee strengthens marketplace trust through:

- trainer ratings
- learner reviews
- completed session counts
- badges
- points
- leaderboard visibility

### 8. Wallet, Earnings, And Payment Visibility

Skillzee includes financial visibility for users through:

- available wallet balance
- pending balance
- total earnings
- total spend
- transaction tracking
- transparent platform commission model

### 9. Notifications And Reminders

The platform supports:

- booking alerts
- message alerts
- reminder notifications
- payment-related notifications
- browser notification subscription

### 10. Certificates

After a completed booking, learners can access a certificate. This improves perceived value and gives users a concrete output after the session.

### 11. Admin Visibility

The admin side gives a simple but useful operational view of:

- registered users
- booking volume
- gross revenue
- platform revenue
- top marketplace skills

## Website Routes In Detail

These are the visible user-facing routes currently represented in the project.

| Route | Purpose | Main Use |
| --- | --- | --- |
| `/` | Landing page | Introduces Skillzee and highlights trending skills, leaderboards, and core value |
| `/auth` | Account access page | Register, sign in, and choose learner or trainer role direction |
| `/explore` | Skill discovery page | Search and filter skills before booking |
| `/skills/[skillId]` | Skill details page | View full session details, trainer info, reviews, and booking/contact actions |
| `/booking?skillId=...` | Booking page | Confirm a session with timing and notes |
| `/dashboard` | User control center | View bookings, wallet, notifications, recommendations, and trainer tools |
| `/chat` | Messaging center | Manage booking-based conversations |
| `/chat?booking=...` | Direct conversation view | Open chat for a specific booking |
| `/profile` | Profile page | View and update personal profile information |
| `/how-it-works` | Process explanation page | Learn the learner and trainer journeys |
| `/admin` | Admin overview page | View marketplace performance summary |

### `/` Home

This route acts as the public marketing and discovery entry point.

What users can do here:

- understand what Skillzee is
- see the company’s promise to learners and trainers
- review featured marketplace highlights
- browse trending sessions
- discover top trainers
- move directly to skill exploration
- move directly to sign-up or sign-in

Why it matters:

- this page sells trust, affordability, and momentum
- it frames Skillzee as a serious student marketplace rather than a simple directory

### `/auth`

This route is the account onboarding and access page.

What users can do here:

- create an account
- sign in to an existing account
- choose whether they want to act as learner, trainer, or both
- add profile basics such as college, phone number, image, bio, and interests

Why it matters:

- it prepares users for both sides of the marketplace
- it supports better matching and communication from the beginning

### `/explore`

This route is the marketplace browsing page.

What users can do here:

- search skills by keyword
- filter by category
- filter by delivery mode
- scan multiple session cards quickly
- jump into the details page for any skill
- contact trainers through WhatsApp or email from listing cards

Why it matters:

- this is the main discovery engine for learner conversion
- it reduces friction between interest and booking intent

### `/skills/[skillId]`

This route is the detailed session page for a single skill.

What users can do here:

- review the full session description
- check price, duration, mode, and session format
- view trainer identity and credibility
- check availability
- read reviews from learners
- start booking
- contact the trainer directly through WhatsApp or email

Why it matters:

- this page is where trust and conversion happen
- it combines proof, convenience, and next-step action in one place

### `/booking?skillId=...`

This route is the booking confirmation page.

What users can do here:

- review the selected skill
- enter preferred date and time
- add notes, questions, or goals
- understand the payment split
- confirm the booking

Why it matters:

- it turns browsing intent into a committed session
- it creates clarity around pricing and trainer payout

### `/dashboard`

This route is the main logged-in workspace.

What users can do here:

- see upcoming bookings
- access session links
- open booking-specific chat
- download certificates after completed sessions
- view wallet balances
- see recommended skills
- review notifications
- enable browser notifications
- create a new skill listing if they are acting as a trainer
- access in-app video for eligible bookings

Why it matters:

- it combines learner and trainer operations in one practical control center
- it increases retention because users keep returning here after sign-up

### `/chat`

This route is the communication hub.

What users can do here:

- see all active booking conversations
- open one conversation at a time
- read stored message history
- send messages linked to a specific booking

Why it matters:

- it gives users a trusted communication layer inside the platform
- it prevents confusion by keeping messages connected to each booking

### `/profile`

This route is the personal identity and trust page.

What users can do here:

- view name, college, bio, and profile photo
- see badges and points
- review their role status
- update profile details
- view saved and suggested skills

Why it matters:

- marketplace trust improves when profiles feel complete and credible
- trainers benefit from a stronger personal brand

### `/how-it-works`

This route explains the full product journey.

What users can do here:

- understand the learner journey from sign-up to rating
- understand the trainer journey from listing creation to earnings
- learn how communication and notifications fit into the experience

Why it matters:

- it reduces hesitation for first-time users
- it helps both sides understand how the system works before committing

### `/admin`

This route is the marketplace overview page.

What users can do here:

- review total user count
- review booking count
- review gross revenue
- review platform revenue
- see top-performing skills

Why it matters:

- it provides a simple operator-level control surface
- it helps the company track momentum and identify what is working

## Platform API Routes In Detail

These routes represent the operational capabilities behind the platform. They are grouped by function so the product logic is easy to understand.

Base path: `/api`

### Auth Routes

#### `POST /auth/register`

Purpose:

- creates a new user account

Used for:

- onboarding a learner
- onboarding a trainer
- onboarding a user who wants both roles

What it supports:

- initial account creation
- collection of basic profile information
- role preference setup

#### `POST /auth/login`

Purpose:

- signs an existing user into the platform

Used for:

- returning learners
- returning trainers

What it supports:

- access to personal dashboard, bookings, chat, profile, and wallet information

#### `GET /auth/me`

Purpose:

- retrieves the currently signed-in user’s account data

Used for:

- loading the current user’s profile and account context
- keeping the user session personalized

#### `PATCH /auth/profile`

Purpose:

- updates the current user’s profile

Used for:

- changing personal details
- improving trainer credibility
- keeping communication details current

### Skill Routes

#### `GET /skills`

Purpose:

- returns the marketplace skill list

Used for:

- browsing all available sessions
- searching and filtering discovery results

#### `GET /skills/trending`

Purpose:

- returns trending or high-interest skill listings

Used for:

- homepage highlights
- discovery sections that push popular offerings

#### `GET /skills/recommended`

Purpose:

- returns personalized recommended skills

Used for:

- dashboard recommendations
- improving repeat engagement and cross-sell discovery

#### `GET /skills/leaderboard`

Purpose:

- returns top trainers or top-ranked participants

Used for:

- homepage leaderboard sections
- trust building through visible performance

#### `GET /skills/:skillId`

Purpose:

- returns the full details for a single skill

Used for:

- skill detail pages
- booking preparation
- review display

#### `POST /skills`

Purpose:

- creates a new skill listing

Used for:

- trainer onboarding into supply-side marketplace participation
- expanding available learning inventory

#### `POST /skills/:skillId/favorite`

Purpose:

- saves or favorites a skill for a user

Used for:

- creating a personal shortlist
- helping recommendation quality improve
- encouraging return visits

### Booking Routes

#### `POST /bookings`

Purpose:

- creates a new booking

Used for:

- turning a selected skill into a scheduled session
- capturing learner intent, timing, and notes

#### `GET /bookings`

Purpose:

- returns the current user’s bookings

Used for:

- dashboard session lists
- booking history
- trainer schedule visibility

#### `PATCH /bookings/:bookingId/status`

Purpose:

- changes booking status

Used for:

- confirming a booking
- marking completion
- handling cancellation or status progression

#### `POST /bookings/:bookingId/review`

Purpose:

- adds a learner review after a booking

Used for:

- rating trainers
- building trust for future bookings

#### `GET /bookings/:bookingId/certificate`

Purpose:

- provides the booking completion certificate

Used for:

- learner proof of completion
- added post-session value

#### `POST /bookings/reminders/run`

Purpose:

- runs session reminder delivery

Used for:

- reducing missed sessions
- improving attendance and professionalism

### Chat Routes

#### `GET /chat/conversations`

Purpose:

- returns booking-linked conversation summaries

Used for:

- chat inbox view
- active discussion tracking

#### `GET /chat/:bookingId/messages`

Purpose:

- returns message history for a booking

Used for:

- loading a conversation thread
- showing session-specific communication history

#### `POST /chat/:bookingId/messages`

Purpose:

- sends a new message inside a booking conversation

Used for:

- clarifying session details
- asking pre-session questions
- post-booking coordination

### Notification Routes

#### `GET /notifications`

Purpose:

- returns the current user’s notifications

Used for:

- booking alerts
- reminders
- message notices
- payment-related updates

#### `PATCH /notifications/:notificationId/read`

Purpose:

- marks a notification as read

Used for:

- keeping the notification center organized
- reducing clutter

#### `POST /notifications/subscribe`

Purpose:

- saves a browser notification subscription

Used for:

- push alerts on supported devices and browsers

### Payments And Wallet Routes

#### `GET /payments/wallet`

Purpose:

- returns wallet and payment summary information

Used for:

- showing available balance
- showing pending balance
- showing total earnings and spend
- listing payment records

#### `POST /payments/simulate`

Purpose:

- supports simulated payment behavior for safe flow validation or product demonstration

Used for:

- testing or demo payment scenarios
- checking how payment and payout logic behaves in a controlled way

### Admin Route

#### `GET /admin/overview`

Purpose:

- returns a high-level marketplace summary

Used for:

- total user tracking
- booking count tracking
- revenue visibility
- top skill monitoring

## How To Use Skillzee

## Learner Journey

1. Visit the home page and understand what the platform offers.
2. Create an account or sign in.
3. Browse skills on the explore page.
4. Open a skill detail page and compare the trainer, reviews, price, and schedule.
5. Contact the trainer if needed through chat, WhatsApp, or email.
6. Confirm a booking by selecting a date and adding notes.
7. Check the dashboard for booking status, notifications, and session access.
8. Join the session through the meeting link or in-app video.
9. After completion, leave a review and download the certificate.

## Trainer Journey

1. Create an account and choose trainer or both-role participation.
2. Complete the profile with clear trust-building details.
3. Go to the dashboard and publish a skill listing.
4. Add title, description, category, price, duration, session type, tags, and availability.
5. Receive booking requests and notifications.
6. Communicate with learners through the platform or external contact channels.
7. Conduct the session.
8. Track completed sessions, ratings, badges, and wallet activity.

## Admin Journey

1. Open the admin page.
2. Review the latest marketplace numbers.
3. Monitor revenue and booking growth.
4. Identify top-performing skills and categories.
5. Use the insights to improve discovery, promotions, and trainer support.

## Current Strengths Of The Product

- clear marketplace identity focused on students
- dual-value model for both learners and trainers
- complete flow from discovery to booking to completion
- communication options that match real student behavior
- transparent commission structure
- trust-building through reviews, badges, and leaderboard visibility
- practical dashboard for repeat engagement
- certificate support that adds outcome value

## Detailed Recommendations To Make The Site Better For Users

The platform already has a strong base. The next improvements should focus on trust, conversion, retention, and reliability.

### 1. Stronger Trust And Safety Layer

Recommended additions:

- verified college email onboarding
- identity verification badge for trainers
- manual review for new trainers before first listing goes live
- abuse reporting for users, messages, and listings
- trainer cancellation score visible internally
- learner no-show tracking

Why this matters:

- peer marketplaces rise or fall based on trust
- stronger verification will increase booking confidence
- quality control protects the company brand early

### 2. Better Search And Filtering

Recommended additions:

- price range filter
- rating filter
- duration filter
- language filter
- beginner, intermediate, advanced filters
- sort by most booked, highest rated, lowest price, fastest availability
- instant suggestions while typing

Why this matters:

- discovery becomes faster
- users find better-fit trainers with less effort
- conversion improves when people reach relevant listings quickly

### 3. Richer Trainer Profiles

Recommended additions:

- sample work or portfolio links
- intro video from trainer
- social proof highlights
- response time badge
- repeat learner count
- subject-specific achievements
- session outcomes section

Why this matters:

- better trainer pages increase booking confidence
- trainers can differentiate themselves beyond price alone

### 4. More Powerful Booking Experience

Recommended additions:

- visible calendar-based availability
- timezone handling
- reschedule workflow
- cancellation rules
- one-click repeat booking
- session agenda template
- automatic pre-session checklist

Why this matters:

- scheduling friction is one of the biggest reasons users abandon marketplaces
- clearer time handling and flexibility improve completion rates

### 5. Better Session Quality Support

Recommended additions:

- structured session notes area
- shared resource upload section
- post-session summary sent automatically
- session recording option where appropriate
- action items and homework tracking
- learning progress history

Why this matters:

- users remember outcomes, not just meetings
- stronger learning continuity leads to repeat bookings

### 6. Stronger Review System

Recommended additions:

- detailed review categories such as clarity, usefulness, punctuality, and communication
- review prompts based on actual session quality
- highlighted verified reviews
- trainer replies to reviews
- review sorting by most helpful or most recent

Why this matters:

- detailed reviews increase trust
- better review quality improves conversion on skill pages

### 7. Improved Learner Retention

Recommended additions:

- learning streaks
- saved learning plans
- course path suggestions across multiple sessions
- repeat booking discounts
- personalized homepage recommendations
- resume-friendly proof of skills learned

Why this matters:

- the business becomes stronger when learners return often
- retention is cheaper and more valuable than constant new-user acquisition

### 8. Better Trainer Growth Tools

Recommended additions:

- trainer analytics dashboard
- earnings by week and month
- profile conversion metrics
- listing performance metrics
- suggested pricing guidance
- recommendation on best-performing categories
- prompts to optimize underperforming listings

Why this matters:

- better trainer success creates better supply
- skilled trainers will stay if the platform helps them grow income

### 9. More Mature Wallet And Payment Experience

Recommended additions:

- withdrawal request flow
- payout history page
- refund management
- coupon and referral credits
- earning forecasts for trainers
- clear invoice or receipt access

Why this matters:

- money visibility builds trust
- trainers need confidence that the platform treats earnings professionally

### 10. Communication Upgrades

Recommended additions:

- file sharing in chat
- voice note support
- quick replies
- automatic suggested messages before sessions
- unread indicators and message search
- call escalation option from chat

Why this matters:

- fast communication reduces booking failure
- users increasingly expect richer chat experiences

### 11. Community And Network Effects

Recommended additions:

- campus ambassador program
- college-level communities or circles
- themed learning challenges
- public trainer spotlights
- referral leaderboard
- skill clubs and cohort sessions

Why this matters:

- communities make the platform harder to leave
- word-of-mouth can become a major growth engine

### 12. Better Onboarding For First-Time Users

Recommended additions:

- guided first-session recommendation after sign-up
- role-based onboarding flow
- simple “what do you want to learn” setup
- first listing checklist for trainers
- new-user education tips inside dashboard

Why this matters:

- first-time clarity improves activation
- users are more likely to complete their first meaningful action

### 13. Improved Accessibility And Inclusivity

Recommended additions:

- multi-language support
- caption-friendly session support
- color contrast improvements where needed
- clear text alternatives for important actions
- inclusive skill categories

Why this matters:

- broader usability improves adoption
- accessible products build stronger brand reputation

### 14. Better Admin And Operations Tools

Recommended additions:

- moderation queue for reported listings and messages
- trainer approval queue
- category-level revenue insights
- retention and repeat-booking dashboards
- user churn signals
- reminder success tracking

Why this matters:

- a marketplace becomes harder to manage as it grows
- operational visibility helps the company scale with fewer problems

### 15. Stronger Conversion Features

Recommended additions:

- featured listings
- urgent availability badge
- “book within 24 hours” section
- comparison view for similar trainers
- first-session offer
- trust guarantee messaging

Why this matters:

- conversion improves when users can decide faster
- better merchandising increases revenue without forcing higher prices

## Highest Priority Next Moves

If the goal is to improve user experience and business performance quickly, the most valuable additions would be:

1. verified trainer trust system
2. richer search and filtering
3. calendar-based booking and rescheduling
4. stronger review depth
5. trainer analytics and payout workflows
6. file sharing and better communication tools
7. onboarding improvements for first-time learners and trainers

## Final Product Positioning

Skillzee has the foundation of a strong student marketplace company because it already connects:

- discovery
- trust
- scheduling
- communication
- session delivery
- reviews
- rewards
- earnings

With stronger trust controls, better discovery, richer trainer identity, and more polished booking support, it can become a much more compelling product for students who want practical, affordable, and outcome-focused peer learning.
