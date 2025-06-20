// src/scripts/seedRooms.ts
import { db } from "../../drizzle/connection"; // assumes your Neon + Drizzle setup is here
import { roomModel } from "./room.model";
import { eq } from "drizzle-orm";

const roomTypes = [
    "Double Deluxe",
    "Royal Standard",
    "Royal Executive",
    "Executive Suite",
    "Luxury King",
    "Premium Suite"
] as const;

type RoomType = typeof roomTypes[number];


const roomPriceMap: Record<RoomType, number> = {
    "Double Deluxe": 145000,
    "Royal Standard": 150000,
    "Royal Executive": 165000,
    "Executive Suite": 185000,
    "Luxury King": 200000,
    "Premium Suite": 200000
};

const sampleAmenities = [
    "Wi-Fi, TV, AC",
    "Wi-Fi, TV, AC, Mini Bar",
    "Wi-Fi, TV, AC, Sea View",
    "Wi-Fi, TV, AC, Pool Access",
    "Wi-Fi, TV, AC, Gym Access",
    "Wi-Fi, TV, AC, Breakfast Included"
];

const roomImageBaseUrl = "https://example.com/images/rooms/";

const generateRooms = () => {
    const data = [];

    for (let i = 1; i <= 300; i++) {
        const roomType = roomTypes[i % roomTypes.length]; // rotate types
        const room = {
            roomType,
            roomNo: i,
            roomPrice: roomPriceMap[roomType],
            roomAmenities: sampleAmenities[i % sampleAmenities.length],
            roomAvailability: 1, // 80% available
            code: `R-${roomType.split(' ').join('-')}-${i}`,
            roomImage: `${roomImageBaseUrl}${roomType.split(' ').join('-').toLowerCase()}.jpg`,
        };
        data.push(room);
    }

    return data;
};

const seedRooms = async () => {
    const rooms = generateRooms();
    await db.insert(roomModel).values(rooms);
    console.log("300 rooms inserted successfully.");
};



seedRooms().catch((e) => {
    console.error("Seeding failed:", e);
});
