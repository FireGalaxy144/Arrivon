import React, { useState } from 'react';
import {
  Mail, Inbox, Clock, Package, ChartColumn, Search,
  ChevronRight, ChevronDown, Plus, X, Menu, CheckCircle,
  LogOut, Filter, ArrowLeft, User, Eye, EyeOff, FileSignature
} from 'lucide-react';
import './App.css';

const sampleMail = [
  { id: 1, sender: 'Amazon', subject: 'Your order has shipped', tracking: 'TBA392840157', date: 'Today, 9:42 AM', category: 'Package', status: 'In transit', unread: true },
  { id: 2, sender: 'Best Buy', subject: 'Your delivery is on its way', tracking: 'BBY18463028', date: 'Today, 8:15 AM', category: 'Package', status: 'Out for delivery', unread: true },
  { id: 3, sender: 'eBay', subject: 'Your item has been delivered', tracking: 'EBY99201743', date: 'Yesterday', category: 'Package', status: 'Delivered', unread: false },
  { id: 4, sender: 'Home Depot', subject: 'Thanks for your recent purchase', tracking: 'HD41028933', date: 'Oct 9', category: 'Receipt', status: 'Order confirmed', unread: false },
  { id: 5, sender: 'Hyvee', subject: 'Your weekly savings are here', tracking: 'HV3381045', date: 'Oct 8', category: 'Promotion', status: 'Received', unread: false },
  { id: 6, sender: 'John Doe', subject: 'Project notes for next week', tracking: '—', date: 'Oct 7', category: 'Personal', status: 'Received', unread: true },
  { id: 7, sender: 'Amazon', subject: 'A package was delivered', tracking: 'TBA392840156', date: 'Oct 6', category: 'Package', status: 'Delivered', unread: false },
];

function Logo({ compact = false }) {
  return (
    <div className={`logo ${compact ? 'compact' : ''}`}>
      <Mail size={compact ? 22 : 30} />
      <span>Arrivon</span>
      {!compact && <small>Your smart mail box companion</small>}
    </div>
  );
}

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

  function navigate(next) {
    setPage(next);
    setMenuOpen(false);
  }

  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  }

  const visibleMail = mail.filter((item) => {
    const searchable = [
      item.sender, item.subject, item.tracking, item.status
    ].join(' ').toLowerCase();

    const matchesSearch = searchable.includes(search.toLowerCase());
    const matchesSender = senderFilter === 'All' || item.sender === senderFilter;

    const matchesDate =
      dateFilter === 'All' ||
      dateFilter === 'Last 30 Days' ||
      (dateFilter === 'Last 7 Days' &&
        ['Today, 9:42 AM', 'Today, 8:15 AM', 'Yesterday',
         'Oct 9', 'Oct 8', 'Oct 7', 'Oct 6'].includes(item.date));

    return matchesSearch && matchesSender && matchesDate;
  });

  function openMail(item) {
    setPreviousPage(page);
    setSelectedMail(item);
    setMail((old) => old.map((m) =>
      m.id === item.id ? { ...m, unread: false } : m
    ));
    navigate('details');
  }

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
    setUser(account);
    navigate('home');
    notify('Welcome to Arrivon!');
  }

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

  const navItems = [
    { id: 'home', label: 'Home', icon: Inbox },
    { id: 'current', label: 'Current Mail', icon: Mail },
    { id: 'past', label: 'Past Mail', icon: Clock },
    { id: 'more', label: 'More Mail Info', icon: ChartColumn },
  ];

  function Header({ title, subtitle, action }) {
    return (
      <header className="page-header">
        <button className="icon-button mobile-menu"
          onClick={() => setMenuOpen(true)}>
          <Menu size={21} />
        </button>
        <div className="header-copy">
          <div className="breadcrumb">ARRIVON <ChevronRight size={12} /> {title.toUpperCase()}</div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {action && <div className="header-action">{action}</div>}
      </header>
    );
  }

  function Sidebar() {
    return (
      <>
        {menuOpen && <button className="overlay" onClick={() => setMenuOpen(false)} />}
        <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
          <div className="sidebar-top">
            <Logo compact />
            <button className="icon-button mobile-close" onClick={() => setMenuOpen(false)}>
              <X size={19} />
            </button>
          </div>

          <div className="nav-label">YOUR MAILBOX</div>
          <nav>
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id}
                className={`nav-link ${page === id ? 'active' : ''}`}
                onClick={() => navigate(id)}>
                <Icon size={18} />
                <span>{label}</span>
                {id === 'current' &&
                  <span className="nav-count">{mail.filter(m => m.unread).length}</span>}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="connection">
              <CheckCircle size={19} />
              <div><strong>Mail connected</strong><small>You're all caught up</small></div>
            </div>
            <button className="nav-link" onClick={() => notify('Settings coming soon.')}>
              <User size={18} /><span>Settings</span>
            </button>
            <button className="nav-link" onClick={() => { setUser(null); navigate('login'); }}>
              <LogOut size={18} /><span>Log out</span>
            </button>
            {user && <div className="profile">
              <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div><strong>{user.name}</strong><small>{user.email}</small></div>
            </div>}
          </div>
        </aside>
      </>
    );
  }

  function MailRows({ items }) {
    if (!items.length) {
      return (
        <div className="empty-state">
          <Search size={30} />
          <h3>No mail found</h3>
          <p>Try another search or clear your filters.</p>
          <button className="secondary-button" onClick={() => {
            setSearch('');
            setDateFilter('All');
            setSenderFilter('All');
          }}>Clear filters</button>
        </div>
      );
    }

    return items.map((item) => (
      <button className={`mail-row ${item.unread ? 'unread' : ''}`}
        key={item.id} onClick={() => openMail(item)}>
        <div className="sender-avatar">{item.sender.charAt(0)}</div>
        <div className="mail-row-content">
          <div className="mail-row-top">
            <strong>{item.sender}</strong><span>{item.date}</span>
          </div>
          <div className="mail-subject">{item.subject}</div>
          <div className="mail-tracking">
            {item.tracking === '—' ? item.category : `Tracking: ${item.tracking}`}
          </div>
        </div>
        <span className={`status ${item.status === 'Delivered' ? 'delivered' : ''}`}>
          {item.status}
        </span>
        <ChevronRight className="row-arrow" size={17} />
      </button>
    ));
  }

  function SearchBar() {
    return (
      <div className="search-box">
        <Search size={18} />
        <input value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sender, subject, or tracking number..." />
        {search && <button onClick={() => setSearch('')}><X size={16} /></button>}
      </div>
    );
  }

  function SectionHeading({ title, subtitle, action, onAction }) {
    return (
      <div className="section-heading">
        <div><h2>{title}</h2><p>{subtitle}</p></div>
        <button className="text-button" onClick={onAction}>
          {action} <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  function StatCard({ icon, label, value, caption, onClick }) {
    return (
      <button className="stat-card" onClick={onClick}>
        <div className="stat-icon">{icon}</div>
        <span>{label}</span><strong>{value}</strong><small>{caption}</small>
      </button>
    );
  }

  function PanelHeading({ title }) {
    return (
      <div className="panel-heading">
        <div className="panel-icon"><Mail size={17} /></div>
        <strong>{title}</strong>
      </div>
    );
  }

  if (page === 'login' || page === 'signup') {
    const signup = page === 'signup';

    return (
      <div className="auth-layout">
        <section className="auth-art">
          <Logo />
          <div className="auth-art-center">
            <div className="big-mail">
              <Mail size={76} strokeWidth={1.2} />
              <CheckCircle className="mail-check" size={28} />
            </div>
            <h2>Your mail, all in one place.</h2>
            <p>Stay on top of deliveries, important messages, and everything in between.</p>
            <div className="auth-benefits">
              <span><CheckCircle size={16} /> Smart tracking</span>
              <span><CheckCircle size={16} /> One simple inbox</span>
            </div>
          </div>
          <small className="auth-footer">ARRIVON · YOUR SMART MAIL BOX COMPANION</small>
        </section>

        <main className="auth-main">
          <div className="auth-mobile-logo"><Logo /></div>
          <div className="auth-card">
            <span className="eyebrow">{signup ? 'GET STARTED' : 'WELCOME BACK'}</span>
            <h1>{signup ? 'Create your account' : 'Welcome back'}</h1>
            <p className="auth-subtitle">
              {signup ? 'Get notified the moment your mail arrives.' : 'Log in to check your mail.'}
            </p>

            <form onSubmit={signup ? createAccount : login}>
              {signup && <>
                <label>Full name<input name="name" placeholder="Jane Doe" required /></label>
                <label>Address<input name="address" placeholder="123 Main St, Lincoln, NE" /></label>
              </>}

              <label>Email<input name="email" type="email" placeholder="you@example.com" required /></label>
              <label>Password
                <div className="password-field">
                  <input name="password" type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password" minLength="6" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>

              {signup && <label>Confirm password
                <input name="confirmPassword" type="password"
                  placeholder="Confirm your password" minLength="6" required />
              </label>}

              {!signup && <div className="form-extras">
                <label className="remember"><input type="checkbox" /> Remember me</label>
                <button type="button" className="text-button"
                  onClick={() => notify('Password recovery needs a backend.')}>
                  Forgot password?
                </button>
              </div>}

              <button className="primary-button full-width" type="submit">
                {signup ? 'Create account' : 'Log in'} <ChevronRight size={17} />
              </button>
            </form>

            <div className="auth-switch">
              {signup ? 'Already have an account?' : "Don't have an account?"}
              <button onClick={() => navigate(signup ? 'login' : 'signup')}>
                {signup ? 'Log in' : 'Sign up'}
              </button>
            </div>
            <div className="secure-note">Your information stays private</div>
          </div>
          {notice && <div className="toast">{notice}</div>}
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {page === 'home' && <>
          <Header title="Home"
            subtitle={`Here's what's happening with your mail${user ? `, ${user.name.split(' ')[0]}` : ''}.`}
            action={<button className="secondary-button" onClick={() => navigate('current')}>
              <Mail size={16} /> View inbox
            </button>} />

          <section className="welcome-banner">
            <div className="banner-copy">
              <div className="live-label"><span /> YOUR MAIL AT A GLANCE</div>
              <h2>Everything delivered.<br /><span>Nothing missed.</span></h2>
              <p>Your mail and packages, neatly organized in one place.</p>
              <button className="banner-button" onClick={() => navigate('past')}>
                Explore past mail <ChevronRight size={16} />
              </button>
            </div>
            <div className="banner-illustration">
              <div className="spark">✦</div>
              <div className="illustration-envelope">
                <Mail size={76} strokeWidth={1.1} />
                <CheckCircle className="envelope-check" size={28} />
              </div>
              <div className="banner-caption">
                <CheckCircle size={18} />
                <div><strong>Your mail connected</strong><small>Everything in sync</small></div>
              </div>
            </div>
          </section>

          <SectionHeading title="Your mailbox"
            subtitle="A quick look at your mail activity."
            action="View insights" onAction={() => navigate('more')} />

          <section className="stat-grid">
            <StatCard icon={<Inbox />} label="CURRENT MAIL"
              value={mail.filter(m => m.unread).length} caption="Unread messages"
              onClick={() => navigate('current')} />
            <StatCard icon={<Clock />} label="PAST MAIL" value={mail.length}
              caption="Saved messages" onClick={() => navigate('past')} />
            <StatCard icon={<Package />} label="PACKAGES"
              value={mail.filter(m => m.category === 'Package').length}
              caption="Tracked deliveries" onClick={() => navigate('current')} />
            <StatCard icon={<FileSignature />} label="IMPORTANT MAIL"
              value={mail.filter(m => m.category === 'Receipt').length + 2}
              caption="Ready when you need it" onClick={() => navigate('more')} />
          </section>

          <SectionHeading title="Recent mail"
            subtitle="Your latest updates and deliveries."
            action="See all mail" onAction={() => navigate('current')} />

          <section className="panel">
            <PanelHeading title="Latest activity" />
            <MailRows items={mail.slice(0, 4)} />
          </section>
        </>}

        {(page === 'current' || page === 'past') && <>
          <Header title={page === 'current' ? 'Current Mail' : 'Past Mail'}
            subtitle={page === 'current'
              ? 'Keep up with your latest messages and deliveries.'
              : 'Find a message from any time, all in one place.'}
            action={<button className="secondary-button" onClick={() => {
              setSearch(''); setDateFilter('All'); setSenderFilter('All');
            }}><Clock size={16} /> Reset filters</button>} />

          {page === 'past' && <section className="past-banner">
            <div className="past-banner-icon"><Clock size={24} /></div>
            <div><h2>Your mail history</h2>
              <p>Search previous messages, deliveries, and receipts.</p></div>
            <strong>{mail.length}<small>saved messages</small></strong>
          </section>}

          <div className="toolbar">
            <SearchBar />
            {page === 'current' && <button className="secondary-button"
              onClick={() => setSenderFilter(senderFilter === 'All' ? 'Amazon' : 'All')}>
              <Filter size={16} /> {senderFilter === 'All' ? 'Filter' : 'Amazon'}
              <ChevronDown size={14} />
            </button>}
          </div>

          <div className="filter-chips">
            {['All', 'Last 7 Days', 'Last 30 Days',
              ...(page === 'past' ? ['Last 3 Months'] : [])].map((filter) => (
              <button key={filter} className={dateFilter === filter ? 'selected' : ''}
                onClick={() => setDateFilter(filter === 'Last 3 Months' ? 'All' : filter)}>
                {filter}
              </button>
            ))}
          </div>

          <section className="panel">
            <div className="list-summary">
              <span><strong>{visibleMail.length}</strong> messages</span>
              <span>Unread messages are highlighted</span>
            </div>
            <MailRows items={visibleMail} />
          </section>
        </>}

        {page === 'more' && <>
          <Header title="More Mail Info" subtitle="Useful insights to help you stay organized." />
          <section className="analytics-banner">
            <div className="live-label"><span /> YOUR MAIL INSIGHTS</div>
            <h2>A clearer view of your mailbox.</h2>
            <p>See delivery activity and your frequent senders.</p>
          </section>

          <section className="analytics-stats">
            <div className="mini-stat"><span>DELIVERED</span>
              <strong>{mail.filter(m => m.status === 'Delivered').length + 5}</strong>
              <small>Successfully received</small></div>
            <div className="mini-stat"><span>SENT / REPLIES</span>
              <strong>3</strong><small>Recent activity</small></div>
            <div className="mini-stat"><span>ADDRESSES</span>
              <strong>4</strong><small>Saved destinations</small></div>
          </section>

          <div className="analytics-grid">
            <section className="panel analytics-panel">
              <PanelHeading title="Mail activity" />
              <p className="panel-subtitle">Messages received this week</p>
              <div className="chart">
                {[2, 13, 10, 8, 12, 15, 9].map((n, i) => (
                  <div className="chart-column" key={i}>
                    <span>{n}</span><div style={{ height: `${n * 6}%` }} />
                    <small>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</small>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel analytics-panel">
              <PanelHeading title="Top monthly senders" />
              <div className="ranking">
                {[['Home Depot', 13], ['Amazon', 8], ['SuperSaver', 7],
                  ['Hyvee', 5], ['John Doe', 3]].map(([name, count], i) => (
                  <div className="rank-row" key={name}>
                    <span>{i + 1}</span><strong>{name}</strong>
                    <div className="rank-track">
                      <div style={{ width: `${count / 13 * 100}%` }} />
                    </div><small>{count}</small>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {[
            ['important', 'Important mail', 'Messages that may need your attention'],
            ['signature', 'Needs signature', 'Mail that may require a signature']
          ].map(([id, title, subtitle]) => (
            <section className="panel expandable" key={id}>
              <button className="expand-button"
                onClick={() => setExpanded(expanded === id ? '' : id)}>
                <FileSignature size={19} />
                <span><strong>{title}</strong><small>{subtitle}</small></span>
                {expanded === id ? <X size={17} /> : <Plus size={18} />}
              </button>
              {expanded === id && <div className="expand-content">
                {id === 'important'
                  ? mail.filter(m => ['Receipt', 'Personal'].includes(m.category)).map(m => (
                    <button className="important-row" key={m.id} onClick={() => openMail(m)}>
                      {m.sender}: {m.subject}<ChevronRight size={16} />
                    </button>
                  ))
                  : <p>No mail currently requires a signature.</p>}
              </div>}
            </section>
          ))}
        </>}

        {page === 'details' && selectedMail && <>
          <Header title="Mail Details" subtitle="Review message and delivery information."
            action={<button className="secondary-button" onClick={() => navigate(previousPage)}>
              <ArrowLeft size={16} /> Back to mail
            </button>} />
          <section className="panel detail-panel">
            <div className="detail-sender">
              <div className="sender-avatar large">{selectedMail.sender.charAt(0)}</div>
              <div><h2>{selectedMail.sender}</h2><p>{selectedMail.date}</p></div>
              <span className="status">{selectedMail.status}</span>
            </div>
            <hr />
            <small className="detail-label">SUBJECT</small>
            <h2>{selectedMail.subject}</h2>
            <p className="detail-description">
              This is a sample message in your Arrivon inbox. Connect a mail provider
              to display original email content and live delivery updates.
            </p>
            <div className="detail-grid">
              <div><small>CATEGORY</small><strong>{selectedMail.category}</strong></div>
              <div><small>DATE RECEIVED</small><strong>{selectedMail.date}</strong></div>
              <div><small>TRACKING NUMBER</small><strong>{selectedMail.tracking}</strong></div>
              <div><small>DELIVERY STATUS</small><strong>{selectedMail.status}</strong></div>
            </div>
            <button className="primary-button" onClick={() => navigate(previousPage)}>
              <ArrowLeft size={16} /> Back to inbox
            </button>
          </section>
        </>}

        <footer className="app-footer">
          <Logo compact />
          <span>© 2026 Arrivon. Your mail, made simple.</span>
          <button onClick={() => notify('Help center coming soon.')}>Help</button>
        </footer>
      </main>
      {notice && <div className="toast">{notice}</div>}
    </div>
  );
}

export default App;