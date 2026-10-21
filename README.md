# Arrivon

## 3 Tasks to Complete by Users
1. User should be able to open current mail to review incoming, or currently tracked mail and packages

2.  User should be able to open past mail to review delivered items. Use the search bar to look for a sender and use the all, and time filters to narrow the list.
3. User should be able to view overall mail status in their mailbox (ex. delivered, sent, address) and should be able to identitfy each and also should be able to see a vusual trend of mails in their box. Also should be able to click on important mail and view anything important and should be able to click on the mail to view its status and also should be able to click on Needs Signature to view any mail that requires a signature. User should be able to click on logo to return to home screen and if the log out button is clicked it should log the user out of the main dashboard and land in the login page.

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
├── src/
│   ├── App.jsx       # Main application component and page logic
│   ├── App.css       # Component layouts and visual styling
│   ├── index.css     # Global styles and CSS defaults
│   └── main.jsx      # React application entry point
├── index.html        # HTML entry point
├── package.json      # Dependencies and npm scripts
├── package-lock.json # Locked dependency versions
└── vite.config.js    # Vite configuration
```

## Where to Find the Code

| File | Purpose |
|---|---|
| `src/main.jsx` | Loads React, imports the global stylesheet, and renders the main application. |
| `src/App.jsx` | Contains the main component, page navigation, mail data, and page rendering logic. |
| `src/App.css` | Contains styles for the sidebar, dashboard, mail cards, forms, buttons, and other interface components. |
| `src/index.css` | Contains global styling, default fonts, page resets, and base element rules. |
| `index.html` | Defines the HTML document that loads the application. |
| `package.json` | Lists project dependencies and available npm scripts. |
| `vite.config.js` | Configures Vite and its React integration. |

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

## Current Limitations

- The application is a prototype.
- Mail information may use sample data rather than a connected mail provider.
- Authentication should not be considered production-ready unless a secure authentication service has been integrated.
- Search, filters, and other interactions depend on the functionality implemented in the current version.
- Persistent storage and live delivery updates require appropriate backend or external service integration.

## Development Notes

- Add page-level behavior and navigation changes in `src/App.jsx`.
- Update the appearance of individual components in `src/App.css`.
- Update application-wide styling in `src/index.css`.
- Update dependencies through npm and keep `package-lock.json` synchronized.
- Keep this README updated as new features and integrations are added.

