import { pgTable, text, serial, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  discordChannelId: text("discord_channel_id").notNull(),
  creatorId: text("creator_id").notNull(),
  topic: text("topic").notNull(),
  status: text("status").notNull().default("open"), // open, claimed, closed
  claimedBy: text("claimed_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ticketMessages = pgTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  authorId: text("author_id").notNull(),
  authorTag: text("author_tag").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isFromDashboard: text("is_from_dashboard").default("false"),
});

export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id),
  content: jsonb("content").notNull(),
  closedAt: timestamp("closed_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  targetChannelId: text("target_channel_id").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true, createdAt: true });
export const insertTicketMessageSchema = createInsertSchema(ticketMessages).omit({ id: true, timestamp: true });
export const insertTranscriptSchema = createInsertSchema(transcripts).omit({ id: true, closedAt: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, sentAt: true });

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;

export type Transcript = typeof transcripts.$inferSelect;
export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
