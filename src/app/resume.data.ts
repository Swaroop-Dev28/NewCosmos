export const PROFILE = {
  name: 'Viswa Swaroop Naidu',
  role: 'Angular front-end developer',
  intro:
    'I take a feature from the screen to the database and then to release: the Angular UI, the .NET API behind it, the SQL underneath, and the testing that makes it safe to ship. Five years on a live production app, and I am the one who finds out why a screen is slow and fixes it.',
  phone: '8919691718',
  email: 'swaroop.workmail@gmail.com',
  linkedin: 'https://linkedin.com/in/swaroop-naidu',
  whatsapp: 'https://wa.me/918919691718',
};

export const BADGES = ['Reliable', 'End-to-end owner', 'Performance fixer', 'Steps up'];

export interface Strength { title: string; text: string; }

export const OWNS: Strength[] = [
  { title: 'Screen to database', text: 'I build the interface, connect it to the .NET API, write the SQL, and test the API in Postman before anything reaches the screen.' },
  { title: 'Makes slow things fast', text: 'I trace sluggish pages to their cause (extra watchers, repeated digest cycles, heavy bindings) and remove it.' },
  { title: 'Ships clean', text: 'I run unit tests and clear SonarQube findings, so production gets code I would stand behind.' },
  { title: 'Steps up when it counts', text: 'When the team lead was away, I ran the daily scrum and kept management informed of progress and blockers.' },
  { title: 'Gets things unstuck', text: 'I work with QA, backend and deployment until an issue is closed before release.' },
  { title: 'Debugs across platforms', text: 'I started on Android, chasing crashes and push notification failures through logs, so I am comfortable investigating on both sides.' },
];

export const TIMELINE = [
  { years: '2022 to 2026', line: 'Angular Developer, Accenture', project: 'mySP Integrated Project' },
  { years: '2021 to 2022', line: 'Android Developer, Accenture', project: 'Shoppers Stop App' },
];

export const SKILLS = [
  'AngularJS', 'UI performance', '.NET Web APIs', 'SQL Server', 'SSMS', 'Postman', 'Visual Studio', 'Git',
  'JIRA', 'SonarQube', 'Unit testing', 'Debugging', 'Android', 'AppsFlyer', 'Agile', 'Scrum',
];
