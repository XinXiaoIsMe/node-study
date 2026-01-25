import process from 'node:process';
import express from 'express';

const app = express();
const port = Number(process.argv[2]);

app.get('/info', (req, res) => {
  res.json({
    code: 200,
    ts: Date.now(),
    port,
  });
});

app.get('/', (req, res) => {
  res.json({
    code: 200,
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on ${port}`);
});
