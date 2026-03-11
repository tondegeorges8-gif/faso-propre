import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, X, MessageCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: 'user', content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur du service');
      }

      if (!resp.body) throw new Error('Pas de réponse');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch { /* partial json */ }
        }
      }
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
      if (!assistantSoFar) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer." }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Card className="shadow-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setIsOpen(true)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles size={24} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold flex items-center gap-1">
                <Bot size={16} />
                Assistant IA Faso Propre
              </h3>
              <p className="text-xs text-muted-foreground">
                Posez vos questions sur l'application, son fonctionnement, ou son créateur
              </p>
            </div>
            <MessageCircle size={20} className="text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles size={18} />
            Assistant IA Faso Propre
          </CardTitle>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8" onClick={() => setIsOpen(false)}>
            <X size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Messages */}
        <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-3">
              <Bot size={40} className="mx-auto text-primary/40" />
              <p className="text-sm text-muted-foreground">
                Bonjour ! 👋 Je suis l'assistant IA de Faso Propre. Comment puis-je vous aider ?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Comment signaler un problème ?",
                  "Qui a créé Faso Propre ?",
                  "Comment fonctionne l'application ?",
                ].map(q => (
                  <Button key={q} variant="outline" size="sm" className="text-xs" onClick={() => { setInput(q); }}>
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted rounded-bl-md'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-3 flex gap-2">
          <Input
            placeholder="Posez votre question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button size="icon" onClick={sendMessage} disabled={!input.trim() || isLoading}>
            <Send size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
