import { pgTable, serial, varchar, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { Payment } from 'modules/payment/payment.model';

export const User = pgTable('users', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),

    firstName: varchar('first_name', { length: 255 }).notNull(),

    lastName: varchar('last_name', { length: 255 }).notNull(),

    phoneNumber: varchar('phone_number', { length: 20 }).notNull(),

    email: varchar('email', { length: 255 }).notNull().unique(),

    password: varchar('password', { length: 255 }).notNull(),

    paymentReceipt: varchar('payment', { length: 255 }),

    createdAt: timestamp('created_at').defaultNow(),

    updatedAt: timestamp('updated_at').defaultNow(),
});
