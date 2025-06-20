import { pgTable, serial, varchar, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { Reservation } from "./../reservation/reservation.model";
export const refundTable = pgTable('refund_requests', {
    id: uuid('id').primaryKey(),
    reservationId: uuid('reservation_id').notNull().references(()=> Reservation.id),
    reason: varchar('reason', { length: 500 }).notNull(),
    status: varchar('status', { length: 50 }).default('pending'), // pending | approved | rejected | refunded
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
