import { DateTime } from 'luxon';

export type AccessTokenDto = {
  token: string;
  refresh: string;
  expiresAt: DateTime;
};
