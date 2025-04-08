import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define tables first without relations
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const watchlistItems = pgTable("watchlist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  animeId: integer("anime_id").notNull(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  type: text("type"),
  rating: text("rating"),
  year: text("year"),
});

// Define relations after tables are declared
export const usersRelations = relations(users, ({ many }: { many: any }) => ({
  watchlistItems: many(watchlistItems),
}));

export const watchlistItemsRelations = relations(watchlistItems, ({ one }: { one: any }) => ({
  user: one(users, {
    fields: [watchlistItems.userId],
    references: [users.id],
  }),
}));

// Define schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWatchlistItemSchema = createInsertSchema(watchlistItems).pick({
  userId: true,
  animeId: true,
  title: true,
  imageUrl: true,
  type: true,
  rating: true,
  year: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWatchlistItem = z.infer<typeof insertWatchlistItemSchema>;
export type WatchlistItem = typeof watchlistItems.$inferSelect;
