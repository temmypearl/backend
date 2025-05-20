// src/modules/room/room.model.ts
import { pgTable, serial, varchar, integer, boolean } from 'drizzle-orm/pg-core';

export const roomModel = pgTable('Room', {
    id: serial('id').primaryKey(),
    roomType: varchar('roomType', { length: 255 }).notNull(),
    roomNo: integer('roomNo').notNull(),
    roomPrice: integer('roomPrice').notNull(),
    roomAmenities: varchar('roomAmenities', { length: 255 }).notNull(),
    roomAvailability: boolean('roomAvailability').notNull(),
    code: varchar('code', { length: 255 }),
});
