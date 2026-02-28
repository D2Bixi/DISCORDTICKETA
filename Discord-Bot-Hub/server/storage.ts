import { db } from "./db";
import {
  tickets,
  announcements,
  transcripts,
  ticketMessages,
  type InsertTicket,
  type InsertAnnouncement,
  type InsertTranscript,
  type InsertTicketMessage,
  type Ticket,
  type Announcement,
  type Transcript,
  type TicketMessage
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Tickets
  getTickets(): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, updates: Partial<InsertTicket>): Promise<Ticket>;
  
  // Messages
  getTicketMessages(ticketId: number): Promise<TicketMessage[]>;
  createTicketMessage(message: InsertTicketMessage): Promise<TicketMessage>;
  
  // Transcripts
  getTranscriptsForTicket(ticketId: number): Promise<Transcript[]>;
  createTranscript(transcript: InsertTranscript): Promise<Transcript>;
  
  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
}

export class DatabaseStorage implements IStorage {
  async getTickets(): Promise<Ticket[]> {
    return await db.select().from(tickets);
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [newTicket] = await db.insert(tickets).values(ticket).returning();
    return newTicket;
  }

  async updateTicket(id: number, updates: Partial<InsertTicket>): Promise<Ticket> {
    const [updatedTicket] = await db
      .update(tickets)
      .set(updates)
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket;
  }

  async getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
    return await db.select().from(ticketMessages).where(eq(ticketMessages.ticketId, ticketId));
  }

  async createTicketMessage(message: InsertTicketMessage): Promise<TicketMessage> {
    const [newMessage] = await db.insert(ticketMessages).values(message).returning();
    return newMessage;
  }

  async getTranscriptsForTicket(ticketId: number): Promise<Transcript[]> {
    return await db.select().from(transcripts).where(eq(transcripts.ticketId, ticketId));
  }

  async createTranscript(transcript: InsertTranscript): Promise<Transcript> {
    const [newTranscript] = await db.insert(transcripts).values(transcript).returning();
    return newTranscript;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements);
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values({
      content: announcement.content,
      imageUrl: announcement.imageUrl,
      linkUrl: announcement.linkUrl,
      targetChannelId: announcement.targetChannelId,
    }).returning();
    return newAnnouncement;
  }
}

export const storage = new DatabaseStorage();
