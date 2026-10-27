const $ = s => document.querySelector(s);
const app = $('#app');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr = n => '₹' + Number(n).toLocaleString('en-IN');
let token = localStorage.getItem('orbit_token'), user = null, trips = [];

async function api(path, body) {
  try { return await Local.handle(path, body, token); }
  catch (e) { if (e.status === 401 && token) clearAuth(); throw e; }
}
function clearAuth() { token = null; user = null; localStorage.removeItem('orbit_token'); }
function toast(msg, type = 'ok') { const t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = msg; $('#toasts').append(t); setTimeout(() => { t.style.opacity = 0; t.style.transition = '.4s'; setTimeout(() => t.remove(), 400); }, 3200); }
function confetti() { const c = ['#7c5cff', '#22d3ee', '#f0abfc', '#34d399', '#fbbf24']; for (let i = 0; i < 90; i++) { const e = document.createElement('i'); e.className = 'conf'; e.style.left = Math.random() * 100 + 'vw'; e.style.background = c[i % 5]; e.style.animationDuration = 2 + Math.random() * 2.5 + 's'; e.style.animationDelay = Math.random() * .6 + 's'; document.body.append(e); setTimeout(() => e.remove(), 5500); } }

/* ---------- starfield ---------- */
const cv = $('#stars'), cx = cv.getContext('2d'); let stars = [], mx = 0, my = 0;
function sizeStars() { cv.width = innerWidth; cv.height = innerHeight; stars = Array.from({ length: 140 }, () => ({ x: Math.random() * cv.width, y: Math.random() * cv.height, z: Math.random() * 2 + .3, p: Math.random() * 6 })); }
addEventListener('resize', sizeStars); addEventListener('mousemove', e => { mx = (e.clientX - innerWidth / 2) / 60; my = (e.clientY - innerHeight / 2) / 60; });
(function loop(t) { cx.clearRect(0, 0, cv.width, cv.height); for (const s of stars) { s.y += s.z * .15; if (s.y > cv.height) s.y = 0; cx.globalAlpha = .4 + .6 * Math.abs(Math.sin(t / 900 + s.p)); cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(s.x - mx * s.z, s.y - my * s.z, s.z * .7, 0, 7); cx.fill(); } requestAnimationFrame(loop); })(0); sizeStars();

/* ---------- helpers: reveal, count-up, tilt ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
function fx() {
  app.querySelectorAll('.reveal').forEach((e, i) => { e.style.transitionDelay = (i % 6) * 70 + 'ms'; io.observe(e); });
  app.querySelectorAll('[data-count]').forEach(el => { const to = +el.dataset.count, pre = el.dataset.pre || '', t0 = performance.now(); (function f(t) { const k = Math.min(1, (t - t0) / 1400); el.textContent = pre + Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString('en-IN'); if (k < 1) requestAnimationFrame(f); })(t0); });
  app.querySelectorAll('.card.tilt').forEach(c => { c.onmousemove = e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`; }; c.onmouseleave = () => c.style.transform = ''; });
}

/* ---------- nav ---------- */
function nav() {
  const cur = location.hash.slice(2).split('/')[0];
  const a = (h, t, c = '') => `<a href="#/${h}" class="${cur === h ? 'on' : ''} ${c}">${t}</a>`;
  $('#nav').innerHTML = `<div class="logo" onclick="location.hash='#/'"><span>🪐</span> Orbit</div><nav>${a('', 'Home', 'hide')}${a('trips', 'Destinations')}${user ? a('dashboard', 'Dashboard') + `<a onclick="signout()">Sign out</a>` : a('login', 'Log in') + `<a class="btn sm" href="#/signup" style="color:#fff">Get started</a>`}</nav>`;
}
async function signout() { try { await api('/logout', {}); } catch {} clearAuth(); toast('Signed out. Safe travels, astronaut 👋'); location.hash = '#/'; }

/* ---------- views ---------- */
const V = {};
V.home = () => `<div class="page">
<section class="hero"><div class="planet">🚀</div><span class="pill">✨ Now booking 2027 departures</span>
<h1>Your next vacation is <span class="grad">off this planet.</span></h1>
<p>Orbit is the premium way to book trips to the Moon, Mars and beyond. Luxury cabins, expert crews, unforgettable views.</p>
<div class="row"><a class="btn" href="#/trips">Explore destinations</a><a class="btn ghost" href="#/signup">Create free account</a></div></section>
<div class="marquee"><div>${'🌙 Moon &nbsp;•&nbsp; 🪐 Mars &nbsp;•&nbsp; 🛰️ Saturn &nbsp;•&nbsp; 🌌 Orbit &nbsp;•&nbsp; ❄️ Europa &nbsp;•&nbsp; ☄️ Asteroids &nbsp;•&nbsp; '.repeat(8)}</div></div>
<div class="wrap"><div class="stats">
${[['12400', 'Happy travellers', ''], ['6', 'Destinations', ''], ['98', '% On-time launches', ''], ['4', 'Star safety rating', '']].map(s => `<div class="card tilt reveal"><div class="num" data-count="${s[0]}">0</div><div class="lbl">${s[1]}</div></div>`).join('')}</div></div>
<div class="wrap sec"><h2 class="reveal">Why <span class="grad">Orbit?</span></h2><p class="reveal">Everything you need for a smooth journey.</p><div class="grid">
${[['🛡️', 'Safety first', 'Triple-redundant life support on every flight.'], ['🍽️', 'Gourmet zero-g dining', 'Chef-designed menus made for floating.'], ['🔭', 'Panoramic suites', 'Floor-to-ceiling windows with the best view in the universe.']].map(f => `<div class="card tilt reveal"><div style="font-size:2.4rem">${f[0]}</div><h3 style="margin:10px 0 6px">${f[1]}</h3><p style="color:var(--mut)">${f[2]}</p></div>`).join('')}</div></div>
<div class="wrap" style="text-align:center"><div class="card reveal" style="padding:50px"><h2 style="font-size:2.2rem;margin-bottom:12px">Ready for <span class="grad">liftoff?</span></h2><p style="color:var(--mut);margin-bottom:22px">Create your account in 10 seconds.</p><a class="btn" href="#/signup">Join Orbit 🚀</a></div></div>
<footer>© 2026 Orbit Space Travel · Demo project for lab assignment · Singleton + Adapter patterns</footer></div>`;

V.trips = async () => { trips = await api('/trips'); return `<div class="page wrap sec"><h2>Choose your <span class="grad">destination</span></h2><p>Pick a journey, then check out in seconds.</p><div class="grid">${trips.map(t => `<div class="card tilt reveal trip" style="--h:${t.hue}"><span class="em">${t.emoji}</span><h3>${esc(t.name)}</h3><p>${esc(t.blurb)}</p><div class="meta"><span>📍 ${esc(t.dest)}</span><span>🕒 ${t.days} days</span><span>💺 ${t.seats} left</span></div><div style="display:flex;justify-content:space-between;align-items:center"><span class="price">${inr(t.price)}</span><button class="btn sm" ${t.seats < 1 ? 'disabled' : ''} onclick="location.hash='#/checkout/${t.id}'">Book now</button></div></div>`).join('')}</div></div>`; };

const authForm = signup => `<div class="page auth"><div class="card"><h2>${signup ? 'Create account' : 'Welcome back'}</h2><p class="s">${signup ? 'Start your journey beyond Earth.' : 'Log in to manage your trips.'}</p>
<form id="af">${signup ? '<div class="field"><label>Full name</label><input name="name" required placeholder="Neil Armstrong"></div>' : ''}<div class="field"><label>Email</label><input name="email" type="email" required placeholder="you@example.com"></div><div class="field"><label>Password</label><input name="password" type="password" required minlength="6" placeholder="••••••••"></div>
<button class="btn" style="width:100%" id="ab">${signup ? 'Create account' : 'Log in'}</button></form>
<p class="s" style="margin:18px 0 0;text-align:center">${signup ? 'Have an account? <a class="link" href="#/login">Log in</a>' : 'New here? <a class="link" href="#/signup">Sign up</a>'}</p></div></div>`;
V.login = () => authForm(false); V.signup = () => authForm(true);

V.dashboard = async () => {
  const d = await api('/dashboard'), s = d.stats, p = d.proof;
  const row = (k, v, ok) => `<li><span>${k}</span><span class="${ok ? 'ok' : ''}">${v}</span></li>`;
  return `<div class="page wrap"><div class="dash-head"><div><h2 style="font-size:2rem">Hello, <span class="grad">${esc(user.name.split(' ')[0])}</span> 👋</h2><p style="color:var(--mut)">Mission control for your travels.</p></div><a class="btn" href="#/trips">+ Book a trip</a></div>
<div class="stats">${[['Trips booked', s.trips, ''], ['Seats reserved', s.seats, ''], ['Total spent', s.spent, '₹'], ['Orbit travellers', s.travellers, '']].map(x => `<div class="card tilt reveal"><div class="num" data-count="${x[1]}" data-pre="${x[2]}">0</div><div class="lbl">${x[0]}</div></div>`).join('')}</div>
<div class="two"><div class="card reveal"><h3 style="margin-bottom:16px">Your bookings</h3>${d.bookings.length ? d.bookings.map(b => `<div class="bk"><span class="e">${b.emoji}</span><div><b>${esc(b.trip)}</b><small>${b.id} · ${b.seats} seat(s) · ${esc(b.dest)}</small></div><div class="r"><b>${inr(b.total)}</b><span class="badge">Paid</span></div></div>`).join('') : '<div class="empty">🛸 No trips yet.<br><br><a class="btn sm" href="#/trips">Find your first trip</a></div>'}</div>
<div class="card reveal proof"><h3 style="margin-bottom:6px">🔒 Singleton proof</h3><p style="color:var(--mut);font-size:.85rem;margin-bottom:10px">Live from the server's <b>OrbitManager</b>.</p><ul>${row('Instance ID', p.instanceId, 1)}${row('getInstance() === getInstance()', p.sameInstance ? 'true ✓' : 'false', p.sameInstance)}${row('new OrbitManager() blocked', p.secondInstanceBlocked ? 'yes ✓' : 'no', p.secondInstanceBlocked)}${row('Times accessed', p.accessCount)}${row('Created', new Date(p.createdAt).toLocaleTimeString())}</ul>
<p style="color:var(--mut);font-size:.8rem;margin-top:12px">Payments use the <b>Adapter</b> pattern (PaymentAdapter → legacy gateway).</p></div></div></div>`;
};

V.checkout = async id => {
  if (!trips.length) trips = await api('/trips');
  const t = trips.find(x => x.id == id); if (!t) return V.notfound();
  return `<div class="page wrap"><h2 style="font-size:2rem;margin-bottom:24px">Secure <span class="grad">checkout</span></h2><div class="pay"><div>
<div class="cc"><div class="row"><b>ORBIT PAY</b><span>💳</span></div><div class="n" id="pn">•••• •••• •••• ••••</div><div class="row"><span id="pc">CARD HOLDER</span><span id="pe">MM/YY</span></div></div>
<p class="demo">🧪 Demo only — no real payment. Use any number (e.g. 4242 4242 4242 4242). Ending 0000 = declined.</p></div>
<div class="card"><div class="sum"><div><span>${t.emoji} ${esc(t.name)}</span><span>${inr(t.price)}</span></div><div><span>Seats</span><select id="seats" style="width:90px">${[1, 2, 3, 4].map(n => `<option>${n}</option>`).join('')}</select></div><div class="t"><span>Total</span><span id="tot">${inr(t.price)}</span></div></div>
<form id="pf" style="margin-top:18px"><div class="field"><label>Name on card</label><input id="cn" required placeholder="Your name" value="${esc(user.name)}"></div><div class="field"><label>Card number</label><input id="cd" required inputmode="numeric" maxlength="19" placeholder="4242 4242 4242 4242"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div class="field"><label>Expiry</label><input id="ce" required maxlength="5" placeholder="MM/YY"></div><div class="field"><label>CVV</label><input required type="password" maxlength="3" placeholder="123"></div></div>
<button class="btn" style="width:100%" id="pb">Pay ${inr(t.price)}</button></form></div></div></div>`;
};
V.notfound = () => `<div class="page auth"><div class="card" style="text-align:center"><div style="font-size:4rem">🛰️</div><h2>Lost in space</h2><p class="s">That page doesn't exist.</p><a class="btn" href="#/">Back home</a></div></div>`;

/* ---------- bindings per view ---------- */
function bind(name, arg) {
  if (name === 'login' || name === 'signup') $('#af').onsubmit = async e => { e.preventDefault(); const b = $('#ab'), f = Object.fromEntries(new FormData(e.target)); b.disabled = true; b.innerHTML = '<span class="spin"></span>Please wait'; try { const d = await api(name === 'login' ? '/login' : '/register', f); token = d.token; user = d.user; localStorage.setItem('orbit_token', token); toast(`Welcome aboard, ${user.name.split(' ')[0]}! 🚀`); location.hash = '#/dashboard'; } catch (er) { toast(er.message, 'err'); b.disabled = false; b.textContent = name === 'login' ? 'Log in' : 'Create account'; } };
  if (name === 'checkout') {
    const t = trips.find(x => x.id == arg);
    $('#cd').oninput = e => { const v = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(); e.target.value = v; $('#pn').textContent = (v + '•••• •••• •••• ••••'.slice(v.length)) || ''; };
    $('#cn').oninput = e => $('#pc').textContent = e.target.value.toUpperCase() || 'CARD HOLDER';
    $('#ce').oninput = e => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); e.target.value = v; $('#pe').textContent = v || 'MM/YY'; };
    $('#cn').dispatchEvent(new Event('input'));
    $('#seats').onchange = e => { const tt = inr(t.price * e.target.value); $('#tot').textContent = tt; $('#pb').textContent = 'Pay ' + tt; };
    $('#pf').onsubmit = async e => { e.preventDefault(); const b = $('#pb'); b.disabled = true; b.innerHTML = '<span class="spin"></span>Processing payment…'; try { const { booking } = await api('/checkout', { tripId: t.id, seats: $('#seats').value, card: $('#cd').value, name: $('#cn').value }); success(booking); } catch (er) { toast(er.message, 'err'); b.disabled = false; b.textContent = 'Pay ' + $('#tot').textContent; } };
  }
}
function success(b) { app.innerHTML = `<div class="page wrap"><div class="card success"><svg class="check" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46"/><path d="M28 52l16 16 30-34"/></svg><h2 style="font-size:2rem">Payment successful!</h2><p style="color:var(--mut);margin:10px 0 24px">${b.emoji} ${esc(b.trip)} · ${b.seats} seat(s) · <b>${inr(b.total)}</b><br>Booking <b>${b.id}</b> · Ref ${b.reference}</p><a class="btn" href="#/dashboard">Go to dashboard</a></div></div>`; confetti(); toast('Booking confirmed 🎉'); }

/* ---------- router ---------- */
async function route() {
  const [name = '', arg] = location.hash.slice(2).split('/');
  if (token && !user) { try { user = (await api('/me')).user; } catch {} }
  const prot = ['dashboard', 'checkout'];
  if (prot.includes(name) && !user) { toast('Please log in first', 'err'); return location.hash = '#/login'; }
  if (['login', 'signup'].includes(name) && user) return location.hash = '#/dashboard';
  nav(); scrollTo(0, 0);
  const key = name || 'home', view = V[key] || V.notfound;
  try { app.innerHTML = await view(arg); bind(key, arg); fx(); } catch (e) { toast(e.message, 'err'); app.innerHTML = V.notfound(); }
}
addEventListener('hashchange', route); route();
