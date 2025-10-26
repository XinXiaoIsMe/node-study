import fs from 'node:fs';

export function createHtmlPage (path, res) {
  res.setHeader('Content-type', 'text/html');
  fs.readFile(path, (err, data) => {
    if (err) {
      res.end(`<div>404</div>`);
      return;
    }

    res.end(data);
  });
}