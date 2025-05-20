import {
  pgTable,
  serial,
  uuid,
  varchar,
  timestamp,
  boolean,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { User } from './user.model';

export const otpTable = pgTable('OtpTable', {
    id: serial('id').primaryKey(),
    
    user_id: uuid('user_id').notNull().references(() => User.id),

    otp_code: varchar('otp_code', { length: 255 }).notNull(),

    created_at: timestamp('created_at').defaultNow(),

    expires_at: timestamp('expires_at').notNull(),

    is_used: boolean('is_used').default(false),
    }, (otp) => ({
  userFK: foreignKey({
    columns: [otp.user_id],
    foreignColumns: [User.id],
  }),
}));
