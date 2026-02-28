import { Client, GatewayIntentBits, Partials, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, TextChannel, StringSelectMenuBuilder } from 'discord.js';
import { db } from './db';
import { tickets, transcripts, ticketMessages } from '@shared/schema';
import { eq } from 'drizzle-orm';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Provided Token and IDs
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || "";
const GUILD_ID = process.env.GUILD_ID || "1477278729846919231";
const PANEL_CHANNEL_ID = "1477278764227494080";
const TICKET_CATEGORY_ID = "1477281399898767531";
const TRANSCRIPT_CHANNEL_ID = "1477281808792944731";

export function setupBot() {
  client.on(Events.ClientReady, async () => {
    console.log(`Discord bot logged in as ${client.user?.tag}`);
    
    // Auto-spawn or update panel
    const channel = await client.channels.fetch(PANEL_CHANNEL_ID) as TextChannel;
    if (channel) {
      // Clear previous bot messages in panel channel to avoid duplicates
      const messages = await channel.messages.fetch({ limit: 50 });
      const botMessages = messages.filter(m => m.author.id === client.user?.id);
      if (botMessages.size > 0) {
        await channel.bulkDelete(botMessages).catch(() => {});
      }

      const embed = new EmbedBuilder()
        .setTitle('Support System')
        .setDescription('Select the category that matches your request to open a ticket.')
        .setColor(0x00ff00);
        
      const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('open_ticket_menu')
            .setPlaceholder('Select ticket category...')
            .addOptions([
              {
                label: 'Bug Report',
                description: 'Report a technical issue or bug.',
                value: 'bug',
                emoji: '🐛',
              },
              {
                label: 'General Support',
                description: 'Get help with general questions.',
                value: 'support',
                emoji: '❓',
              },
              {
                label: 'Billing',
                description: 'Issues related to payments or subscriptions.',
                value: 'billing',
                emoji: '💳',
              },
            ])
        );
        
      await channel.send({ embeds: [embed], components: [row] });
    }

    // Relink/Sync open tickets from DB
    const openTickets = await db.select().from(tickets).where(eq(tickets.status, 'open'));
    console.log(`Syncing ${openTickets.length} open tickets...`);
    for (const ticket of openTickets) {
      try {
        await client.channels.fetch(ticket.discordChannelId);
      } catch (e) {
        console.log(`Channel for ticket ${ticket.id} no longer exists, marking as closed.`);
        await db.update(tickets).set({ status: 'closed' }).where(eq(tickets.id, ticket.id));
      }
    }
  });

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    
    // Log messages to DB for dashboard
    const [ticket] = await db.select().from(tickets).where(eq(tickets.discordChannelId, message.channelId));
    if (ticket && ticket.status !== 'closed') {
      await db.insert(ticketMessages).values({
        ticketId: ticket.id,
        authorId: message.author.id,
        authorTag: message.author.tag,
        content: message.content,
      });
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'open_ticket_menu') {
      const topic = interaction.values[0];
      const guild = interaction.guild;
      if (!guild) return;
      
      const channel = await guild.channels.create({
        name: `${topic}-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: TICKET_CATEGORY_ID,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: ['ViewChannel'],
          },
          {
            id: interaction.user.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
          {
            id: client.user!.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
        ],
      });
      
      // Save ticket to DB
      await db.insert(tickets).values({
        discordChannelId: channel.id,
        creatorId: interaction.user.id,
        topic: topic,
      });
      
      const embed = new EmbedBuilder()
        .setTitle(`${topic.charAt(0).toUpperCase() + topic.slice(1)} Ticket`)
        .setDescription('Please describe your issue in detail. A staff member will be with you shortly.')
        .setColor(0x0099ff);
        
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('claim_ticket')
            .setLabel('Claim')
            .setStyle(ButtonStyle.Primary)
        );
        
      await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });
      await interaction.reply({ content: `Ticket created: <#${channel.id}>`, ephemeral: true });
    }

    if (!interaction.isButton()) return;
    
    if (interaction.customId === 'close_ticket') {
      const channel = interaction.channel as TextChannel;
      const [ticket] = await db.select().from(tickets).where(eq(tickets.discordChannelId, channel.id));
      
      if (ticket) {
        const messages = await channel.messages.fetch({ limit: 100 });
        const transcriptData = messages.reverse().map(m => ({ author: m.author.tag, content: m.content, time: m.createdAt }));
        
        await db.update(tickets).set({ status: 'closed' }).where(eq(tickets.id, ticket.id));
        await db.insert(transcripts).values({
          ticketId: ticket.id,
          content: JSON.stringify(transcriptData),
        });

        // Send transcript to log channel
        const logChannel = await client.channels.fetch(TRANSCRIPT_CHANNEL_ID) as TextChannel;
        if (logChannel) {
          const transcriptEmbed = new EmbedBuilder()
            .setTitle(`Transcript - Ticket #${ticket.id}`)
            .addFields(
              { name: 'Creator', value: `<@${ticket.creatorId}>`, inline: true },
              { name: 'Topic', value: ticket.topic, inline: true },
              { name: 'Status', value: 'Closed', inline: true }
            )
            .setColor(0xff0000)
            .setTimestamp();
          
          const transcriptText = transcriptData.map(m => `[${m.time}] ${m.author}: ${m.content}`).join('\n');
          const buffer = Buffer.from(transcriptText, 'utf-8');
          
          await logChannel.send({ 
            embeds: [transcriptEmbed], 
            files: [{ attachment: buffer, name: `transcript-${ticket.id}.txt` }] 
          });
        }
      }
      
      await interaction.reply('Closing ticket in 5 seconds...');
      setTimeout(() => channel.delete().catch(() => {}), 5000);
    } else if (interaction.customId === 'claim_ticket') {
      const [ticket] = await db.select().from(tickets).where(eq(tickets.discordChannelId, interaction.channelId));
      if (ticket) {
        await db.update(tickets).set({ claimedBy: interaction.user.id, status: 'claimed' }).where(eq(tickets.id, ticket.id));
        await interaction.reply(`Ticket claimed by <@${interaction.user.id}>`);
      }
    }
  });

  client.login(DISCORD_TOKEN).catch(console.error);
}

export async function sendAnnouncement(channelId: string, content: string) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      await channel.send(content);
    } else {
      throw new Error("Channel not found or not text-based");
    }
  } catch (err) {
    console.error("Failed to send announcement", err);
    throw err;
  }
}

export async function sendTicketMessage(channelId: string, content: string) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      await (channel as TextChannel).send(`**[Dashboard Admin]:** ${content}`);
    }
  } catch (err) {
    console.error("Failed to send ticket message", err);
  }
}
