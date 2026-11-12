// IMPORTS
// React state manages the interactive pages and forms.
// Lucide React supplies the icons used in the interface.
// App.css contains the component-level visual styles.
import React, { useEffect, useId, useState } from 'react';
import mailCsv from './mail.csv?raw';
import devLoginCsv from './dev-logins.csv?raw';

import {
  Mail, Inbox, Clock, Package, ChartColumn, Search,
  ChevronRight, ChevronDown, Plus, X, Menu, CheckCircle,
  LogOut, ArrowLeft, User, Eye, EyeOff, FileSignature, CircleAlert,
  Bell, ShieldCheck, Zap, Settings, Sun, Moon, MapPin, Pencil, Star
} from 'lucide-react';

import './App.css';
import './theme.css';
import './text-size.css';
import './responsive.css';

// Convert the CSV rows into the message shape used by the app.
function parseMailCsv(csv) {
  const rows = csv.trim().split(/\r?\n/).map((line) => {
    const values = [];
    let value = '';
    let quoted = false;

    for (let i = 0; i < line.length; i += 1) {
      const character = line[i];
      if (character === '"' && line[i + 1] === '"' && quoted) {
        value += '"';
        i += 1;
      } else if (character === '"') {
        quoted = !quoted;
      } else if (character === ',' && !quoted) {
        values.push(value);
        value = '';
      } else {
        value += character;
      }
    }
    values.push(value);
    return values;
  });

  const [headers, ...records] = rows;
  return records
    .filter((row) => row.some((value) => value.trim()))
    .map((row, index) => {
      const record = Object.fromEntries(headers.map((header, i) => [header.trim(), row[i]?.trim() ?? '']));
      const rawStatus = record.deliveryStatus || 'Received';
      const status = {
        'In Transit': 'In transit',
        'Out for Delivery': 'Out for delivery',
        'Ready for Pickup': 'Ready for pickup',
      }[rawStatus] || rawStatus;

      return {
        id: index + 1,
        sender: record.sender,
        subject: record.subject,
        tracking: record.trackingNumber,
        date: record.date,
        time: record.time,
        category: record.category,
        status,
        deliveredAt: status === 'Delivered' ? record.date : undefined,
        orderedAt: record.orderDate || undefined,
        estimatedDelivery: status === 'Delivered' ? undefined : record.estimatedDelivery || undefined,
        unread: true,
      };
    });
}

// Format a CSV date (YYYY-MM-DD) for display, e.g. "Oct 26, 2026".
// The parts are read as a local date so the day never shifts by time zone.
function formatDate(isoDate) {
  const date = parseLocalDate(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// Format a CSV time (HH:MM:SS) for display, e.g. "2:25 PM".
function formatTime(time) {
  const [hours, minutes] = (time || '').split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return '';
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(undefined, {
    hour: 'numeric', minute: '2-digit',
  });
}

const mailFromCsv = parseMailCsv(mailCsv);

// New mail starts unread. Remember opened messages separately for each account.
function getInitialMail(user) {
  let readIds = new Set();
  let importantChoices = {};
  try {
    const saved = JSON.parse(localStorage.getItem(`arrivonReadMail:${user?.email}`) || '[]');
    readIds = new Set(Array.isArray(saved) ? saved : []);
  } catch { /* Start unread if the stored read state is unavailable. */ }
  try {
    const saved = JSON.parse(localStorage.getItem(`arrivonImportantMail:${user?.email}`) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) importantChoices = saved;
  } catch { /* Keep the default important messages if storage is unavailable. */ }
  return mailFromCsv.map((item) => ({
    ...item,
    unread: !readIds.has(item.id),
    important: typeof importantChoices[item.id] === 'boolean'
      ? importantChoices[item.id]
      : ['Receipt', 'Personal'].includes(item.category),
  }));
}

function getStatusClass(status) {
  const statusClasses = {
    'Action Required': 'action-required',
    Delayed: 'delayed',
    Received: 'received',
    'In transit': 'in-transit',
    'Out for delivery': 'out-for-delivery',
    'Ready for pickup': 'ready-for-pickup',
    Delivered: 'delivered',
  };

  return statusClasses[status] || 'unknown';
}

// Development-only accounts for exercising the prototype login form.
const devAccounts = devLoginCsv
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => {
    const [name, email, password, address = ''] = line.split(',');
    return { name, email: email.toLowerCase(), password, address };
  });

function getRememberedUser() {
  try {
    const storedUser = localStorage.getItem('arrivonRememberedUser');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function getSessionUser() {
  try {
    const storedUser = sessionStorage.getItem('arrivonSessionUser');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function getCurrentUser() {
  return getSessionUser() || getRememberedUser();
}

function getStoredSelectedMail() {
  try {
    const selectedMailId = Number(sessionStorage.getItem('arrivonSelectedMail'));
    return getInitialMail(getCurrentUser()).find((item) => item.id === selectedMailId) || null;
  } catch {
    return null;
  }
}

function getInitialPage() {
  const user = getCurrentUser();
  const authPages = ['login', 'signup'];
  const appPages = ['home', 'current', 'past', 'more', 'details', 'settings'];

  try {
    const storedPage = sessionStorage.getItem('arrivonPage');
    if (authPages.includes(storedPage)) return storedPage;
    if (appPages.includes(storedPage) && user) {
      if (storedPage !== 'details' || getStoredSelectedMail()) return storedPage;
    }
  } catch {
    return user ? 'home' : 'signup';
  }

  return user ? 'home' : 'signup';
}

// Breakpoint shared with the CSS (max-width: 760px) for the mobile drawer.
const MOBILE_QUERY = '(max-width: 760px)';

// REUSABLE BRAND LOGO
// Displays the Arrivon logo. The compact option is used
// in places such as the sidebar and footer.
function Logo({ compact = false }) {
  return (
    <div className={`auth-brand logo ${compact ? 'compact' : ''}`}>
      <div className="auth-brand-mark">
        <Mail size={compact ? 20 : 23} strokeWidth={1.8} />
        <span />
      </div>
      <span className="auth-brand-name">Arrivon</span>
      <span className="auth-brand-tagline">MAIL, IN MOTION</span>
    </div>
  );
}
// Defined outside App so React does not remount it on every keystroke.
function SearchBar({ search, setSearch, senderNames }) {
  const suggestionsId = useId();
  const query = search.trim().toLowerCase();
  const suggestions = query
    ? senderNames.filter((sender) => sender.toLowerCase().startsWith(query))
    : [];
  return (
    <div className="search-box">
      <Search size={18} />

      <input
        type="text"
        aria-label="Search mail by sender, subject, or tracking number"
        list={suggestions.length ? suggestionsId : undefined}
        autoComplete="off"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search sender, subject, or tracking number..."
      />
      {suggestions.length > 0 && (
        <datalist id={suggestionsId}>
          {suggestions.map((sender) => <option key={sender} value={sender} />)}
        </datalist>
      )}

      {search && (
        <button
          type="button"
          onClick={() => setSearch('')}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
// Read a CSV date (YYYY-MM-DD) as local midnight. `new Date('2026-11-11')`
// is UTC midnight, which is still the previous day in US time zones.
function parseLocalDate(dateString) {
  const [year, month, day] = (dateString || '').split('T')[0].split('-').map(Number);
  return year && month && day ? new Date(year, month - 1, day) : new Date(NaN);
}

function isToday(dateString) {
  if (!dateString) return false;

  const date = parseLocalDate(dateString);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}
// MAIN APP COMPONENT AND STATE
// Stores the current page, sample mail, account state,
// search/filter values, selected message, and UI notices.
function App() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [page, setPage] = useState(() => getInitialPage());
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('arrivonDarkMode') === 'true'; }
    catch { return false; }
  });
  const [highContrast, setHighContrast] = useState(() => {
    try { return localStorage.getItem('arrivonHighContrast') === 'true'; }
    catch { return false; }
  });
  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('arrivonSettings') || '{}');
      return {
        importantMailAlerts: saved.importantMailAlerts ?? true,
        deliveryUpdates: saved.deliveryUpdates ?? true,
        showTrackingNumbers: saved.showTrackingNumbers ?? true,
        textSize: ['normal', 'large', 'extra-large'].includes(saved.textSize) ? saved.textSize : 'normal',
      };
    } catch {
      return {
        importantMailAlerts: true,
        deliveryUpdates: true,
        showTrackingNumbers: true,
        textSize: 'normal',
      };
    }
  });
  const [mail, setMail] = useState(() => getInitialMail(user));
  const [accounts, setAccounts] = useState(() => devAccounts);
  const [search, setSearch] = useState('');
  const [pastPeriodFilter, setPastPeriodFilter] = useState('All');
  const [senderFilter, setSenderFilter] = useState('All');
  const [selectedMail, setSelectedMail] = useState(() => getStoredSelectedMail());
  const [previousPage, setPreviousPage] = useState(() => {
    try {
      const storedPreviousPage = sessionStorage.getItem('arrivonPreviousPage');
      return ['home', 'current', 'past', 'more'].includes(storedPreviousPage)
        ? storedPreviousPage
        : 'current';
    } catch {
      return 'current';
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [expanded, setExpanded] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_QUERY).matches
  );

  // Track the mobile breakpoint. Phones use a slide-out drawer opened by the
  // menu button; on desktop the sidebar expands when hovered, so no button.
  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const sync = (event) => {
      setIsMobile(event.matches);
      if (!event.matches) setMenuOpen(false);
    };
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // While the mobile drawer is open, Escape closes it and the page
  // behind it stops scrolling.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const [notice, setNotice] = useState('');
  const senderNames = [...new Set(mail.map((item) => item.sender).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  const importantMail = mail.filter((item) => item.important);

  // PAGE NAVIGATION
  // Changes the active page and closes the mobile menu.
  function navigate(next) {
    setPage(next);
    sessionStorage.setItem('arrivonPage', next);
    setMenuOpen(false);
  }

  function updateSetting(name, value) {
    const updatedSettings = { ...settings, [name]: value };
    setSettings(updatedSettings);
    try { localStorage.setItem('arrivonSettings', JSON.stringify(updatedSettings)); }
    catch { /* Keep settings usable when browser storage is unavailable. */ }
  }

  function resetMailFilters() {
    setSearch('');
    setPastPeriodFilter('All');
    setSenderFilter('All');
  }

  function changeAppearance(isDark) {
    setDarkMode(isDark);
    try { localStorage.setItem('arrivonDarkMode', String(isDark)); } catch { /* Keep the session preference when storage is unavailable. */ }
  }

  function changeHighContrast(enabled) {
    setHighContrast(enabled);
    try { localStorage.setItem('arrivonHighContrast', String(enabled)); } catch { /* Keep the session preference when storage is unavailable. */ }
  }


  // TEMPORARY NOTIFICATION
  // Shows a toast message and clears it after three seconds.
  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  }

  // SEARCH AND FILTER LOGIC
  // Filters mail by search text, sender, and selected date range.
  const activeDateFilter = page === 'past' ? pastPeriodFilter : 'All';
  const visibleMail = mail.filter((item) => {
    const query = search.toLowerCase().trim();

    // Search sender, subject, tracking number, and delivery status.
    const searchable = [
      item.sender,
      item.subject,
      item.tracking,
      item.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = searchable.includes(query);

    // Filter by sender.
    const matchesSender =
      senderFilter === 'All' || item.sender === senderFilter;


    // Filter by date range using actual timestamps.
    let matchesDate = true;

    if (activeDateFilter !== 'All') {
      const messageDate = parseLocalDate(item.date);
      const cutoff = new Date();

      if (activeDateFilter === 'Last 7 Days') {
        cutoff.setDate(cutoff.getDate() - 7);
      } else if (activeDateFilter === 'Last 40 Days') {
        cutoff.setDate(cutoff.getDate() - 40);
      } else if (activeDateFilter === 'Last 30 Days') {
        cutoff.setDate(cutoff.getDate() - 30);
      } else if (activeDateFilter === 'Last 3 Months') {
        cutoff.setMonth(cutoff.getMonth() - 3);
      } else if (activeDateFilter === 'Last 6 Months') {
        cutoff.setMonth(cutoff.getMonth() - 6);
      } else if (activeDateFilter === 'Last 9 Months') {
        cutoff.setMonth(cutoff.getMonth() - 9);
      } else if (activeDateFilter === 'Last 1 Year') {
        cutoff.setFullYear(cutoff.getFullYear() - 1);
      } else if (activeDateFilter === 'Last 2 Years') {
        cutoff.setFullYear(cutoff.getFullYear() - 2);
      } else if (activeDateFilter === 'Last 5 Years') {
        cutoff.setFullYear(cutoff.getFullYear() - 5);
      }

      matchesDate =
        !Number.isNaN(messageDate.getTime()) &&
        messageDate >= cutoff &&
        messageDate <= new Date();
    }


    return matchesSearch && matchesSender && matchesDate;
  });

  const currentMail = visibleMail.filter((item) => {
    // Keep delivered packages in Current Mail for the day of delivery.
    if (item.status === "Delivered") {
      return isToday(item.deliveredAt);
    }

    // Keep orders still being processed or shipped in Current Mail.
    return item.status !== 'Delivered';
  });

  const pastMail = visibleMail.filter((item) => {
    return (
      item.category === "Package" &&
      item.status === "Delivered" &&
      item.deliveredAt &&
      !isToday(item.deliveredAt) &&
      parseLocalDate(item.deliveredAt) < new Date()
    );
  });
  const availableSearchSenders = [...new Set(
    (page === 'past' ? pastMail : currentMail).map((item) => item.sender).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
  // OPEN A MAIL ITEM
  // Remembers the current page, selects the message,
  // marks it as read, and navigates to its details.
  function openMail(item) {
    setPreviousPage(page);
    setSelectedMail({ ...item, unread: false });
    sessionStorage.setItem('arrivonPreviousPage', page);
    sessionStorage.setItem('arrivonSelectedMail', String(item.id));

    const updatedMail = mail.map((m) =>
      m.id === item.id ? { ...m, unread: false } : m
    );
    setMail(updatedMail);
    try {
      localStorage.setItem(`arrivonReadMail:${user?.email}`, JSON.stringify(
        updatedMail.filter((message) => !message.unread).map((message) => message.id)
      ));
    } catch { /* Read state still works for this session when storage is unavailable. */ }

    navigate('details');
  }

  function toggleImportant(item) {
    const important = !item.important;
    const updatedMail = mail.map((message) =>
      message.id === item.id ? { ...message, important } : message
    );
    setMail(updatedMail);
    setSelectedMail((selected) => selected?.id === item.id ? { ...selected, important } : selected);
    try {
      localStorage.setItem(`arrivonImportantMail:${user?.email}`, JSON.stringify(
        Object.fromEntries(updatedMail.map((message) => [message.id, message.important]))
      ));
    } catch { /* Changes still work for this session when storage is unavailable. */ }
    notify(important ? 'Added to Important Mail in More Mail Info.' : 'Removed from Important Mail.');
  }

  // SIGN-UP HANDLER
  // Validates passwords, prevents duplicate emails,
  // creates a local prototype account, and returns to the login page.
  function createAccount(event) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = data.get('name').toString().trim();
    const email = data.get('email').toString().trim();
    const password = data.get('password').toString();
    const confirm = data.get('confirmPassword').toString();

    if (password !== confirm) {
      notify('Your passwords do not match.');
      return;
    }

    if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      notify('That email already has an account.');
      return;
    }

    const account = {
      name,
      email: email.toLowerCase(),
      password,
      address: data.get('address').toString()
    };

    setAccounts((old) => [...old, account]);
    navigate('login');
    notify('Congratulations! Your account has been created. Please log in.');
  }

  // LOGIN HANDLER
  // Checks credentials against accounts stored in React state.
  // This is prototype-only authentication, not a secure backend.
  function login(event) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = data.get('email').toString().trim().toLowerCase();
    const password = data.get('password').toString();

    const account = accounts.find(
      (a) => a.email.toLowerCase() === email && a.password === password
    );

    if (!account) {
      notify('Account not found. Please create an account first.');
      return;
    }

    setUser(account);
    setMail(getInitialMail(account));
    const { name, email: accountEmail, address } = account;
    sessionStorage.setItem('arrivonSessionUser', JSON.stringify({
      name,
      email: accountEmail,
      address,
    }));
    if (data.get('remember') === 'on') {
      localStorage.setItem('arrivonRememberedUser', JSON.stringify({
        name,
        email: accountEmail,
        address,
      }));
    } else {
      localStorage.removeItem('arrivonRememberedUser');
    }
    navigate('home');
    notify('Welcome back!');
  }

  // SIDEBAR NAVIGATION ITEMS
  // Maps each page identifier to its label and icon.
  const navItems = [
    { id: 'home', label: 'Home', icon: Inbox },
    { id: 'current', label: 'Current Mail', icon: Mail },
    { id: 'past', label: 'Past Mail', icon: Clock },
    { id: 'more', label: 'More Mail Info', icon: ChartColumn },
  ];

  // REUSABLE PAGE HEADER
  // Displays the page title, subtitle,
  // and optional action button.
  function renderHeader({ title, subtitle, action }) {
    return (
      <header className="page-header">
        <div className="header-leading">
          {/* Phones only: desktop opens the sidebar by hovering over it. */}
          {isMobile && (
            <button
              className="icon-button sidebar-toggle"
              type="button"
              onClick={() => setMenuOpen((isOpen) => !isOpen)}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="app-sidebar"
            >
              {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
            </button>
          )}

          <div className="header-copy">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>

        {action && <div className="header-action">{action}</div>}
      </header>
    );
  }

  // SIDEBAR AND MOBILE NAVIGATION
  // Renders page links, unread count, connection status,
  // settings, logout, and the signed-in profile.
  function renderSidebar() {
    return (
      <>
        <button
          className={`overlay ${menuOpen ? 'open' : ''}`}
          type="button"
          aria-label="Close navigation menu"
          aria-hidden={!menuOpen}
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />

        <aside
          id="app-sidebar"
          className={`sidebar ${menuOpen ? 'open' : ''}`}
          aria-label="Main navigation"
        >
          <div className="sidebar-top">
            <div className="sidebar-brand">
              <Logo compact />
            </div>
            <button
              className="icon-button mobile-close"
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMenuOpen(false)}
            >
              <X size={19} />
            </button>
          </div>

          <div className="nav-label">YOUR MAILBOX</div>
          <nav>
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`nav-link ${page === id ? 'active' : ''}`}
                onClick={() => navigate(id)}
                aria-current={page === id ? 'page' : undefined}
                aria-label={label}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            {user && (
              <div className="profile" title={user.name}>
                <div className="avatar" aria-hidden="true">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
            )}

            <button
              type="button"
              className={`nav-link ${page === 'settings' ? 'active' : ''}`}
              onClick={() => navigate('settings')}
              aria-current={page === 'settings' ? 'page' : undefined}
              aria-label="Settings"
            >
              <Settings size={18} aria-hidden="true" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              className="nav-link"
              aria-label="Log out"
              onClick={() => {
                setUser(null);
                localStorage.removeItem('arrivonRememberedUser');
                sessionStorage.removeItem('arrivonSessionUser');
                navigate('login');
              }}
            >
              <LogOut size={18} aria-hidden="true" />
              <span>Log out</span>
            </button>
          </div>
        </aside>
      </>
    );
  }

  // REUSABLE MAIL LIST
  // Displays mail rows or an empty state when no messages
  // match the active search and filters.
  function MailRows({ items }) {
    if (!items.length) {
      return (
        <div className="empty-state">
          <Search size={30} />
          <h3>No mail found</h3>
          <p>Try another search or clear your filters.</p>

          <button
            className="secondary-button"
            onClick={() => {
              setSearch('');
              setPastPeriodFilter('All');
              setSenderFilter('All');
            }}
          >
            Clear filters
          </button>
        </div>
      );
    }

    return items.map((item) => (
      <button
        className={`mail-row ${item.unread ? 'unread' : 'read'}`}
        key={item.id}
        aria-label={`${item.unread ? 'Unread' : 'Read'}: ${item.sender}. ${item.subject}. ${item.date}. ${item.status}`}
        onClick={() => openMail(item)}
      >
        <div className="sender-avatar">{item.sender.charAt(0)}</div>

        <div className="mail-row-content">
          <div className="mail-row-top">
            <strong>{item.sender}</strong>
            <span>{item.date}</span>
          </div>

          <div className="mail-subject">{item.subject}</div>

          <div className="mail-tracking">
            {settings.showTrackingNumbers
              ? (item.tracking === '—' ? item.category : `Tracking: ${item.tracking}`)
              : item.category}
          </div>
        </div>

        <span className={`status status-${getStatusClass(item.status)}`}>
          {item.status}
        </span>

        <ChevronRight className="row-arrow" size={17} />
      </button>
    ));
  }

  // MAIL SEARCH INPUT
  // Updates the shared search value and lets the user
  // clear the search field.
  // MAIL SEARCH INPUT

  // REUSABLE SECTION HEADING
  // Shows a section title, explanatory text, and action link.
  function SectionHeading({ title, subtitle, action, onAction }) {
    return (
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <button className="text-button" onClick={onAction}>
          {action} <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  // DASHBOARD STATISTIC CARD
  // Displays a clickable metric that navigates to a related page.
  function StatCard({ icon, label, value, caption, onClick }) {
    return (
      <button className="stat-card" onClick={onClick}>
        <div className="stat-icon">{icon}</div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{caption}</small>
      </button>
    );
  }

  // REUSABLE PANEL HEADING
  // Displays the icon and title at the top of a content panel.
  function PanelHeading({ title }) {
    return (
      <div className="panel-heading">
        <div className="panel-icon">
          <Mail size={17} />
        </div>
        <strong>{title}</strong>
      </div>
    );
  }
  // LOGIN AND SIGN-UP SCREENS
  // Renders the authentication layout before the user
  // enters the main Arrivon application.
  if (page === 'login' || page === 'signup') {
    const signup = page === 'signup';

    return (
      <div className="auth-layout">
        {/* Branding and introduction panel */}
        <section className="auth-art">
          <Logo />

          <div className="auth-art-center">
            <h2>Your mail,<br /><span>moving in sync.</span></h2>
            <p>
              Get notified the moment your mail arrives — so you're always in
              the loop.
            </p>

            <div className="auth-benefits">
              <div className="auth-benefit">
                <span className="auth-benefit-icon"><Bell size={20} fill="currentColor" /></span>
                <span><strong>Instant Notifications</strong><small>Know when your mail arrives.</small></span>
              </div>
              <div className="auth-benefit">
                <span className="auth-benefit-icon"><ShieldCheck size={20} fill="currentColor" /></span>
                <span><strong>Stay Organized</strong><small>Never miss what matters.</small></span>
              </div>
              <div className="auth-benefit">
                <span className="auth-benefit-icon"><Zap size={20} fill="currentColor" /></span>
                <span><strong>Simple &amp; Secure</strong><small>Your information stays private.</small></span>
              </div>
            </div>
          </div>

          <small className="auth-footer">
            A LITTLE MORE ARRIVED, EVERY DAY
          </small>
        </section>

        {/* Authentication form */}
        <main className="auth-main">
          <div className="auth-mobile-logo">
            <Logo />
          </div>

          <div className="auth-card">
            <span className="eyebrow">
              {signup ? 'GET STARTED' : 'WELCOME BACK'}
            </span>

            <h1>{signup ? 'Create your account' : 'Welcome to Arrivon'}</h1>

            <p className="auth-subtitle">
              {signup
                ? 'Create an account and keep every delivery and important update in sync.'
                : 'Sign in to see what’s arrived and stay in the loop.'}
            </p>

            {/* Uses the appropriate form handler for each screen */}
            <form className={signup ? 'signup-form' : 'login-form'} onSubmit={signup ? createAccount : login}>
              {signup && (
                <>
                  <label>
                    Full name
                    <input name="name" placeholder="Jane Doe" required />
                  </label>

                  <label>
                    Address
                    <input
                      name="address"
                      placeholder="123 Main St, Lincoln, NE"
                    />
                  </label>
                </>
              )}

              <label className="auth-field-wide">
                Email
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </label>

              {/* Password input with show/hide control */}
              <label>
                Password
                <div className="password-field">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    minLength="6"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword
                      ? <EyeOff size={17} />
                      : <Eye size={17} />}
                  </button>
                </div>
              </label>

              {/* Confirmation field appears only during signup */}
              {signup && (
                <label>
                  Confirm password
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    minLength="6"
                    required
                  />
                </label>
              )}

              {/* Additional login controls */}
              {!signup && (
                <div className="form-extras">
                  <label className="remember">
                    <input type="checkbox" name="remember" />
                    Remember me
                  </label>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      notify('Password recovery needs a backend.')
                    }
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                className="primary-button full-width"
                type="submit"
              >
                {signup ? 'Create account' : 'Log in'}
                <ChevronRight size={17} />
              </button>
            </form>

            {/* Switches between login and signup */}
            <div className="auth-switch">
              {signup
                ? 'Already have an account?'
                : "Don't have an account?"}

              <button onClick={() => navigate(signup ? 'login' : 'signup')}>
                {signup ? 'Log in' : 'Sign up'}
              </button>
            </div>

            <div className="secure-note">
              Your information stays private
            </div>
          </div>

          {/* Displays temporary success or error messages */}
          {notice && <div className="toast">{notice}</div>}
        </main>
      </div>
    );
  }

  const deliveredCount = mail.filter((m) => m.status === 'Delivered').length + 5;
  const mailMetrics = [
    ['DELIVERED', deliveredCount, 'Successfully received'],
    ['SENT', 3, 'Recent activity'],
    ['ADDRESSES', 4, 'Saved destinations'],
  ];
  const dailyActivityWeights = [2, 13, 10, 8, 12, 15, 9];
  const dailyActivityWeightTotal = dailyActivityWeights.reduce((total, weight) => total + weight, 0);
  const dailyActivity = dailyActivityWeights.map((weight) => {
    const exactCount = (weight / dailyActivityWeightTotal) * deliveredCount;
    return { count: Math.floor(exactCount), remainder: exactCount % 1 };
  });
  const unassignedDeliveries = deliveredCount - dailyActivity.reduce((total, day) => total + day.count, 0);
  const remainderOrder = dailyActivity
    .map((day, index) => ({ index, remainder: day.remainder }))
    .sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < unassignedDeliveries; i += 1) {
    dailyActivity[remainderOrder[i].index].count += 1;
  }
  // Split each day's delivered items into packages and letters.
  const dailyLetterShare = [0.5, 0.4, 0.3, 0.5, 0.25, 0.35, 0.45];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyDeliveries = dailyActivity.map(({ count }, i) => {
    const letters = Math.round(count * dailyLetterShare[i]);
    return { day: weekDays[i], total: count, letters, packages: count - letters };
  });
  const weeklyPackages = dailyDeliveries.reduce((sum, d) => sum + d.packages, 0);
  const weeklyLetters = dailyDeliveries.reduce((sum, d) => sum + d.letters, 0);
  const maxDailyActivity = Math.max(1, ...dailyDeliveries.map((d) => d.total));
  const chartTickStep = Math.max(1, Math.ceil(maxDailyActivity / 4));
  const chartMax = chartTickStep * 4;
  const chartTicks = [4, 3, 2, 1, 0].map((n) => n * chartTickStep);

  // MAIN APPLICATION LAYOUT
  // After login, displays the sidebar, active page content,
  // footer, and any temporary notification.
  return (
    <div className={`app-layout has-sidebar text-size-${settings.textSize} ${darkMode ? 'dark-mode' : ''} ${highContrast ? 'high-contrast' : ''}`}>
      {renderSidebar()}

      <main className="main-content">

        {/* 
            HOME DASHBOARD
            Welcome banner, mailbox statistics, and recent mail.
            */}
        {page === 'home' && (
          <>
            {renderHeader({ title: "Home", subtitle: (`Here's what's happening with your mail${user ? `, ${user.name.split(' ')[0]}` : ''}.`) })}

            {/* Home welcome banner */}
            <section className="welcome-banner home-welcome">
              <div className="banner-copy">
                <div className="live-label">
                  <span /> YOUR MAIL AT A GLANCE
                </div>
                <h2>
                  Your mail,<br />
                  <span>all in sync.</span>
                </h2>
                <p>Your mail and packages, neatly organized in one place.</p>
                <div className="new-mail-today-card">
                  <div className="new-mail-today-icon">
                    <Mail size={24} />
                  </div>

                  <h3>New mail today</h3>

                  <p>
                    {mail.filter(item => isToday(item.date)).length} mail updates today
                  </p>
                </div>
              </div>

              <div className="banner-illustration">
                <div className="spark">✦</div>
                <div className="illustration-envelope">
                  <Mail size={76} strokeWidth={1.1} />
                  <CheckCircle className="envelope-check" size={28} />
                </div>
                <div className="banner-caption">
                  <CheckCircle size={18} />
                  <div>
                    <strong>Your mail connected</strong>
                    <small>Everything in sync</small>
                  </div>
                </div>
              </div>
            </section>

            {/* Three main navigation cards */}
            <section className="home-navigation-cards">
              <button
                className="home-navigation-card"
                onClick={() => navigate('current')}
              >
                <span className="home-card-icon"><Mail size={19} /></span>
                <strong>Current Mail</strong>
                <p>See mail and packages on the way or arriving today.</p>
                <span className="home-card-action">
                  View current mail <ChevronRight size={14} />
                </span>
              </button>

              <button
                className="home-navigation-card"
                onClick={() => navigate('past')}
              >
                <span className="home-card-icon"><Clock size={19} /></span>
                <strong>Past Mail</strong>
                <p>See packages that were delivered in the past.</p>
                <span className="home-card-action">
                  View past mail <ChevronRight size={14} />
                </span>
              </button>

              <button
                className="home-navigation-card"
                onClick={() => navigate('more')}
              >
                <span className="home-card-icon"><ChartColumn size={19} /></span>
                <strong>More Mail Info</strong>
                <p>Delivery counts, top senders, and important mail.</p>
                <span className="home-card-action">
                  View mail info <ChevronRight size={14} />
                </span>
              </button>
            </section>
          </>
        )}

        {/* 
            CURRENT MAIL AND PAST MAIL
            Both pages share search, date filters, and mail rows.
            Past Mail also displays a mail-history banner.
            */}
        {(page === 'current' || page === 'past') && (
          <>
            {renderHeader({ title: (page === 'current' ? 'Current Mail' : 'Past Mail'), subtitle: (page === 'current'
                  ? 'Keep up with your latest messages and deliveries.'
                  : 'Find a message from any time, all in one place.') })}



            {/* Search field and CSV-backed sender filter */}
            <div className="toolbar mail-filter-toolbar">
              <SearchBar search={search} setSearch={setSearch} senderNames={availableSearchSenders} />

              {(page === 'current' || page === 'past') && (
                <label className="sender-filter">
                  <select
                    aria-label="Filter by sender"
                    value={senderFilter}
                    onChange={(event) => setSenderFilter(event.target.value)}
                  >
                    <option value="All">All senders</option>
                    {senderNames.map((sender) => (
                      <option key={sender} value={sender}>{sender}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </label>
              )}
              {page === 'past' && (
              <label className="past-date-filters">
                <Clock size={16} />
                <span>Delivery period</span>
                <select
                  aria-label="Filter by delivery period"
                  value={pastPeriodFilter}
                  onChange={(event) => setPastPeriodFilter(event.target.value)}
                >
                  <option value="All">All time</option>
                  <option value="Last 7 Days">Last 7 days</option>
                  <option value="Last 30 Days">Last 30 days</option>
                  <option value="Last 3 Months">Last 3 months</option>
                  <option value="Last 6 Months">Last 6 months</option>
                  <option value="Last 9 Months">Last 9 months</option>
                  <option value="Last 1 Year">Last 1 year</option>
                  <option value="Last 2 Years">Last 2 years</option>
                  <option value="Last 5 Years">Last 5 years</option>
                </select>
                <ChevronDown size={14} />
              </label>
              )}
                <button
                  type="button"
                  className="secondary-button reset-filters-button"
                  onClick={resetMailFilters}
                >
                  <Clock size={16} /> Reset filters
                </button>
            </div>

            {/* Filtered mail results */}
            <section className="panel">
              <div className="list-summary">
                <span>
                  <strong>
                    {page === 'current' ? currentMail.length : pastMail.length}
                  </strong>{' '}
                  messages
                </span>
              </div>

              <MailRows
                items={page === 'current' ? currentMail : pastMail}
              />
            </section>
          </>
        )}

        {/* 
            MORE MAIL INFO
            Displays mail activity statistics, charts, frequent
            senders, and expandable important-mail sections.
             */}
        {page === 'more' && (
          <>
            {renderHeader({ title: "More Mail Info", subtitle: "Useful insights to help you stay organized." })}

            {/* Summary statistics */}
            <section className="analytics-stats">
              {mailMetrics.map(([label, value, caption]) => (
                <div className="mini-stat" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{caption}</small>
                </div>
              ))}
            </section>

            {/* Weekly activity chart and top senders */}
            <div className="analytics-grid">
              <section className="panel analytics-panel">
                <PanelHeading title="Mail activity this week" />
                <p className="panel-subtitle chart-description">
                  Each bar shows the number of items delivered to you that day,
                  split into packages and letters.
                </p>
                <div className="chart-legend">
                  <span><i className="legend-swatch packages" /> Packages ({weeklyPackages})</span>
                  <span><i className="legend-swatch letters" /> Letters ({weeklyLetters})</span>
                  <span className="chart-legend-total">Total delivered: {weeklyPackages + weeklyLetters}</span>
                </div>
                <div className="delivery-chart">
                  <div className="chart-y-axis" aria-hidden="true">
                    <span className="chart-y-title">Items delivered</span>
                    {chartTicks.map((tick) => (
                      <span className="chart-tick" key={tick} style={{ bottom: `${(tick / chartMax) * 100}%` }}>
                        {tick}
                      </span>
                    ))}
                  </div>
                  <div
                    className="chart-plot"
                    role="img"
                    aria-label={`Items delivered this week: ${dailyDeliveries
                      .map((d) => `${d.day} ${d.total} (${d.packages} packages, ${d.letters} letters)`)
                      .join('; ')}`}
                  >
                    {chartTicks.map((tick) => (
                      <div className="chart-gridline" key={tick} style={{ bottom: `${(tick / chartMax) * 100}%` }} />
                    ))}
                    {dailyDeliveries.map(({ day, total, packages, letters }) => (
                      <div
                        className="chart-column"
                        key={day}
                        title={`${day}: ${total} delivered — ${packages} packages, ${letters} letters`}
                      >
                        <div className="chart-stack" style={{ height: `${(total / chartMax) * 100}%` }}>
                          <span className="chart-total">{total}</span>
                          <div className="chart-segment letters" style={{ flexGrow: letters }} />
                          <div className="chart-segment packages" style={{ flexGrow: packages }} />
                        </div>
                        <small>{day}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="panel analytics-panel">
                <PanelHeading title="Top monthly senders" />
                <div className="ranking">
                  {[['Home Depot', 13], ['Amazon', 8], ['SuperSaver', 7], ['Hyvee', 5], ['John Doe', 3]].map(
                    ([name, count], i) => (
                      <div className="rank-row" key={name}>
                        <span>{i + 1}</span>
                        <strong>{name}</strong>
                        <div className="rank-track">
                          <div style={{ width: `${(count / 13) * 100}%` }} />
                        </div>
                        <small>{count}</small>
                      </div>
                    )
                  )}
                </div>
              </section>
            </div>

            <section className="panel analytics-panel important-mail-panel">
              <div className="important-mail-heading">
                <span className="important-mail-heading-icon">
                  <CircleAlert size={20} />
                </span>
                <div>
                  <strong>Important mail</strong>
                  <small>Review important messages. Mark more mail as important from its details.</small>
                </div>
                {importantMail.length > 0 && (
                  <span className="important-mail-count">
                    {importantMail.length} {importantMail.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <div className="important-mail-list">
                {importantMail.length > 0 ? (
                  importantMail.map((item) => (
                    <button
                      className={`important-row ${item.unread ? 'unread' : 'read'}`}
                      key={item.id}
                      aria-label={`${item.unread ? 'Unread' : 'Read'}: ${item.sender}. ${item.subject}. ${item.status}`}
                      onClick={() => openMail(item)}
                    >
                      <span className="important-row-icon">
                        <FileSignature size={18} />
                      </span>
                      <span className="important-row-copy">
                        <strong>{item.sender}</strong>
                        <small>{item.subject}</small>
                      </span>
                      <span className="important-row-action">
                        Review <ChevronRight size={15} />
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="important-mail-empty">
                    <span>No important mail right now. Open a message and choose “Mark as important” to add it here.</span>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {page === 'settings' && (
          <>
            {renderHeader({ title: "Settings", subtitle: "Make Arrivon work the way you like." })}

            <div className="settings-grid">
              <section className="panel settings-section">
                <div className="settings-section-heading">
                  <span className="settings-icon"><Sun size={18} /></span>
                  <div>
                    <h2>Appearance</h2>
                  </div>
                </div>
                <div className="appearance-options" aria-label="Appearance mode">
                  <button
                    className={!darkMode ? 'selected' : ''}
                    aria-pressed={!darkMode}
                    onClick={() => changeAppearance(false)}
                  >
                    <Sun size={17} /> Light
                  </button>
                  <button
                    className={darkMode ? 'selected' : ''}
                    aria-pressed={darkMode}
                    onClick={() => changeAppearance(true)}
                  >
                    <Moon size={17} /> Dark
                  </button>
                </div>
                <div className="settings-row contrast-setting">
                  <div>
                    <strong>High contrast</strong>
                  </div>
                  <button
                    className={`settings-switch ${highContrast ? 'on' : ''}`}
                    type="button"
                    role="switch"
                    aria-checked={highContrast}
                    aria-label="High contrast"
                    onClick={() => changeHighContrast(!highContrast)}
                  >
                    <span />
                  </button>
                </div>
                <fieldset className="text-size-setting">
                  <legend>Text size</legend>
                  <div className="appearance-options text-size-options">
                    {[
                      ['normal', 'Normal'],
                      ['large', 'Large'],
                      ['extra-large', 'Extra large'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={settings.textSize === value ? 'selected' : ''}
                        aria-pressed={settings.textSize === value}
                        onClick={() => updateSetting('textSize', value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </section>

              <section className="panel settings-section">
                <div className="settings-section-heading">
                  <span className="settings-icon"><Bell size={18} /></span>
                  <div>
                    <h2>Notifications</h2>
                    <p>Choose which mail updates you want to keep enabled.</p>
                  </div>
                </div>
                <div className="settings-options">
                  {[
                    ['importantMailAlerts', 'Important mail alerts', 'Get a heads-up when a message may need your attention.'],
                    ['deliveryUpdates', 'Delivery status updates', 'Stay informed about package status changes.'],
                  ].map(([key, title, description]) => (
                    <div className="settings-row" key={key}>
                      <div>
                        <strong>{title}</strong>
                        <small>{description}</small>
                      </div>
                      <button
                        className={`settings-switch ${settings[key] ? 'on' : ''}`}
                        type="button"
                        role="switch"
                        aria-checked={settings[key]}
                        aria-label={title}
                        onClick={() => updateSetting(key, !settings[key])}
                      >
                        <span />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel settings-section">
                <div className="settings-section-heading">
                  <span className="settings-icon"><Package size={18} /></span>
                  <div>
                    <h2>Inbox preferences</h2>
                    <p>Adjust the delivery details shown in your mail list.</p>
                  </div>
                </div>
                <div className="settings-options">
                  <div className="settings-row">
                    <div>
                      <strong>Show tracking numbers</strong>
                      <small>Display package tracking numbers beneath message subjects.</small>
                    </div>
                    <button
                      className={`settings-switch ${settings.showTrackingNumbers ? 'on' : ''}`}
                      type="button"
                      role="switch"
                      aria-checked={settings.showTrackingNumbers}
                      aria-label="Show tracking numbers"
                      onClick={() => updateSetting('showTrackingNumbers', !settings.showTrackingNumbers)}
                    >
                      <span />
                    </button>
                  </div>
                </div>
              </section>

              <section className="panel settings-section">
                <div className="settings-section-heading">
                  <span className="settings-icon"><User size={18} /></span>
                  <div>
                    <h2>Account</h2>
                    <p>Your profile and saved delivery destination.</p>
                  </div>
                  <button
                    className="account-edit-button"
                    type="button"
                    aria-label="Edit profile"
                    title="Edit profile"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
                <div className="account-details">
                  <div>
                    <small>NAME</small>
                    <strong>{user?.name || 'Not available'}</strong>
                  </div>
                  <div>
                    <small>EMAIL</small>
                    <strong>{user?.email || 'Not available'}</strong>
                  </div>
                  <div>
                    <small><MapPin size={13} /> DELIVERY ADDRESS</small>
                    <strong>{user?.address || 'No saved address'}</strong>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}

        {/* 
            MAIL DETAILS
            Shows information about the selected mail item,
            including sender, subject, category, date, and status.
             */}
        {page === 'details' && selectedMail && (
          <>
            {renderHeader({ title: "Mail Details", subtitle: "Review message and delivery information.", action: ((
                <button
                  type="button"
                  className={`secondary-button importance-button ${selectedMail.important ? 'selected' : ''}`}
                  aria-pressed={selectedMail.important}
                  onClick={() => toggleImportant(selectedMail)}
                >
                  <Star size={17} fill={selectedMail.important ? 'currentColor' : 'none'} aria-hidden="true" />
                  {selectedMail.important ? 'Remove from important' : 'Mark as important'}
                </button>
              )) })}

            <section className="panel detail-panel">
              {/* Selected message sender and delivery status */}
              <div className="detail-sender">
                <div className="sender-avatar large">
                  {selectedMail.sender.charAt(0)}
                </div>

                <div>
                  <h2>{selectedMail.sender}</h2>
                  <p>
                    Last update {formatDate(selectedMail.date)}
                    {selectedMail.time && ` at ${formatTime(selectedMail.time)}`}
                  </p>
                </div>

                <span className={`status status-${getStatusClass(selectedMail.status)}`}>
                  {selectedMail.status}
                </span>
              </div>

              <hr />

              {/* Message subject and prototype content */}
              <small className="detail-label">SUBJECT</small>
              <h2>{selectedMail.subject}</h2>

              <p className="detail-description">
                This is a sample message in your Arrivon inbox. Connect a mail provider
                to display original email content and live delivery updates.
              </p>

              {/* Key details displayed in a grid */}
              <div className="detail-grid">
                <div>
                  <small>DATE ORDERED</small>
                  <strong>{formatDate(selectedMail.orderedAt)}</strong>
                </div>

                {/* Delivered items show the actual delivery date;
                    everything else shows when it is expected. */}
                {selectedMail.status === 'Delivered' ? (
                  <div>
                    <small>DELIVERED ON</small>
                    <strong>{formatDate(selectedMail.deliveredAt)}</strong>
                  </div>
                ) : (
                  <div>
                    <small>ESTIMATED DELIVERY</small>
                    <strong>{formatDate(selectedMail.estimatedDelivery)}</strong>
                  </div>
                )}

                <div>
                  <small>TRACKING NUMBER</small>
                  <strong>{selectedMail.tracking}</strong>
                </div>

                <div>
                  <small>DELIVERY STATUS</small>
                  <strong>
                    {selectedMail.status}
                  </strong>
                </div>

                <div>
                  <small>CATEGORY</small>
                  <strong>{selectedMail.category}</strong>
                </div>

                <div>
                  <small>LAST UPDATE</small>
                  <strong>
                    {formatDate(selectedMail.date)}
                    {selectedMail.time && `, ${formatTime(selectedMail.time)}`}
                  </strong>
                </div>
              </div>

              <button
                className="primary-button"
                onClick={() => navigate(previousPage)}
              >
                <ArrowLeft size={16} /> Back to inbox
              </button>
            </section>
          </>
        )}

        {/* APPLICATION FOOTER */}
        <footer className="app-footer">
          <span>© 2026 Arrivon. Your mail, made simple.</span>
          <button onClick={() => notify('Help center coming soon.')}>
            Help
          </button>
        </footer>
      </main>

      {/* Displays notifications outside the main page content */}
      {notice && <div className="toast">{notice}</div>}
    </div>
  );
}

// Export the main component so main.jsx can render it.
export default App;