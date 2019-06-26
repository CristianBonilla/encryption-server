import { createLogger, transports, format } from 'winston';
import moment from 'moment';

const { combine, splat, simple, colorize, printf } = format;
const customFormat = printf(info => {
  const formatDate = moment().format('DD/MM/YYYY hh:mm:ss');
  return (`${ info.level }: ${ info.message } (${ formatDate })`);
});

export const logger = (createLogger({
  level: 'silly',
  format: combine(
    colorize(),
    splat(),
    simple()
  ),
  transports: [
    new transports.Console({
      format: combine(
        customFormat
      )
    })
  ]
}));
