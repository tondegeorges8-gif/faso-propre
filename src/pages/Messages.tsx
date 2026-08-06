import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Send, MessagesSquare } from 'lucide-react';
import { checkRateLimit, sanitizeText, validateText } from '@/lib/antiSpam';

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  subject: string | null;
  last_message_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

const Messages: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !user) navigate('/auth');
  }, [user, isLoading, navigate]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('id, buyer_id, seller_id, subject, last_message_at')
      .order('last_message_at', { ascending: false });
    setConversations((data || []) as Conversation[]);
    return (data || []) as Conversation[];
  };

  // Ouverture / création d'une conversation depuis un article ou une annonce
  useEffect(() => {
    if (!user) return;
    const seller = params.get('seller');
    const contextType = params.get('type');
    const contextId = params.get('id');
    const subject = params.get('subject');

    const init = async () => {
      const list = await loadConversations();
      if (!seller || seller === user.id) return;
      const existing = list.find((c) => c.seller_id === seller && c.buyer_id === user.id);
      if (existing) {
        setActiveId(existing.id);
        return;
      }
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          buyer_id: user.id,
          seller_id: seller,
          subject: subject ? sanitizeText(subject).slice(0, 120) : null,
          context_type: contextType,
          context_id: contextId,
        })
        .select('id, buyer_id, seller_id, subject, last_message_at')
        .single();
      if (!error && data) {
        setConversations((prev) => [data as Conversation, ...prev]);
        setActiveId(data.id);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Messages + realtime
  useEffect(() => {
    if (!activeId) return;
    const load = async () => {
      const { data } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, content, created_at')
        .eq('conversation_id', activeId)
        .order('created_at');
      setMessages((data || []) as Message[]);
    };
    load();

    const channel = supabase
      .channel(`chat-${activeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message]),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!user || !activeId) return;
    const err = validateText(draft, { min: 1, max: 2000, label: 'Le message' });
    if (err) {
      toast({ title: 'Message invalide', description: err, variant: 'destructive' });
      return;
    }
    const allowed = await checkRateLimit('message', 20, 60);
    if (!allowed) {
      toast({ title: 'Doucement !', description: 'Trop de messages envoyés. Patientez une minute.', variant: 'destructive' });
      return;
    }
    const content = sanitizeText(draft);
    setDraft('');
    const { error } = await supabase.from('messages').insert({ conversation_id: activeId, sender_id: user.id, content });
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', activeId);
  };

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          {activeId ? (
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setActiveId(null)}>
              <ArrowLeft size={20} />
            </Button>
          ) : null}
          <div>
            <h1 className="text-xl font-bold">Messagerie</h1>
            <p className="text-xs opacity-90">Échangez avec les vendeurs et artisans</p>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-4">
        {!activeId ? (
          conversations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 flex flex-col items-center text-center gap-3">
                <MessagesSquare className="text-muted-foreground" size={30} />
                <p className="text-muted-foreground max-w-xs">
                  Aucune conversation. Contactez un vendeur depuis une fiche produit ou une annonce.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {conversations.map((c) => (
                <button key={c.id} onClick={() => setActiveId(c.id)} className="w-full text-left">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <p className="font-medium truncate">{c.subject || 'Conversation'}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.buyer_id === user?.id ? 'Vous êtes acheteur' : 'Vous êtes vendeur'} ·{' '}
                        {new Date(c.last_message_at).toLocaleDateString('fr-FR')}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col h-[calc(100vh-13rem)]">
            <div className="flex-1 overflow-y-auto space-y-2 pb-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    m.sender_id === user?.id ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Input
                value={draft}
                maxLength={2000}
                placeholder="Votre message…"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
              />
              <Button onClick={send} size="icon" aria-label="Envoyer">
                <Send size={18} />
              </Button>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Messages;
