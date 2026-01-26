import express from 'express';

const app = express();

app.get('/', (_req, res) => {
  res.status(200).send({
    msg: 'success',
  });
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on 3000...`);
});
