// src/modules/reservation/reservation.model.ts
import { pgTable, serial, varchar, integer, date, uuid } from 'drizzle-orm/pg-core';
import { User } from './../users/user.model';
import { roomModel } from './../room/room.model';
export const Reservation = pgTable('Reservation', {
    id: uuid('id').defaultRandom().primaryKey(),

    name: varchar('name', { length: 255 }).notNull(),

    phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),

    emailAddress: varchar('emailAddress', { length: 255 }),

    // emailAddress: varchar('emailAddress', { length: 255 }).references(()=> User.email),

    checkInDate: date('checkInDate', { mode: 'date' }).notNull(),

    checkOutDate: date('checkOutDate', { mode: 'date' }).notNull(),

    noOfChildren: integer('noOfChildren').default(0),

    noOfAdult: integer('noOfAdult').notNull(),

    specialRequest: varchar('specialRequest', { length: 1000 }).default("nothing"),

    code: varchar('code', { length: 255 }),

    paymentStatus: varchar('paymentStatus').default("Pending"),

    paymentRefrence: varchar('paymentRefrence', { length: 255 }).default(null).unique(),

    totalPrice : integer('totalPrice').default(0),

    roomNumber: integer('roomNumber').references(()=> roomModel.roomNo),

    roomDetails: varchar('roomDetails').default(null),

    roomAmanities: varchar('roomAmanities').default(null),
    
})