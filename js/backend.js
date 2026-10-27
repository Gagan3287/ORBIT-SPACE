/* In-browser "API": routes calls to the OrbitManager Singleton and PaymentAdapter. */
const Local = (() => {
  const payments = new PaymentAdapter();
  const need = token => { const u = OrbitManager.getInstance().userFromToken(token); if (!u) { const e = new Error('Please sign in.'); e.status = 401; throw e; } return u; };
  return {
    async handle(path, b = {}, token) {
      const m = OrbitManager.getInstance();
      switch (path) {
        case '/register': return m.register(b.name, b.email, b.password);
        case '/login': return m.login(b.email, b.password);
        case '/logout': m.logout(token); return { ok: true };
        case '/me': return { user: m.publicUser(need(token)) };
        case '/trips': return m.trips;
        case '/dashboard': { const u = need(token); return { stats: m.stats(u), bookings: m.bookingsOf(u), proof: m.proof() }; }
        case '/checkout': {
          const u = need(token), t = m.trips.find(x => x.id === Number(b.tripId));
          if (!t) throw new Error('Trip not found.');
          const seats = Math.max(1, Math.min(4, Number(b.seats) || 1));
          const pay = await payments.pay({ amountINR: t.price * seats, cardNumber: b.card, name: b.name });
          return { booking: m.book(u, t.id, seats, pay) };
        }
        default: throw new Error('Unknown route');
      }
    }
  };
})();
