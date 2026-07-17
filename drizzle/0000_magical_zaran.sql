CREATE TYPE "public"."action_status" AS ENUM('todo', 'in_progress', 'done');--> statement-breakpoint
CREATE TYPE "public"."conn_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."notif_type" AS ENUM('text', 'connect_request', 'broadcast');--> statement-breakpoint
CREATE TYPE "public"."notif_variant" AS ENUM('alert', 'info');--> statement-breakpoint
CREATE TYPE "public"."sector" AS ENUM('pendidikan', 'pengusaha', 'profesional');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'blocked');--> statement-breakpoint
CREATE TABLE "actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" "action_status" DEFAULT 'todo' NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"start_date" date,
	"end_date" date,
	"votes" integer DEFAULT 0 NOT NULL,
	"background" text,
	"objectives" text,
	"needs_funding" boolean DEFAULT false,
	"is_pic" boolean DEFAULT true,
	"skills" text[] DEFAULT '{}',
	"is_published" boolean DEFAULT false NOT NULL,
	"manifestasi_id" integer,
	"breakdown_id" integer
);
--> statement-breakpoint
CREATE TABLE "admin_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_accounts_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"requester_id" integer NOT NULL,
	"requestee_id" integer NOT NULL,
	"status" "conn_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"action_id" integer NOT NULL,
	"participant_id" integer NOT NULL,
	"types" text[] NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manifestasi_breakdowns" (
	"id" serial PRIMARY KEY NOT NULL,
	"manifestasi_id" integer NOT NULL,
	"label" text,
	"keterangan" text NOT NULL,
	"dalil" text NOT NULL,
	"contoh" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manifestasi_iwa" (
	"id" serial PRIMARY KEY NOT NULL,
	"poin" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "notif_type" NOT NULL,
	"variant" "notif_variant" DEFAULT 'info',
	"title" text NOT NULL,
	"body" text NOT NULL,
	"actor_id" integer,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"wa_number" text NOT NULL,
	"password_hash" text NOT NULL,
	"must_change_password" boolean DEFAULT true NOT NULL,
	"sector" "sector",
	"role" text DEFAULT 'Peserta',
	"organization" text DEFAULT '-',
	"skills" text[] DEFAULT '{}',
	"avatar_url" text,
	"initials" text,
	"offering" text DEFAULT '',
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_wa_number_unique" UNIQUE("wa_number")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"user_id" integer NOT NULL,
	"action_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "votes_user_id_action_id_pk" PRIMARY KEY("user_id","action_id")
);
--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_manifestasi_id_manifestasi_iwa_id_fk" FOREIGN KEY ("manifestasi_id") REFERENCES "public"."manifestasi_iwa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_breakdown_id_manifestasi_breakdowns_id_fk" FOREIGN KEY ("breakdown_id") REFERENCES "public"."manifestasi_breakdowns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_requestee_id_users_id_fk" FOREIGN KEY ("requestee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_participant_id_users_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manifestasi_breakdowns" ADD CONSTRAINT "manifestasi_breakdowns_manifestasi_id_manifestasi_iwa_id_fk" FOREIGN KEY ("manifestasi_id") REFERENCES "public"."manifestasi_iwa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_pair" ON "connections" USING btree ("requester_id","requestee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_user_action" ON "contributions" USING btree ("action_id","participant_id");