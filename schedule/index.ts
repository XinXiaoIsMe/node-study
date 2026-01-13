import axios from 'axios';
import schedule from 'node-schedule';
import config from './config';

schedule.scheduleJob('*/10 * * * * *', () => {
  axios(config.check_url, {
    method: 'post',
    headers: {
      Referer: config.url,
      Cookie: config.cookie,
    },
  }).then((data) => {
    if (data.status === 200) {
      // eslint-disable-next-line no-console
      console.log(data.data);
    }
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.log({ err });
  });
});
