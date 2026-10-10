# EcoGreen VS Code project

A standalone, responsive EcoGreen community website with separate home, activity, community, plant, eco-learning, login, and registration pages. All page links stay in the same local website so the saved login is shared between them. The original published Bolt site is unchanged.

## Run in VS Code

1. Extract `ecogreen-vscode.zip` and open that extracted folder in VS Code.
2. Install **Live Server** if needed.
3. Right-click `index.html` and choose **Open with Live Server**.
4. Keep browsing through that Live Server tab and its page links. Avoid opening individual HTML files directly from File Explorer or starting a second Live Server address: browser storage is separated by site address.
5. Create an account once, then sign in. Your demo login is shared across pages and tabs opened at the same Live Server address. Browsing pages is public; joining sample activities asks you to sign in only when needed.

## Website features

- Responsive botanical color theme, garden photography, and multi-page navigation.
- Plant directory with locally saved picks on **My Plants**.
- Sample planting drives and community groups with local interest/join toggles.
- Eco challenges with local progress toggles, plus practical tips and sustainability guides.
- Login and registration with password validation and PBKDF2 password hashing.

## Demo authentication

Accounts, saved plant picks, join/interest actions, and challenge progress are stored only in this browser. This is a front-end demo, not production authentication: it has no server, verified identity, email confirmation, password recovery, or production access control. Use a demo password only. A real business needs server-side authentication and secure storage.
