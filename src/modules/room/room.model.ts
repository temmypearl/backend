// src/modules/room/room.model.ts

import { pgTable, varchar, integer, boolean, uuid } from 'drizzle-orm/pg-core';

export const roomModel = pgTable('Room', {
    id: uuid('id').defaultRandom().primaryKey(),
    roomType: varchar('roomType', { length: 255 }).notNull(),
    roomNo: integer('roomNo').notNull().unique(),
    roomPrice: integer('roomPrice').notNull(),
    roomAmenities: varchar('roomAmenities', { length: 255 }).notNull(),
    roomAvailability: boolean('roomAvailability').notNull(),
    code: varchar('code', { length: 255 }),
    roomImage: varchar('roomImage').notNull(),

});
