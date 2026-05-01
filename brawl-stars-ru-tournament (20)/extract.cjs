const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const start = content.indexOf('<script type="module">') + '<script type="module">'.length;
const end = content.lastIndexOf('</script>');
const scriptContent = content.substring(start, end).trim();
fs.writeFileSync('src/main.js', scriptContent);
const newContent = content.substring(0, start - '<script type="module">'.length) + '<script type="module" src="/src/main.js"></script>' + content.substring(end + '</script>'.length);
fs.writeFileSync('index.html', newContent);
