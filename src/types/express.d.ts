import { User } from '@prisma/client'; // Adjust the import according to your user model

declare module 'express' {
  export interface Request {
    user?: { userId: number; username: string; role: string }; // or a more specific type if you have one
  }
}
