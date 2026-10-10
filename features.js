'use strict';
(() => {
  const page = location.pathname.split('/').pop();
  const content = document.querySelector('[data-page-content]');
  const store = (key, value) => { try { localStorage.setItem(`ecogreen.${key}.v1`, JSON.stringify(value)); } catch (_) {} };
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(`ecogreen.${key}.v1`) || 'null') || fallback; } catch (_) { return fallback; } };
  const requireLogin = (event) => {
    if (localStorage.getItem('ecogreen.demo.session.v1')) return true;
    event.preventDefault();
    location.href = `login.html?next=${encodeURIComponent(`${location.pathname}${location.search}${location.hash}`)}`;
    return false;
  };
  const signedIn = (() => { try { return Boolean(JSON.parse(localStorage.getItem('ecogreen.demo.session.v1') || 'null')); } catch (_) { return false; } })();
  const activeLink = document.querySelector(`.main-nav a[href="${page}"]`);
  if (activeLink) activeLink.classList.add('nav-current');
  const heroCta = content?.querySelector('.detail-hero > .button');
  if (signedIn && heroCta) {
    heroCta.href = page === 'plants.html' || page === 'my-plants.html' ? 'my-plants.html' : 'drives.html';
    heroCta.textContent = page === 'plants.html' || page === 'my-plants.html' ? 'View My Plants' : 'Explore activities';
  }
  const imageSets = {
    'explore.html': ['photo-1416879595882-3373a0480b5b','photo-1466692476868-aef1dfb1e735','photo-1511632765486-a01980e01a18'],
    'drives.html': ['photo-1558618666-fcd25c85cd64','photo-1472396961693-142e6e269027','photo-1501004318641-b39e6451bec6'],
    'plants.html': ['photo-1501004318641-b39e6451bec6','photo-1509423350716-97f9360b4e09','photo-1497250681960-ef046c08a56e','photo-1466692476868-aef1dfb1e735'],
    'communities.html': ['photo-1511632765486-a01980e01a18','photo-1529156069898-49953e39b3ac','photo-1556761175-b413da4baf72'],
    'challenges.html': ['photo-1497250681960-ef046c08a56e','photo-1416879595882-3373a0480b5b','photo-1470252649378-9c29740c9fa8','photo-1448375240586-882707db888b'],
    'impact.html': ['photo-1448375240586-882707db888b','photo-1472396961693-142e6e269027','photo-1501004318641-b39e6451bec6'],
    'eco-tips.html': ['photo-1466692476868-aef1dfb1e735','photo-1501004318641-b39e6451bec6','photo-1497250681960-ef046c08a56e','photo-1416879595882-3373a0480b5b'],
    'sustainable.html': ['photo-1589923188900-85dae523342b','photo-1501004318641-b39e6451bec6','photo-1497250681960-ef046c08a56e'],
    'my-plants.html': ['photo-1501004318641-b39e6451bec6','photo-1466692476868-aef1dfb1e735','photo-1497250681960-ef046c08a56e']
  };
  if (content) {
    const cards = [...content.querySelectorAll('.info-card')];
    (imageSets[page] || []).forEach((photo, index) => {
      const card = cards[index]; if (!card) return;
      const img = document.createElement('img');
      img.className = 'info-card-image'; img.loading = 'lazy'; img.alt = '';
      img.src = `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=900&q=82`;
      card.prepend(img);
    });
    if (page === 'drives.html' || page === 'communities.html') {
      cards.forEach((card) => {
        const link = card.querySelector('a'); if (!link) return;
        link.href = '#'; link.dataset.requiresAuth = 'true'; link.classList.add('action-button');
        const key = `joined.${page}.${card.querySelector('h2')?.textContent || ''}`;
        const joined = read('actions', {})[key];
        link.textContent = joined ? 'You’re interested ✓' : page === 'drives.html' ? 'I’m interested →' : 'Join this group →';
        link.addEventListener('click', (event) => {
          if (!requireLogin(event)) return;
          event.preventDefault(); const actions = read('actions', {}); actions[key] = !actions[key]; store('actions', actions);
          link.textContent = actions[key] ? 'You’re interested ✓' : page === 'drives.html' ? 'I’m interested →' : 'Join this group →';
        });
      });
    }
    if (page === 'plants.html') cards.forEach((card) => {
      const link = card.querySelector('a'); if (!link) return;
      const name = card.querySelector('h2')?.textContent || 'Plant';
      link.href = '#'; link.textContent = 'Add to My Plants +'; link.classList.add('action-button');
      link.addEventListener('click', (event) => {
        event.preventDefault(); const plants = read('plants', []);
        if (!plants.includes(name)) plants.push(name); store('plants', plants);
        link.textContent = 'Added to My Plants ✓';
      });
    });
    if (page === 'challenges.html') cards.forEach((card) => {
      const link = card.querySelector('a'); if (!link) return;
      const name = card.querySelector('h2')?.textContent || 'Challenge';
      link.href = '#'; link.dataset.requiresAuth = 'true'; link.classList.add('action-button');
      const done = read('challenges', []).includes(name); link.textContent = done ? 'Completed ✓' : 'Mark as started →';
      link.addEventListener('click', (event) => {
        if (!requireLogin(event)) return;
        event.preventDefault(); const list = read('challenges', []);
        const next = list.includes(name) ? list.filter((item) => item !== name) : [...list, name];
        store('challenges', next); link.textContent = next.includes(name) ? 'Completed ✓' : 'Mark as started →';
      });
    });
  }
  if (page === 'my-plants.html' && content) {
    const section = document.createElement('section'); section.className = 'page-width saved-plants';
    const plants = read('plants', []);
    section.innerHTML = `<h2>Your saved plants</h2><p>${plants.length ? plants.map((name) => `<span class="saved-plant">🌿 ${name}</span>`).join('') : 'You have not saved any plants yet. Visit the plant directory to add one.'}</p><a class="button button-small" href="plants.html">Browse plants</a>`;
    content.append(section);
  }
})();
