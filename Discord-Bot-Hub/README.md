# Discord Ticket Bot & Dashboard Deployment Guide

This guide explains how to host this application on a Linux (Ubuntu) VPS.

## Prerequisites
- A Linux VPS (Ubuntu 20.04/22.04 recommended)
- Node.js (v18 or higher)
- PostgreSQL Database
- Discord Bot Token and Guild ID

## Step 1: Install Dependencies
Connect to your VPS via SSH and run:
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -B bash -
sudo apt install -y nodejs postgresql postgresql-contrib git
```

## Step 2: Set up Database
```bash
sudo -u postgres psql
CREATE DATABASE ticketbot;
CREATE USER botuser WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ticketbot TO botuser;
\q
```

## Step 3: Clone and Install
```bash
git clone <your-repo-url>
cd discord-ticket-bot
npm install
```

## Step 4: Configure Environment
Create a `.env` file:
```env
DATABASE_URL=postgresql://botuser:your_secure_password@localhost:5432/ticketbot
DISCORD_TOKEN=your_bot_token
GUILD_ID=your_guild_id
PORT=5000
```

## Step 5: Initialize Database
```bash
npm run db:push
```

## Step 6: Build and Run
We recommend using `pm2` to keep the bot running 24/7.
```bash
sudo npm install -g pm2
npm run build
pm2 start dist/server/index.js --name "ticket-bot"
pm2 save
pm2 startup
```

## Features Configured
- **Panel Channel**: `1477278764227494080` (Auto-spawns ticket menu)
- **Ticket Category**: `1477281399898767531` (Where open tickets appear)
- **Transcript Logs**: `1477281808792944731` (Where closed ticket logs are sent)
- **Auto-Sync**: Bot automatically checks and cleans up ticket status on startup.
