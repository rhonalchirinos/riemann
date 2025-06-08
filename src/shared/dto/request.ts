import { AccessToken, CaptchaTemplate, Enterprise } from '@prisma/client';

import { Request } from 'express';

interface AuthenticatedUser {
  userId: string;
  accessToken: AccessToken;
}

export interface AuthRequest extends Request {
  user: AuthenticatedUser;
  enterpriseId: string;
  enterprise: Enterprise;
}

export interface CaptchaRequest extends Request {
  enterpriseId: string;
  enterprise: Enterprise;

  templateId: string;
  template: CaptchaTemplate;
}
