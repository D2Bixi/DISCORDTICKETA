import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupBot, sendAnnouncement, sendTicketMessage, closeTicketInDiscord } from "./bot";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Start Discord bot
  setupBot();

  // Tickets
  app.get(api.tickets.list.path, async (req, res) => {
    const tickets = await storage.getTickets();
    res.json(tickets);
  });

  app.get(api.tickets.get.path, async (req, res) => {
    const ticket = await storage.getTicket(Number(req.params.id));
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  });

  
    app.patch(api.tickets.update.path, async (req, res) => {
      try {
        const input = api.tickets.update.input.parse(req.body);
        const ticketId = Number(req.params.id);
        const oldTicket = await storage.getTicket(ticketId);
        const ticket = await storage.updateTicket(ticketId, input);
        
        if (input.status === 'closed' && oldTicket && oldTicket.status !== 'closed') {
          await closeTicketInDiscord(ticket.discordChannelId, ticket.id, ticket.creatorId, ticket.topic);
        }
        
        res.json(ticket);
      } catch (err) {
  
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.tickets.messages.list.path, async (req, res) => {
    const messages = await storage.getTicketMessages(Number(req.params.id));
    res.json(messages);
  });

  app.post(api.tickets.messages.send.path, async (req, res) => {
    try {
      const { content } = api.tickets.messages.send.input.parse(req.body);
      const ticketId = Number(req.params.id);
      const ticket = await storage.getTicket(ticketId);
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });

      const message = await storage.createTicketMessage({
        ticketId,
        authorId: "dashboard",
        authorTag: "Dashboard Admin",
        content,
        isFromDashboard: "true",
      });

      await sendTicketMessage(ticket.discordChannelId, content);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Announcements
  app.get(api.announcements.list.path, async (req, res) => {
    const announcements = await storage.getAnnouncements();
    res.json(announcements);
  });

  app.post(api.announcements.create.path, async (req, res) => {
    try {
      const input = api.announcements.create.input.parse(req.body);
      const announcement = await storage.createAnnouncement(input);
      
      // Send to discord
      await sendAnnouncement(announcement.targetChannelId, announcement.content);
      
      res.status(201).json(announcement);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: (err as Error).message || "Internal server error" });
    }
  });

  return httpServer;
}

// Optional seed script
async function seedDatabase() {
  const existingTickets = await storage.getTickets();
  if (existingTickets.length === 0) {
    await storage.createTicket({ discordChannelId: "123", creatorId: "456", topic: "Need help with billing" });
    await storage.createTicket({ discordChannelId: "124", creatorId: "789", topic: "Bug report" });
  }
}
seedDatabase().catch(console.error);
