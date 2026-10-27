/**
 * SINGLETON PATTERN (browser version)
 * OrbitManager is the one and only manager for users, sessions, trips and
 * bookings. The constructor refuses a second instance; use getInstance().
 * State is persisted in localStorage so the demo survives page refreshes.
 */
class OrbitManager {
  static #instance = null;
  static DB = 'orbit_db_v1';

  constructor() {
    if (OrbitManager.#instance) throw new Error('OrbitManager is a Singleton. Use getInstance().');
    OrbitManager.#instance = this;
    const saved = JSON.parse(localStorage.getItem(OrbitManager.DB) || 'null') || {};
    this.id = Math.random().toString(16).slice(2, 10);
    this.createdAt = new Date().toISOString();
    this.accessCount = 0;
    this.users = saved.users || {};
    this.sessions = saved.sessions || {};
    this.bookings = saved.bookings || [];
    const seats = saved.seats || {};
    this.trips = [
      { id: 1, name: 'Lunar Escape', dest: 'The Moon', days: 5, price: 45000, seats: 12, emoji: '🌙', blurb: 'Walk the Sea of Tranquility and watch Earthrise from your suite.' },
      { id: 2, name: 'Red Planet Rush', dest: 'Mars', days: 21, price: 120000, seats: 8, emoji: '🪐', blurb: 'Cruise to Olympus Mons, the tallest volcano in the solar system.' },
      { id: 3, name: 'Saturn Rings Cruise', dest: 'Saturn', days: 40, price: 210000, seats: 6, emoji: '🛰️', blurb: 'Glide between ice and rock in the most iconic rings ever seen.' },
      { id: 4, name: 'Aurora Orbit', dest: 'Low Earth Orbit', days: 2, price: 18000, seats: 20, emoji: '🌌', blurb: 'Sixteen sunrises in a day from a glass-domed orbital lounge.' },
      { id: 5, name: 'Europa Ice Dive', dest: 'Europa', days: 30, price: 180000, seats: 5, emoji: '❄️', blurb: 'Drill through the ice and explore a hidden ocean world.' },
      { id: 6, name: 'Asteroid Gold Rush', dest: 'Asteroid Belt', days: 14, price: 95000, seats: 10, emoji: '☄️', blurb: 'Prospect among floating rocks with a professional mining crew.' }
    ].map(t => ({ ...t, seats: seats[t.id] ?? t.seats }));
  }

  static getInstance() {
    if (!OrbitManager.#instance) new OrbitManager();
    OrbitManager.#instance.accessCount++;
    return OrbitManager.#instance;
  }

  #save() {
    const seats = Object.fromEntries(this.trips.map(t => [t.id, t.seats]));
    localStorage.setItem(OrbitManager.DB, JSON.stringify({ users: this.users, sessions: this.sessions, bookings: this.bookings, seats }));
  }
  async #hash(pw, salt) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + pw));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  #rand(n = 16) { return [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join(''); }

  async register(name, email, password) {
    email = String(email || '').toLowerCase().trim();
    if (!name || !email.includes('@') || String(password || '').length < 6) throw new Error('Enter a name, valid email and a password of 6+ characters.');
    if (this.users[email]) throw new Error('That email is already registered.');
    const salt = this.#rand(8);
    const u = { id: this.#rand(8), name: String(name).trim().slice(0, 40), email, salt, hash: await this.#hash(password, salt), joined: new Date().toISOString() };
    this.users[email] = u;
    return this.#session(u);
  }
  async login(email, password) {
    const u = this.users[String(email || '').toLowerCase().trim()];
    if (!u || u.hash !== await this.#hash(String(password || ''), u.salt)) throw new Error('Invalid email or password.');
    return this.#session(u);
  }
  #session(u) { const token = this.#rand(24); this.sessions[token] = u.email; this.#save(); return { token, user: this.publicUser(u) }; }
  publicUser(u) { return { id: u.id, name: u.name, email: u.email, joined: u.joined }; }
  userFromToken(t) { const e = this.sessions[t]; return e ? this.users[e] : null; }
  logout(t) { delete this.sessions[t]; this.#save(); }

  book(user, tripId, seats, payment) {
    const trip = this.trips.find(t => t.id === Number(tripId));
    seats = Math.max(1, Math.min(4, Number(seats) || 1));
    if (!trip) throw new Error('Trip not found.');
    if (trip.seats < seats) throw new Error('Not enough seats left.');
    trip.seats -= seats;
    const b = { id: 'ORB-' + this.#rand(3).toUpperCase(), userId: user.id, tripId: trip.id, trip: trip.name, dest: trip.dest, emoji: trip.emoji, seats, total: trip.price * seats, reference: payment.reference, at: new Date().toISOString() };
    this.bookings.push(b); this.#save();
    return b;
  }
  bookingsOf(user) { return this.bookings.filter(b => b.userId === user.id).reverse(); }
  stats(user) {
    const mine = this.bookingsOf(user);
    return { trips: mine.length, seats: mine.reduce((a, b) => a + b.seats, 0), spent: mine.reduce((a, b) => a + b.total, 0), travellers: Object.keys(this.users).length, totalBookings: this.bookings.length };
  }
  proof() {
    const a = OrbitManager.getInstance(), b = OrbitManager.getInstance();
    let blocked = false;
    try { new OrbitManager(); } catch { blocked = true; }
    return { instanceId: this.id, createdAt: this.createdAt, sameInstance: a === b, secondInstanceBlocked: blocked, accessCount: this.accessCount };
  }
}
