const fs = require('fs');
const https = require('https');

https.get('https://octopusapm.com/_next/static/css/57380745205fee46.css', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const tailwindHeader = `@tailwind base;
@tailwind components;
@tailwind utilities;

@theme {
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-accent-light: var(--accent-light);
  --color-bg-main: var(--bg-main);
  --color-bg-section: var(--bg-section);
  --color-bg-card: var(--bg-card);
  --color-border-color: var(--border-color);
  --color-border-light: var(--border-light);
  --color-text-main: var(--text-main);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
}

`;
    // We append the fetched CSS to the tailwind header.
    // The fetched CSS contains the original :root vars and all the classes!
    fs.writeFileSync('src/app/globals.css', tailwindHeader + data);
    console.log('Successfully wrote globals.css');
  });
}).on('error', (err) => {
  console.error(err);
});
