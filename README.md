# MSME CONNECT Summit 2026

Official event website for the **Chamber of Indian Micro, Small and Medium Enterprises (CIMSME)**, in association with **DMA**.

A responsive landing page and registration system for **MSME CONNECT Summit 2026** — India's platform connecting MSMEs with government schemes, funding opportunities, and industry experts.

[Visit Website](https://msmeconnectsummit.indiansmechamber.com)
## Features

### Public website
- Single-page responsive event site (`index.html`)
- Hero section with chief guest, date, venue, and highlights
- Past event photo gallery and benefits slider
- Summit topics, speakers, FAQs, and contact sections
- Online registration modal with seat categories (Micro, Small, Medium, Startup, Professionals, Other)
- WhatsApp quick contact and sticky “Register Now” CTA
- Payment redirect via Razorpay link after form submission

### Backend & admin
- PHP REST-style API for registration submissions
- CSRF protection and IP-based rate limiting
- MySQL storage for registrations and optional file uploads
- Admin panel to view, filter, export, and manage payment status
- Secure admin login with session management and lockout protection

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | PHP 8+ |
| Database | MySQL / MariaDB |
| Server | Apache (with `.htaccess`) |

## Project Structure

MSME-Connect/ ├── index.html # Event landing page ├── styles.css # Site styles ├── script.js # Frontend logic & registration form ├── images/ # Logos, speakers, gallery assets ├── api/ │ ├── csrf.php # CSRF token endpoint │ └── submit.php # Registration submission API ├── admin/ # Admin dashboard & login ├── config/ # App & database configuration ├── database/ │ └── schema.sql # MySQL schema ├── includes/ # Auth, validation, repositories ├── storage/ # Logs & install lock (not committed) └── uploads/ # Uploaded files (not committed)


## Requirements
- PHP 8.0 or higher
- MySQL 5.7+ or MariaDB 10.3+
- Apache with `mod_rewrite` enabled
- Composer **not** required (plain PHP project)
## Installation

