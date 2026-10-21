// IMPORTS
// React state manages the interactive pages and forms.
// Lucide React supplies the icons used in the interface.
// App.css contains the component-level visual styles.
import React, { useState } from 'react';

import {
  Mail, Inbox, Clock, Package, ChartColumn, Search,
  ChevronRight, ChevronDown, Plus, X, Menu, CheckCircle,
  LogOut, Filter, ArrowLeft, User, Eye, EyeOff, FileSignature,
  Bell, ShieldCheck, Zap
} from 'lucide-react';

import './App.css';

// SAMPLE MAIL DATA
// Example messages used to populate the inbox, dashboard,
// past-mail list, analytics, and message details.
// This data is local to the prototype.

const sampleMail = [
  {
    id: 1,
    sender: 'Amazon',
    subject: 'Your order has shipped',
    tracking: 'TBA392840157',
    date: '2026-10-20',
    category: 'Package',
    status: 'In transit',
    unread: true,
  },
  {
    id: 2,
    sender: 'Best Buy',
    subject: 'Your delivery is on its way',
    tracking: 'BBY18463028',
    date: '2026-10-20',
    category: 'Package',
    status: 'Out for delivery',
    unread: true,
  },
  {
    id: 3,
    sender: 'eBay',
    subject: 'Your item has been delivered',
    tracking: 'EBY99201743',
    date: '2026-10-19',
    deliveredAt: '2026-10-19',
    category: 'Package',
    status: 'Delivered',
    unread: false,
  },
  {
    id: 4,
    sender: 'Home Depot',
    subject: 'Thanks for your recent purchase',
    tracking: 'HD41028933',
    date: '2026-10-09',
    category: 'Receipt',
    status: 'Order confirmed',
    unread: false,
  },
  {
    id: 5,
    sender: 'Hyvee',
    subject: 'Your weekly savings are here',
    tracking: '',
    date: '2026-10-08',
    category: 'Promotion',
    status: 'Received',
    unread: false,
  },
  {
    id: 7,
    sender: 'Amazon',
    subject: 'A package was delivered',
    tracking: 'TBA392840156',
    date: '2026-10-06',
    deliveredAt: '2026-10-06',
    category: 'Package',
    status: 'Delivered',
    unread: false,
  },
  {
    id: 8,
    sender: 'Amazon',
    subject: 'A package was delivered',
    tracking: 'RTY392840156',
    date: '2026-10-20',
    deliveredAt: '2026-10-20',
    category: 'Package',
    status: 'Delivered',
    unread: false,
  },
  {
    id: 9,
    sender: 'Target',
    subject: 'A package was delivered',
    tracking: 'YUII92840156',
    date: '2026-05-20',
    deliveredAt: '2026-05-20',
    category: 'Package',
    status: 'Delivered',
    unread: false,
  },
];

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
function SearchBar({ search, setSearch }) {
  return (
    <div className="search-box">
      <Search size={18} />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search sender, subject, or tracking number..."
      />

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
function isToday(dateString) {
  if (!dateString) return false;

  const date = new Date(dateString);
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
  const [page, setPage] = useState('login');
  const [mail, setMail] = useState(sampleMail);
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('All');
  const [senderFilter, setSenderFilter] = useState('All');
  const [selectedMail, setSelectedMail] = useState(null);
  const [previousPage, setPreviousPage] = useState('current');
  const [showPassword, setShowPassword] = useState(false);
  const [expanded, setExpanded] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');

  // PAGE NAVIGATION
  // Changes the active page and closes the mobile menu.
  function navigate(next) {
    setPage(next);
    setMenuOpen(false);
  }

  // TEMPORARY NOTIFICATION
  // Shows a toast message and clears it after three seconds.
  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  }

// SEARCH AND FILTER LOGIC
// Filters mail by search text, sender, and selected date range.
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

  if (dateFilter !== 'All') {
    const messageDate = new Date(item.date);
    const cutoff = new Date();

    if (dateFilter === 'Last 7 Days') {
      cutoff.setDate(cutoff.getDate() - 7);
    } else if (dateFilter === 'Last 30 Days') {
      cutoff.setDate(cutoff.getDate() - 30);
    } else if (dateFilter === 'Last 3 Months') {
      cutoff.setMonth(cutoff.getMonth() - 3);
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
  return item.status === "Order confirmed" ||
         item.status === "In transit" ||
         item.status === "Out for delivery";
});

const pastMail = visibleMail.filter((item) => {
  return (
    item.category === "Package" &&
    item.status === "Delivered" &&
    item.deliveredAt &&
    !isToday(item.deliveredAt) &&
    new Date(item.deliveredAt) < new Date()
  );
});
  // OPEN A MAIL ITEM
  // Remembers the current page, selects the message,
  // marks it as read, and navigates to its details.
  function openMail(item) {
    setPreviousPage(page);
    setSelectedMail(item);

    setMail((old) => old.map((m) =>
      m.id === item.id ? { ...m, unread: false } : m
    ));

    navigate('details');
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

    if (accounts.some((a) => a.email === email)) {
      notify('That email already has an account.');
      return;
    }

    const account = {
      name,
      email,
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
    const email = data.get('email').toString().trim();
    const password = data.get('password').toString();

    const account = accounts.find(
      (a) => a.email === email && a.password === password
    );

    if (!account) {
      notify('Account not found. Please create an account first.');
      return;
    }

    setUser(account);
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
  // Displays the breadcrumb, page title, subtitle,
  // and optional action button.
  function Header({ title, subtitle, action }) {
    return (
      <header className="page-header">
        <button
          className="icon-button mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={21} />
        </button>

        <div className="header-copy">
          <div className="breadcrumb">
            ARRIVON <ChevronRight size={12} /> {title.toUpperCase()}
          </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {action && <div className="header-action">{action}</div>}
      </header>
    );
  }

  // SIDEBAR AND MOBILE NAVIGATION
  // Renders page links, unread count, connection status,
  // settings, logout, and the signed-in profile.
  function Sidebar() {
    return (
      <>
        {menuOpen && (
          <button
            className="overlay"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
          <div className="sidebar-top">
            <button
              className="brand-home-button"
              type="button"
              aria-label="Go to home"
              onClick={() => navigate('home')}
            >
              <Logo compact />
            </button>
            <button
              className="icon-button mobile-close"
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
                className={`nav-link ${page === id ? 'active' : ''}`}
                onClick={() => navigate(id)}
              >
                <Icon size={18} />
                <span>{label}</span>

                
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="connection">
              <CheckCircle size={19} />
              <div>
                <strong>Mail connected</strong>
                <small>You're all caught up</small>
              </div>
            </div>

            <button
              className="nav-link"
              onClick={() => notify('Settings coming soon.')}
            >
              <User size={18} />
              <span>Settings</span>
            </button>

            <button
              className="nav-link"
              onClick={() => {
                setUser(null);
                navigate('login');
              }}
            >
              <LogOut size={18} />
              <span>Log out</span>
            </button>

            {user && (
              <div className="profile">
                <div className="avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
            )}
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
              setDateFilter('All');
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
        className={`mail-row ${item.unread ? 'unread' : ''}`}
        key={item.id}
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
            {item.tracking === '—'
              ? item.category
              : `Tracking: ${item.tracking}`}
          </div>
        </div>

        <span className={`status ${item.status === 'Delivered' ? 'delivered' : ''}`}>
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
            <form onSubmit={signup ? createAccount : login}>
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

              <label>
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
                    <input type="checkbox" />
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

  // MAIN APPLICATION LAYOUT
  // After login, displays the sidebar, active page content,
  // footer, and any temporary notification.
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">

        {/* 
            HOME DASHBOARD
            Welcome banner, mailbox statistics, and recent mail.
            */}
        {page === 'home' && (
          <>
            <Header
              title="Home"
              subtitle={`Here's what's happening with your mail${user ? `, ${user.name.split(' ')[0]}` : ''}.`}
              action={
                <button
                  className="secondary-button"
                  onClick={() => navigate('current')}
                >
                  <Mail size={16} /> View inbox
                </button>
              }
            />

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
                <p>Search and filter everything that has been delivered.</p>
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
            <Header
              title={page === 'current' ? 'Current Mail' : 'Past Mail'}
              subtitle={
                page === 'current'
                  ? 'Keep up with your latest messages and deliveries.'
                  : 'Find a message from any time, all in one place.'
              }
              action={
                <button
                  className="secondary-button"
                  onClick={() => {
                    setSearch('');
                    setDateFilter('All');
                    setSenderFilter('All');
                  }}
                >
                  <Clock size={16} /> Reset filters
                </button>
              }
            />

           

            {/* Search field and Current Mail sender filter */}
            <div className="toolbar">
              <SearchBar search={search} setSearch={setSearch} />

              {page === 'current' && (
                <button
                  className="secondary-button"
                  onClick={() =>
                    setSenderFilter(senderFilter === 'All' ? 'Amazon' : 'All')
                  }
                >
                  <Filter size={16} />
                  {senderFilter === 'All' ? 'Filter' : 'Amazon'}
                  <ChevronDown size={14} />
                </button>
              )}
            </div>

            {/* Date-range filter buttons */}
            <div className="filter-chips">
              {[
                'All',
                'Last 7 Days',
                'Last 30 Days',
                ...(page === 'past' ? ['Last 3 Months'] : [])
              ].map((filter) => (
                <button
                  key={filter}
                  className={dateFilter === filter ? 'selected' : ''}
                  onClick={() => setDateFilter(filter)}
                >
                  {filter}
                </button>
              ))}
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
                <span>Unread messages are highlighted</span>
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
            <Header
              title="More Mail Info"
              subtitle="Useful insights to help you stay organized."
            />

            {/* Analytics introduction banner */}
            <section className="analytics-banner">
              <div className="live-label">
                <span /> YOUR MAIL INSIGHTS
              </div>

              <h2>A clearer view of your mailbox.</h2>
              <p>See delivery activity and your frequent senders.</p>
            </section>

            {/* Summary statistics */}
            <section className="analytics-stats">
              <div className="mini-stat">
                <span>DELIVERED</span>
                <strong>
                  {mail.filter(m => m.status === 'Delivered').length + 5}
                </strong>
                <small>Successfully received</small>
              </div>

              <div className="mini-stat">
                <span>SENT / REPLIES</span>
                <strong>3</strong>
                <small>Recent activity</small>
              </div>

              <div className="mini-stat">
                <span>ADDRESSES</span>
                <strong>4</strong>
                <small>Saved destinations</small>
              </div>
            </section>

            {/* Activity chart and frequent-sender ranking */}
            <div className="analytics-grid">
              <section className="panel analytics-panel">
                <PanelHeading title="Mail activity" />
                <p className="panel-subtitle">
                  Messages received this week
                </p>

                <div className="chart">
                  {[2, 13, 10, 8, 12, 15, 9].map((n, i) => (
                    <div className="chart-column" key={i}>
                      <span>{n}</span>
                      <div style={{ height: `${n * 6}%` }} />
                      <small>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
                      </small>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel analytics-panel">
                <PanelHeading title="Top monthly senders" />

                <div className="ranking">
                  {[
                    ['Home Depot', 13],
                    ['Amazon', 8],
                    ['SuperSaver', 7],
                    ['Hyvee', 5],
                    ['John Doe', 3]
                  ].map(([name, count], i) => (
                    <div className="rank-row" key={name}>
                      <span>{i + 1}</span>
                      <strong>{name}</strong>

                      <div className="rank-track">
                        <div style={{ width: `${count / 13 * 100}%` }} />
                      </div>

                      <small>{count}</small>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Expandable important-mail and signature sections */}
            {[
              ['important', 'Important mail', 'Messages that may need your attention'],
              ['signature', 'Needs signature', 'Mail that may require a signature']
            ].map(([id, title, subtitle]) => (
              <section className="panel expandable" key={id}>
                <button
                  className="expand-button"
                  onClick={() => setExpanded(expanded === id ? '' : id)}
                >
                  <FileSignature size={19} />

                  <span>
                    <strong>{title}</strong>
                    <small>{subtitle}</small>
                  </span>

                  {expanded === id ? <X size={17} /> : <Plus size={18} />}
                </button>

                {expanded === id && (
                  <div className="expand-content">
                    {id === 'important'
                      ? mail
                          .filter(m => ['Receipt', 'Personal'].includes(m.category))
                          .map(m => (
                            <button
                              className="important-row"
                              key={m.id}
                              onClick={() => openMail(m)}
                            >
                              {m.sender}: {m.subject}
                              <ChevronRight size={16} />
                            </button>
                          ))
                      : <p>No mail currently requires a signature.</p>}
                  </div>
                )}
              </section>
            ))}
          </>
        )}

        {/* 
            MAIL DETAILS
            Shows information about the selected mail item,
            including sender, subject, category, date, and status.
             */}
        {page === 'details' && selectedMail && (
          <>
            <Header
              title="Mail Details"
              subtitle="Review message and delivery information."
              action={
                <button
                  className="secondary-button"
                  onClick={() => navigate(previousPage)}
                >
                  <ArrowLeft size={16} /> Back to mail
                </button>
              }
            />

            <section className="panel detail-panel">
              {/* Selected message sender and delivery status */}
              <div className="detail-sender">
                <div className="sender-avatar large">
                  {selectedMail.sender.charAt(0)}
                </div>

                <div>
                  <h2>{selectedMail.sender}</h2>
                  <p>{selectedMail.date}</p>
                </div>

                <span className="status">{selectedMail.status}</span>
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
                  <small>CATEGORY</small>
                  <strong>{selectedMail.category}</strong>
                </div>

                <div>
                  <small>DATE RECEIVED</small>
                  <strong>{selectedMail.date?.split('T')[0]}</strong>
                </div>

                <div>
                  <small>TRACKING NUMBER</small>
                  <strong>{selectedMail.tracking}</strong>
                </div>

                <div>
                  <small>DELIVERY STATUS</small>
                  <strong>{selectedMail.status}</strong>
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

        {/* 
            APPLICATION FOOTER
            Displays the compact brand logo, copyright text,
            and Help action at the bottom of the page.
            */}
        <footer className="app-footer">
          <button
            className="brand-home-button"
            type="button"
            aria-label="Go to home"
            onClick={() => navigate('home')}
          >
            <Logo compact />
          </button>
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