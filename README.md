# Arrivon

## 3 Tasks to Complete by Users
1. User should be able to open current mail to review incoming, or currently tracked mail and packages
2.  User should be able to open past mail to review delivered items. Use the search bar to look for a sender and use the all, and time filters to narrow the list.
3. User should be able to open More Mail Info to view the overall status of their mailbox using the Delivered, Arriving today, and On the way cards, and to see a visual trend of their mail in the weekly activity chart and the top senders list. User should be able to open any item in the Important mail list to view its details and status, and to mark mail as important from its Mail Details page. User should be able to click Home in the sidebar to return to the home screen. Clicking Log out should log the user out of the dashboard and return them to the login page.


## Project Overview

Arrivon is a React-based web application prototype designed to help users view, organize, and review their mail and package deliveries through a centralized interface.

The application uses React for its user interface, Vite for development, CSS for styling, and Lucide React for icons.

## Features

### 1. Login and Signup
- Displays the authentication interface.
- Provides the entry point to the application.

### 2. Home Dashboard
- Provides an overview of mail activity.
- Acts as the main navigation starting point.

### 3. Current Mail
- Displays current or incoming mail and package information.
- Allows users to view delivery information.

### 4. Past Mail
- Displays previously delivered mail and packages.
- Includes search and filtering controls for reviewing previous deliveries.

### 5. More Mail Information
- Provides additional information and an overview of mail activity.

### 6. Mail Details
- Displays expanded information for a selected mail or package item.

## Project Structure

```text
Arrivon-app/
├── scripts/
│   └── check-theme-contrast.mjs # Checks theme colors meet contrast requirements
├── src/
│   ├── main.jsx                 # React application entry point
│   ├── App.jsx                  # Main application component and page logic
│   ├── styles/
│   │   ├── App.css              # Component layouts and visual styling
│   │   ├── theme.css            # Light, dark, and high-contrast color themes
│   │   ├── text-size.css        # Normal, large, and extra-large text sizes
│   │   ├── responsive.css       # Tablet and phone layouts
│   │   └── index.css            # Global styles and CSS defaults
│   └── data/
│       ├── mailGenerator.js     # Generates the sample mail shown in the app
│       ├── mail.csv             # Sample senders used by the mail generator
│       └── dev-logins.csv       # Test account for logging in
├── index.html                   # HTML entry point
├── package.json                 # Dependencies and npm scripts
├── package-lock.json            # Locked dependency versions
└── vite.config.js               # Vite configuration
```

## Where to Find the Code

| File | Purpose |
|---|---|
| `src/main.jsx` | Loads React, imports the global stylesheet, and renders the main application. |
| `src/App.jsx` | Contains the main component, page navigation, login and sign-up, settings, statistics, and page rendering logic. |
| `src/styles/App.css` | Contains styles for the sidebar, dashboard, mail cards, forms, buttons, and other interface components. |
| `src/styles/theme.css` | Defines the colors for the light, dark, and high-contrast themes. Text colors meet WCAG AA contrast. |
| `src/styles/text-size.css` | Scales text for the Text size setting. |
| `src/styles/responsive.css` | Adjusts layouts for smaller screens. |
| `src/styles/index.css` | Contains global styling, default fonts, page resets, and base element rules. |
| `src/data/mailGenerator.js` | Builds the sample inbox: random subjects, statuses, tracking numbers, and dates relative to today. |
| `src/data/mail.csv` | Sample mail. Only the sender names are currently used, by the mail generator. |
| `src/data/dev-logins.csv` | The test account (name, email, password, address) available for logging in. |
| `scripts/check-theme-contrast.mjs` | Checks that the theme colors in `App.css` and `theme.css` meet contrast requirements. Run with `node scripts/check-theme-contrast.mjs`. |
| `index.html` | Defines the HTML document that loads the application. |
| `package.json` | Lists project dependencies and npm scripts, including `deploy` for publishing to GitHub Pages. |
| `vite.config.js` | Configures Vite, the `/Arrivon/` base path for GitHub Pages, and the random seed for sample mail. |

## Installation and Setup

### Prerequisites

- Node.js
- npm

### 1. Open the project directory

```bash
cd Arrivon-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

### 4. Open the application

Open the local URL printed in the terminal by Vite, commonly:

```text
http://localhost:5173
```

Use the actual URL displayed by your development server if the port is different.

## Building for Production

Run these commands from the `Arrivon-app` directory after installing dependencies.

### 1. Create the production build

```bash
npm run build
```

Vite bundles and optimizes the application into the `dist/` folder. The contents of `dist/` are static files that can be deployed to any static hosting service.

### 2. Preview the production build

```bash
npm run preview
```

This serves the `dist/` folder locally so you can check the production build before deploying it. Open the URL printed in the terminal, commonly:

```text
http://localhost:4173
```

## Technologies Used

- **React** — Builds the user interface and reusable components.
- **Vite** — Runs the development server and builds the application.
- **CSS** — Controls the layout, colors, typography, and responsive styling.
- **Lucide React** — Provides interface icons.
- **JavaScript (JSX)** — Implements application behavior and renders the pages.

## Known Limitations and Simulated Functionality

Arrivon is a front-end prototype. There is no backend, no database, and no connection to a real mail provider or carrier, so everything below runs in the browser only.

### Simulated mail data

- **Mail is randomly generated.** `src/data/mailGenerator.js` creates the inbox from the sender names in `src/data/mail.csv`. The subjects, statuses, tracking numbers, and dates are all made up. Tracking numbers are not real and cannot be looked up with a carrier.
- **The mail changes each time the app starts.** Vite sets a new random seed whenever `npm run dev` starts or the site is built (see `vite.config.js`). Refreshing the page keeps the same mail, but restarting the server or rebuilding produces a different inbox. All dates are relative to today, so Current Mail always has active deliveries and Past Mail always has a history.
- **Statuses never update.** Items do not move from "In transit" to "Delivered" over time, and there are no live delivery updates.
- **Message content is placeholder text.** The Mail Details page shows a fixed sample message instead of the original email.

### Simulated statistics (More Mail Info)

- **Top monthly senders** is a fixed list (Home Depot, Amazon, SuperSaver, Hyvee, John Doe) and is not calculated from the inbox.
- **Mail activity this week** spreads the delivered total across the days using fixed weights, and splits each day into packages and letters using fixed percentages. It does not reflect actual delivery dates.
- **Delivered** adds 5 to the number of delivered items in the inbox, so the dashboard looks populated.
- **Arriving today** and **On the way** are calculated from the generated mail.

### Simulated accounts and login

- **Not secure.** Accounts are checked in the browser, and passwords are stored and compared as plain text. The test account in `src/data/dev-logins.csv` is bundled into the app's JavaScript, so anyone can read it. Do not use real passwords.
- **New sign-ups are lost on refresh.** Accounts created on the Sign up page are kept only in memory. After reloading the page, they no longer exist and only the test account can log in.
- **Forgot password** only shows a message saying a backend is needed.
- **Each account has one delivery address**, which can only be set at sign-up. The **Edit profile** button in Settings does nothing yet.

### Placeholder controls

- **Help** in the footer shows a "coming soon" message.
- **Important mail alerts** and **Delivery status updates** in Settings can be turned on and off and are remembered, but no alerts or notifications are ever sent.

### Storage

- Read/unread status, important mail, appearance, text size, and settings are saved in the browser's `localStorage`, and the current page and logged-in user in `sessionStorage`. This data stays on one browser and one device, is not synced, and is lost if site data is cleared or in a private window.
- Read and important flags are linked to each item's ID. Because a new inbox is generated each time the app starts or is rebuilt, saved flags may end up on different mail afterward.

## Development Notes

- Add page-level behavior and navigation changes in `src/App.jsx`.
- Update the appearance of individual components in `src/styles/App.css`.
- Update application-wide styling in `src/styles/index.css`.
- Update dependencies through npm and keep `package-lock.json` synchronized.
- Keep this README updated as new features and integrations are added.

