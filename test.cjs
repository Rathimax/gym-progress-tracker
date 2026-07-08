const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const inject = `
  <script>
    window.addEventListener('error', function(e) {
      const err = document.createElement('div');
      err.style.position = 'fixed';
      err.style.top = '0';
      err.style.left = '0';
      err.style.zIndex = '100000';
      err.style.background = 'red';
      err.style.color = 'white';
      err.style.padding = '10px';
      err.style.fontSize = '20px';
      err.innerHTML = e.message + ' at ' + e.filename + ':' + e.lineno;
      document.body.appendChild(err);
    });
    window.addEventListener('unhandledrejection', function(e) {
      const err = document.createElement('div');
      err.style.position = 'fixed';
      err.style.top = '0';
      err.style.left = '0';
      err.style.zIndex = '100000';
      err.style.background = 'red';
      err.style.color = 'white';
      err.style.padding = '10px';
      err.style.fontSize = '20px';
      err.innerHTML = 'Unhandled Rejection: ' + (e.reason ? (e.reason.message || e.reason) : 'Unknown');
      document.body.appendChild(err);
    });
  </script>
`;
if (!html.includes('window.addEventListener(\'error\'')) {
  html = html.replace('<head>', '<head>' + inject);
  fs.writeFileSync('index.html', html);
  console.log('Injected error handler.');
} else {
  console.log('Already injected.');
}
