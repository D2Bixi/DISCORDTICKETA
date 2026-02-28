# Discord Bot Hub

A full-stack web dashboard for managing a Discord Ticket Bot. Allows administrators to view, claim, and respond to support tickets created on a Discord server, and send announcements.

## Tech Stack

- **Frontend**: React 18, TanStack Query, Wouter, Shadcn UI, Radix UI, Tailwind CSS
- **Backend**: Express 5, TypeScript, discord.js
- **Database**: PostgreSQL via Drizzle ORM
- **Build**: Vite (frontend), esbuild (server bundle), tsx (dev runner)

## Architecture

This is a monorepo with shared types between client and server:

- `client/` - React frontend (served via Vite in dev, compiled to `dist/public` in prod)
- `server/` - Express backend + Discord bot
- `shared/` - Shared schema (Drizzle + Zod types)
- `script/` - Build scripts

## Running

The app runs as a single unified server on port 5000 (both API and frontend).

**Development**: `npm run dev` (from Discord-Bot-Hub directory)
**Production build**: `npm run build` → `npm start`
**Schema push**: `npm run db:push`

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit DB)
- `DISCORD_TOKEN` - Discord bot token (must be set by user for bot functionality)
- `GUILD_ID` - Discord guild ID (currently hardcoded in bot.ts as default)
- `PORT` - Server port (defaults to 5000)

## Features

- **Ticket Management**: View, claim, and close Discord support tickets from the web dashboard
- **Ticket Replies**: Send messages to ticket channels from the dashboard
- **Transcripts**: Auto-saved when tickets are closed
- **Announcements**: Draft and send Discord announcements with images/links

## Notes

- The Discord bot connects to a hardcoded guild/channel setup in `server/bot.ts`
- Without `DISCORD_TOKEN`, the web dashboard still functions but Discord integration is disabled
- Deployment uses "vm" target (always-on) because the Discord bot needs persistent connection
