import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const User = pgTable('users', {
  id: serial('id').primaryKey(),

  firstName: varchar('first_name', { length: 255 }).notNull(),

  lastName: varchar('last_name', { length: 255 }).notNull(),

  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),

  email: varchar('email', { length: 255 }).notNull().unique(),

  password: varchar('password', { length: 255 }).notNull(),

  createdAt: timestamp('created_at').defaultNow(),

  updatedAt: timestamp('updated_at').defaultNow(),
});
