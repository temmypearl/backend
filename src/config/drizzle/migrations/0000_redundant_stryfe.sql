DROP TABLE IF EXISTS "OtpTable_" CASCADE;
DROP TABLE IF EXISTS "Room" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"payment" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "OtpTable" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"otp_code" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "Room" (
	"id" serial PRIMARY KEY NOT NULL,
	"roomType" varchar(255) NOT NULL,
	"roomNo" integer NOT NULL,
	"roomPrice" integer NOT NULL,
	"roomAmenities" varchar(255) NOT NULL,
	"roomAvailability" boolean NOT NULL,
	"code" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "OtpTable" ADD CONSTRAINT "OtpTable_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;