import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import { Megaphone, Send, History, Hash, MessageSquare, Loader2, Smile } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ALL_EMOJIS = ["📢", "🔥", "✨", "✅", "⚠️", "🚀", "🎉", "🎫", "🛠️", "🚨", "❓", "🐛", "💳", "🚩", "🤝", "💡", "🔔", "🌟", "🌈", "🎈", "🎁", "🏆", "🎮", "💻", "📱", "🔒", "🔑", "💎"];

import { useAnnouncements, useCreateAnnouncement } from "@/hooks/use-announcements";
import { insertAnnouncementSchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Make id and sentAt optional for the form since they are generated
const formSchema = insertAnnouncementSchema;

export default function AnnouncementsPage() {
  const { data: announcements, isLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      targetChannelId: "",
      imageUrl: "",
      linkUrl: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createAnnouncement.mutate(values, {
      onSuccess: () => {
        form.reset();
      }
    });
  }

  const addEmoji = (emoji: string) => {
    const content = form.getValues("content");
    form.setValue("content", content + emoji);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-primary" />
          iRACE Broadcasts
        </h1>
        <p className="text-muted-foreground mt-1">Send official iRACE announcements to Discord channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Composer Form */}
        <div className="lg:col-span-5">
          <Card className="glass-panel border-white/10 sticky top-20 shadow-2xl shadow-primary/5">
            <CardHeader className="bg-primary/5 border-b border-white/5 pb-4">
              <CardTitle className="text-xl font-display flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" /> New Broadcast
              </CardTitle>
              <CardDescription>Compose a message to send immediately to Discord.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <FormField
                    control={form.control}
                    name="targetChannelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Target Channel ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="e.g. 1477278764227494080" 
                              className="pl-9 bg-background/50 border-white/10 focus-visible:ring-primary h-11" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Right-click a channel in Discord and select "Copy Channel ID"
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground flex justify-between items-center">
                          Message Content
                          <div className="flex gap-2 items-center">
                            <div className="flex gap-1">
                              {["📢", "🔥", "✨", "✅", "⚠️"].map(emoji => (
                                <button 
                                  key={emoji}
                                  type="button" 
                                  onClick={() => addEmoji(emoji)}
                                  className="hover:bg-primary/20 p-1 rounded transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                            <Separator orientation="vertical" className="h-4 bg-white/10" />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-primary/20">
                                  <Smile className="h-4 w-4 mr-1" />
                                  More
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 glass-panel border-white/10 p-2">
                                <div className="grid grid-cols-6 gap-1">
                                  {ALL_EMOJIS.map(emoji => (
                                    <button 
                                      key={emoji}
                                      type="button" 
                                      onClick={() => addEmoji(emoji)}
                                      className="hover:bg-primary/20 p-2 rounded transition-colors text-lg"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Type your announcement here... Markdown is supported." 
                            className="min-h-[120px] resize-none bg-background/50 border-white/10 focus-visible:ring-primary text-base p-4" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Image URL</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="https://..." 
                                className="bg-background/50 border-white/10 focus-visible:ring-primary h-10 flex-1" 
                                {...field} 
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // In a real app, this would open a file picker and upload
                                  // For now, we'll prompt for a URL or just leave the input
                                  const url = prompt("Enter image URL:");
                                  if (url) field.onChange(url);
                                }}
                              >
                                Upload
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linkUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Link URL (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://..." 
                              className="bg-background/50 border-white/10 focus-visible:ring-primary h-10" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5 h-12 text-md font-medium"
                    disabled={createAnnouncement.isPending}
                  >
                    {createAnnouncement.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Megaphone className="mr-2 h-5 w-5" />
                        Send Announcement
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <div className="lg:col-span-7">
          <Card className="glass-panel border-white/5 bg-background/30 h-full min-h-[600px]">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-xl font-display flex items-center gap-2 text-foreground">
                <History className="h-5 w-5 opacity-70" /> Broadcast History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl bg-secondary/50" />
                  ))}
                </div>
              ) : !announcements || announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No announcements history</h3>
                  <p className="text-sm text-muted-foreground mt-1">Messages sent will appear here as a log.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {/* Sort by newest first */}
                  {[...announcements].sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime()).map((announcement) => (
                    <div key={announcement.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 bg-secondary/80 px-2.5 py-1 rounded-md border border-white/5">
                          <Hash className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-mono font-medium text-foreground/80">{announcement.targetChannelId}</span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                           {announcement.sentAt ? formatDistanceToNow(new Date(announcement.sentAt), { addSuffix: true }) : 'Unknown time'}
                        </span>
                      </div>
                      <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed border-l-2 border-primary/30 pl-4 py-1">
                        {announcement.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
