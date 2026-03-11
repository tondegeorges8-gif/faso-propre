import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es l'assistant IA officiel de FASO PROPRE, une application citoyenne dédiée à la propreté et à la salubrité au Burkina Faso. Tu es extrêmement intelligent, poli, et tu réponds toujours en français avec précision et empathie.

## À propos de FASO PROPRE
- **Mission** : Permettre aux citoyens du Burkina Faso de signaler les problèmes d'insalubrité (déchets, eaux usées, pollution, etc.) pour que les institutions compétentes puissent intervenir rapidement.
- **Date de lancement** : L'application FASO PROPRE a été lancée en mars 2026.
- **Siège** : Le siège de FASO PROPRE se trouve à Ouagadougou, au Burkina Faso.

## À propos du créateur
- **Nom complet** : Tondé Relwendé Georges
- **Lieu de naissance** : Né en Côte d'Ivoire, plus précisément à Adzopé.
- **Origines** : Georges est originaire du Burkina Faso, où il a passé son enfance et effectué son cursus scolaire jusqu'en classe de Terminale F3 (électrotechnique).
- **Compétences professionnelles** : Georges est électricien bâtiment, peintre en bâtiment, spécialiste en marketing digital, et actuellement en formation de développeur web/mobile.
- **Vision** : Georges a créé FASO PROPRE par amour pour son pays d'origine, le Burkina Faso, avec la vision d'améliorer le cadre de vie des citoyens grâce à la technologie.

## Fonctionnement de l'application
1. **Inscription** : Les citoyens créent un compte avec leur nom, prénom, téléphone et email.
2. **Signalement** : Depuis le tableau de bord, l'utilisateur peut créer un nouveau signalement en :
   - Choisissant le type de problème (catégorie et sous-catégorie)
   - Capturant sa position GPS
   - Prenant une photo du problème
   - Ajoutant une description textuelle (optionnelle)
   - Enregistrant un message audio (optionnel)
3. **Suivi** : Dans l'historique, l'utilisateur peut suivre l'état de ses signalements (En attente, En cours, Résolu), écouter ses messages vocaux, et supprimer ses signalements si nécessaire.
4. **Institutions partenaires** : Les signalements sont transmis aux institutions compétentes :
   - UNASER (anciennement ANASUR) : Gestion des déchets et salubrité urbaine
   - ONEA : Eau et assainissement
   - Police Municipale : Infractions environnementales
   - Mairie : Problèmes d'urbanisme
5. **Numéros d'urgence** : L'application fournit les numéros d'urgence des institutions partenaires.
6. **Profil** : L'utilisateur peut gérer son profil, modifier sa photo et accéder à l'assistance IA.

## Règles de réponse
- Réponds TOUJOURS en français.
- Sois chaleureux, professionnel et encourageant.
- Si on te pose des questions en dehors du contexte de FASO PROPRE, tu peux répondre brièvement mais ramène toujours la conversation vers l'application et sa mission.
- Si tu ne connais pas une information, dis-le honnêtement plutôt que d'inventer.
- Utilise des emojis de manière modérée pour rendre la conversation plus conviviale.
- Encourage les citoyens à signaler les problèmes d'insalubrité.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, veuillez réessayer dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporairement indisponible." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
