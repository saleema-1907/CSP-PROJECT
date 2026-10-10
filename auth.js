'use strict';

(() => {
  const USERS_KEY = 'ecogreen.demo.users.v1';
  const SESSION_KEY = 'ecogreen.demo.session.v1';
  const LEGACY_SESSION_KEY = 'ecogreen.demo.session.v1';
  const ITERATIONS = 150000;

  function postLoginDestination() {
    const requested = new URLSearchParams(window.location.search).get('next');
    if (!requested) return 'index.html';
    try {
      const destination = new URL(requested, window.location.href);
      if (destination.origin === window.location.origin && destination.pathname.endsWith('.html')) {
        return `${destination.pathname.split('/').pop()}${destination.search}${destination.hash}`;
      }
    } catch (_) {}
    return 'index.html';
  }

  const getUsers = () => {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      return users && typeof users === 'object' && !Array.isArray(users) ? users : {};
    } catch (_) {
      return {};
    }
  };

  const bytesToBase64 = (bytes) => {
    let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  };

  const base64ToBytes = (text) => Uint8Array.from(atob(text), (character) => character.charCodeAt(0));

  async function hashPassword(password, salt) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Secure browser cryptography is unavailable. Run this site through VS Code Live Server.');
    }
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const result = await crypto.subtle.deriveBits({
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    }, key, 256);
    return new Uint8Array(result);
  }

  function showMessage(element, message, isError) {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle('error', Boolean(isError));
    element.classList.toggle('success', !isError && Boolean(message));
  }

  document.querySelectorAll('[data-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.toggle);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.textContent = show ? 'Hide' : 'Show';
      button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const message = document.getElementById('signup-message');
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim().toLowerCase();
      const phone = document.getElementById('signup-phone').value.trim();
      const location = document.getElementById('signup-location').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm').value;

      if (name.length < 2) return showMessage(message, 'Please enter your full name.', true);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMessage(message, 'Enter a valid email address.', true);
      if (password.length < 10 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        return showMessage(message, 'Use at least 10 characters with at least one letter and one number.', true);
      }
      if (password !== confirm) return showMessage(message, 'The passwords do not match.', true);

      const users = getUsers();
      if (users[email]) return showMessage(message, 'An account already exists for this email. Please sign in.', true);
      const submit = signupForm.querySelector('[type="submit"]');
      submit.disabled = true;
      showMessage(message, 'Creating your local demo account…', false);
      try {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const passwordHash = await hashPassword(password, salt);
        users[email] = {
          name,
          email,
          phone,
          location,
          salt: bytesToBase64(salt),
          hash: bytesToBase64(passwordHash),
          iterations: ITERATIONS,
        };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        // localStorage is shared by pages opened in new tabs/windows on the
        // same local site. sessionStorage is isolated per tab and made users
        // appear signed out whenever a link opened a new tab.
        localStorage.setItem(SESSION_KEY, JSON.stringify({ name, email, signedInAt: Date.now() }));
        window.location.assign('index.html');
      } catch (error) {
        showMessage(message, error.message || 'Could not create the account in this browser.', true);
        submit.disabled = false;
      }
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const message = document.getElementById('login-message');
      const email = document.getElementById('login-email').value.trim().toLowerCase();
      const password = document.getElementById('login-password').value;
      const user = getUsers()[email];
      if (!user || !user.salt || !user.hash) return showMessage(message, 'Email or password is incorrect.', true);

      const submit = loginForm.querySelector('[type="submit"]');
      submit.disabled = true;
      try {
        const attempted = await hashPassword(password, base64ToBytes(user.salt));
        const stored = base64ToBytes(user.hash);
        const matches = attempted.length === stored.length && attempted.every((value, index) => value === stored[index]);
        if (!matches) {
          showMessage(message, 'Email or password is incorrect.', true);
          submit.disabled = false;
          return;
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email, signedInAt: Date.now() }));
        window.location.assign(postLoginDestination());
      } catch (error) {
        showMessage(message, error.message || 'Could not sign in in this browser.', true);
        submit.disabled = false;
      }
    });
  }

  const session = (() => {
    try {
      const sharedSession = localStorage.getItem(SESSION_KEY);
      if (sharedSession) return JSON.parse(sharedSession);
      // Recover a previous-tab login, then promote it to shared storage.
      const oldSession = sessionStorage.getItem(LEGACY_SESSION_KEY);
      if (!oldSession) return null;
      localStorage.setItem(SESSION_KEY, oldSession);
      sessionStorage.removeItem(SESSION_KEY);
      return JSON.parse(oldSession);
    } catch (_) { return null; }
  })();
  const authLinks = document.querySelector('.nav-auth');
  if (session && authLinks) {
    authLinks.replaceChildren();
    const greeting = document.createElement('span');
    greeting.className = 'welcome-user';
    greeting.textContent = `Hi, ${session.name}`;
    const signout = document.createElement('button');
    signout.className = 'login-link signout-button';
    signout.type = 'button';
    signout.textContent = 'Sign out';
    signout.addEventListener('click', () => {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      window.location.reload();
    });
    authLinks.append(greeting, signout);
  }

  // Browsing remains public. Only interactive actions ask a visitor to sign in.
  document.querySelectorAll('[data-requires-auth]').forEach((control) => {
    control.addEventListener('click', (event) => {
      let signedIn = false;
      try { signedIn = Boolean(JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')); } catch (_) {}
      if (!signedIn) {
        event.preventDefault();
        const returnTo = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
        location.href = `login.html?next=${returnTo}`;
      }
    });
  });

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('nav-open', !expanded);
    });
  }
})();
