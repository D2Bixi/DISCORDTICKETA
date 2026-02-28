# iRACE Announcement & Ticket Bot

A high-performance Discord management system featuring a web-based dashboard and an integrated ticket support bot.

## Features
- **iRACE Ticket System**: Automated ticket creation with categories (General, Bug, Billing, Report).
- **Advanced Announcements**: Send rich embeds with images, links, and custom emojis.
- **Real-time Dashboard**: Monitor and respond to tickets directly from your browser.
- **Transcript Logging**: Automatically save and log ticket conversations.

## How to Host

### 1. Local Hosting (Development)
1. **Prerequisites**: Install Node.js (v18+) and PostgreSQL.
2. **Setup Database**: Create a database named `irace_bot`.
3. **Environment Variables**: Create a `.env` file in the root:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/irace_bot
   DISCORD_TOKEN=your_bot_token
   GUILD_ID=your_guild_id
   ```
4. **Install Dependencies**:
   ```bash
   cd Discord-Bot-Hub
   npm install
   ```
5. **Push Schema**:
   ```bash
   npm run db:push
   ```
6. **Start App**:
   ```bash
   npm run dev
   ```
   Access the dashboard at `http://localhost:5000`.

### 2. Hosting on Replit (Production)
1. **Import**: Clone/Import the repository to Replit.
2. **Secrets**: Add `DISCORD_TOKEN` and `GUILD_ID` to Replit Secrets.
3. **Database**: Replit's PostgreSQL integration is automatically detected.
4. **Deploy**:
   - The project is pre-configured for **VM Deployment** (Always-on).
   - Click "Deploy" and ensure the run command is `npm start`.

## Advanced Features Added
- **Dynamic Emoji Picker**: 30+ emojis available for announcements.
- **Image Upload Interface**: Included in the broadcast composer for visual announcements.
- **iRACE Branding**: Custom embed styling and dashboard UI.
- **Auto-Sync**: The bot automatically cleans up stale channels and syncs status every 5 minutes.
- **Anonymous Support**: Dashboard replies use rotating staff pseudonyms for privacy.
