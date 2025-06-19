import { Request } from 'express';

export interface ITokenPayload {
    id: string;
    email: string;
    name: string;
    role: string | 'user';
  }


  