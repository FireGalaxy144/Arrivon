/*
 * Arrivon - Sample Mail Generator
 *
 * Builds a random set of mail from the senders listed in mail.csv. The
 * randomness comes from a seed that Vite sets each time `npm run dev` starts
 * or the site is built (see vite.config.js), so refreshing the page shows the
 * same mail and a new run shows new mail. Dates are relative to the current
 * day, so Current Mail always has active deliveries and Past Mail a history.
 */

/* global __MAIL_SEED__ */
const SEED = typeof __MAIL_SEED__ === 'number' ? __MAIL_SEED__ : Date.now();

// Small seeded random number generator (mulberry32): the same seed always
// produces the same sequence, which is what keeps mail stable on refresh.
function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let random = createRandom(SEED);

// Subject lines for each delivery status. {sender} is replaced with the store.
const SUBJECTS = {
  Received: ['{sender} received your order', 'Your {sender} order has been received'],
  'In transit': ['Your {sender} order is on the way', 'Your {sender} order has shipped', 'Your {sender} package arrives soon'],
  'Out for delivery': ['Your {sender} package is out for delivery'],
  'Ready for pickup': ['Your {sender} order is ready for pickup', 'Your {sender} order is ready at the pickup locker'],
  Delayed: ['Your {sender} delivery is running late', 'Your {sender} delivery has a new estimated date'],
  'Action Required': ['Signature required for your {sender} delivery', 'Schedule a delivery window for your {sender} order'],
  Delivered: ['Your {sender} order was delivered', 'Your {sender} package was delivered', 'Your {sender} order was delivered to your mailbox'],
};

// Statuses for mail that is still on its way, weighted toward the common ones.
const ACTIVE_STATUSES = [
  'In transit', 'In transit', 'In transit', 'Out for delivery', 'Out for delivery',
  'Received', 'Ready for pickup', 'Delayed', 'Action Required',
];

const randomInt = (min, max) => min + Math.floor(random() * (max - min + 1));
const pick = (list) => list[Math.floor(random() * list.length)];
const digits = (count) => Array.from({ length: count }, () => randomInt(0, 9)).join('');
const alphanumeric = (count) => Array.from(
  { length: count },
  () => pick('ABCDEFGHJKLMNPRSTVWXYZ0123456789'),
).join('');
const pad = (number) => String(number).padStart(2, '0');

// Local YYYY-MM-DD for a day offset from today (negative = in the past).
function dayFromToday(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// A time of day between 6 AM and 10 PM. Mail dated today is no later than the
// moment this run started, so it isn't in the future and doesn't change on refresh.
function randomTime(isToday) {
  const started = new Date(SEED);
  const startedToday = started.toDateString() === new Date().toDateString();
  const latest = isToday && startedToday
    ? Math.min(22 * 60, started.getHours() * 60 + started.getMinutes())
    : 22 * 60;
  const earliest = Math.min(6 * 60, latest);
  const minutes = randomInt(earliest, latest);
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}:00`;
}

// Tracking numbers shaped like the carrier each store would use.
function trackingNumber(sender) {
  if (sender === 'Amazon') return `TBA${digits(12)}`;
  return pick([
    () => `1Z${alphanumeric(16)}`, // UPS
    () => `94${digits(20)}`, // USPS
    () => digits(12), // FedEx
  ])();
}

// How long ago a past delivery happened: mostly recent, a few years at most.
function pastDeliveryDaysAgo() {
  const roll = random();
  if (roll < 0.55) return randomInt(1, 45);
  if (roll < 0.85) return randomInt(46, 365);
  return randomInt(366, 1100);
}

function makeMessage(id, sender, status, daysAgo, estimatedOffset) {
  const date = dayFromToday(-daysAgo);
  return {
    id,
    sender,
    subject: pick(SUBJECTS[status]).replace('{sender}', sender),
    tracking: trackingNumber(sender),
    date,
    time: randomTime(daysAgo === 0),
    category: 'Package',
    status,
    deliveredAt: status === 'Delivered' ? date : undefined,
    orderedAt: dayFromToday(-daysAgo - randomInt(0, status === 'Delivered' ? 9 : 4)),
    estimatedDelivery: status === 'Delivered' ? undefined : dayFromToday(estimatedOffset),
    unread: true,
  };
}

// When an active delivery is expected, in days from today.
function estimatedOffsetFor(status) {
  if (status === 'Out for delivery' || status === 'Ready for pickup') return 0;
  if (status === 'Received') return randomInt(4, 7);
  if (status === 'Delayed') return randomInt(2, 6);
  if (status === 'Action Required') return randomInt(0, 3);
  return randomInt(1, 4);
}

export function generateMail(senders) {
  // Restart the sequence so every call with the same seed gives the same mail.
  random = createRandom(SEED);
  const names = senders.length ? senders : ['Amazon'];
  // IDs come from the seed: they stay the same on refresh, so read and starred
  // marks stick, and a new run gets new IDs, so old marks never attach to
  // different, newly generated messages.
  let nextId = SEED * 1000;
  const mail = [];

  // Current Mail: deliveries still on the way, plus a few delivered today.
  for (let i = randomInt(10, 14); i > 0; i -= 1) {
    const status = pick(ACTIVE_STATUSES);
    const daysAgo = status === 'Received' ? randomInt(0, 1) : randomInt(0, 3);
    mail.push(makeMessage(nextId++, pick(names), status, daysAgo, estimatedOffsetFor(status)));
  }
  for (let i = randomInt(2, 4); i > 0; i -= 1) {
    mail.push(makeMessage(nextId++, pick(names), 'Delivered', 0));
  }

  // Past Mail: delivered packages spread over the past few years.
  for (let i = randomInt(20, 28); i > 0; i -= 1) {
    mail.push(makeMessage(nextId++, pick(names), 'Delivered', pastDeliveryDaysAgo()));
  }

  // Newest first, like an inbox.
  return mail.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
}
