import { pgTable, serial, varchar, timestamp, uuid, integer, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const Admin = pgTable('Admin', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),

    Name: varchar('Name', { length: 255 }).notNull(),

    phoneNumber: varchar('phone_number', { length: 20 }).notNull(),

    email: varchar('email', { length: 255 }).notNull().unique(),

    password: varchar('password', { length: 255 }).notNull(),
    
    verificationCode: varchar('verificationCode', { length: 6 }).default(null),

    otpCreatedAt: timestamp('otp_created_at').defaultNow(),

    otpExpiresAt: timestamp('otp_expires_at').defaultNow(),
    
    otpRequestCount: integer("otp_request_count").notNull().default(0),

    isVerified: boolean("isVerified").default(false),

    refreshToken: varchar("refresh_token").default(null),

    role: varchar('role', { length: 255 }).default('admin'),

    createdAt: timestamp('created_at').defaultNow(),

    updatedAt: timestamp('updated_at').defaultNow(),
});
