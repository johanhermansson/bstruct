CREATE TYPE "public"."widget_color" AS ENUM('yellow', 'blue', 'green', 'red', 'purple');--> statement-breakpoint
CREATE TABLE "boards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text DEFAULT 'My board' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"board_id" integer NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"color" "widget_color" DEFAULT 'yellow' NOT NULL,
	"position_x" integer DEFAULT 20 NOT NULL,
	"position_y" integer DEFAULT 20 NOT NULL,
	"position_z" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "struct_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"struct_id" integer NOT NULL,
	"title" text NOT NULL,
	"level_id" integer NOT NULL,
	"last_done_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "struct_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"level_seconds" bigint NOT NULL,
	"level_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "struct_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"item_id" integer NOT NULL,
	"done_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "structs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"board_id" integer NOT NULL,
	"title" text NOT NULL,
	"color" "widget_color" DEFAULT 'yellow' NOT NULL,
	"position_x" integer DEFAULT 20 NOT NULL,
	"position_y" integer DEFAULT 20 NOT NULL,
	"position_z" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"list_id" integer NOT NULL,
	"title" text NOT NULL,
	"list_order" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"board_id" integer NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"color" "widget_color" DEFAULT 'yellow' NOT NULL,
	"position_x" integer DEFAULT 20 NOT NULL,
	"position_y" integer DEFAULT 20 NOT NULL,
	"position_z" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "struct_items" ADD CONSTRAINT "struct_items_struct_id_structs_id_fk" FOREIGN KEY ("struct_id") REFERENCES "public"."structs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "struct_items" ADD CONSTRAINT "struct_items_level_id_struct_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."struct_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "struct_updates" ADD CONSTRAINT "struct_updates_item_id_struct_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."struct_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "structs" ADD CONSTRAINT "structs_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo_items" ADD CONSTRAINT "todo_items_list_id_todo_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."todo_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo_lists" ADD CONSTRAINT "todo_lists_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "boards_user_idx" ON "boards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notes_board_idx" ON "notes" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "struct_items_struct_idx" ON "struct_items" USING btree ("struct_id");--> statement-breakpoint
CREATE INDEX "struct_items_user_idx" ON "struct_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "struct_updates_item_idx" ON "struct_updates" USING btree ("item_id","done_at");--> statement-breakpoint
CREATE INDEX "structs_board_idx" ON "structs" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "todo_items_list_idx" ON "todo_items" USING btree ("list_id","list_order");--> statement-breakpoint
CREATE INDEX "todo_lists_board_idx" ON "todo_lists" USING btree ("board_id");