import { headers } from 'next/headers';
import { verifyToken } from './auth';

export interface CurrentUser {
  userId: number;
  username: string;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const headerList = headers();
  const authorization = headerList.get('authorization');
  if (!authorization) return null;

  const token = authorization.replace('Bearer ', '');
  const decoded = verifyToken(token);
  return decoded as CurrentUser | null;
}
