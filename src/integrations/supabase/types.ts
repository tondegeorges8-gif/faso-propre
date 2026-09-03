export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_subscriptions: {
        Row: {
          amount: number
          article_id: string | null
          boutique_id: string | null
          commission_amount: number
          commission_rate: number
          created_at: string
          days: number
          expires_at: string | null
          id: string
          months: number
          operator: string
          otp_code: string | null
          otp_verified: boolean
          phone: string
          starts_at: string | null
          status: string
          target_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          article_id?: string | null
          boutique_id?: string | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          days?: number
          expires_at?: string | null
          id?: string
          months?: number
          operator: string
          otp_code?: string | null
          otp_verified?: boolean
          phone: string
          starts_at?: string | null
          status?: string
          target_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          article_id?: string | null
          boutique_id?: string | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          days?: number
          expires_at?: string | null
          id?: string
          months?: number
          operator?: string
          otp_code?: string | null
          otp_verified?: boolean
          phone?: string
          starts_at?: string | null
          status?: string
          target_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_subscriptions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_subscriptions_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      annonces_institutionnelles: {
        Row: {
          author_id: string | null
          contenu: string
          created_at: string
          event_date: string | null
          id: string
          image_url: string | null
          institution: string
          is_published: boolean
          titre: string
          updated_at: string
          ville: string | null
        }
        Insert: {
          author_id?: string | null
          contenu: string
          created_at?: string
          event_date?: string | null
          id?: string
          image_url?: string | null
          institution: string
          is_published?: boolean
          titre: string
          updated_at?: string
          ville?: string | null
        }
        Update: {
          author_id?: string | null
          contenu?: string
          created_at?: string
          event_date?: string | null
          id?: string
          image_url?: string | null
          institution?: string
          is_published?: boolean
          titre?: string
          updated_at?: string
          ville?: string | null
        }
        Relationships: []
      }
      annonces_occasion: {
        Row: {
          boosted_until: string | null
          categorie: string
          clicks_count: number
          contact_telephone: string | null
          created_at: string
          description: string | null
          etat: string
          id: string
          is_active: boolean
          photo_url: string | null
          prix: number | null
          quartier: string | null
          region: string | null
          titre: string
          troc_contre: string | null
          type_annonce: string
          updated_at: string
          user_id: string
          views_count: number
          ville: string
          visibility: string
        }
        Insert: {
          boosted_until?: string | null
          categorie: string
          clicks_count?: number
          contact_telephone?: string | null
          created_at?: string
          description?: string | null
          etat?: string
          id?: string
          is_active?: boolean
          photo_url?: string | null
          prix?: number | null
          quartier?: string | null
          region?: string | null
          titre: string
          troc_contre?: string | null
          type_annonce?: string
          updated_at?: string
          user_id: string
          views_count?: number
          ville: string
          visibility?: string
        }
        Update: {
          boosted_until?: string | null
          categorie?: string
          clicks_count?: number
          contact_telephone?: string | null
          created_at?: string
          description?: string | null
          etat?: string
          id?: string
          is_active?: boolean
          photo_url?: string | null
          prix?: number | null
          quartier?: string | null
          region?: string | null
          titre?: string
          troc_contre?: string | null
          type_annonce?: string
          updated_at?: string
          user_id?: string
          views_count?: number
          ville?: string
          visibility?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          boosted_until: string | null
          boutique_id: string
          categorie: string
          clicks_count: number
          created_at: string
          description: string | null
          etat: string
          id: string
          is_available: boolean
          nom: string
          owner_user_id: string
          photo_url: string | null
          photos: string[]
          prix: number
          region: string | null
          troc_contre: string | null
          type_annonce: string
          updated_at: string
          variants: Json
          views_count: number
          visibility: string
        }
        Insert: {
          boosted_until?: string | null
          boutique_id: string
          categorie: string
          clicks_count?: number
          created_at?: string
          description?: string | null
          etat?: string
          id?: string
          is_available?: boolean
          nom: string
          owner_user_id: string
          photo_url?: string | null
          photos?: string[]
          prix?: number
          region?: string | null
          troc_contre?: string | null
          type_annonce?: string
          updated_at?: string
          variants?: Json
          views_count?: number
          visibility?: string
        }
        Update: {
          boosted_until?: string | null
          boutique_id?: string
          categorie?: string
          clicks_count?: number
          created_at?: string
          description?: string | null
          etat?: string
          id?: string
          is_available?: boolean
          nom?: string
          owner_user_id?: string
          photo_url?: string | null
          photos?: string[]
          prix?: number
          region?: string | null
          troc_contre?: string | null
          type_annonce?: string
          updated_at?: string
          variants?: Json
          views_count?: number
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      avis: {
        Row: {
          commentaire: string | null
          created_at: string
          id: string
          note: number
          target_id: string
          target_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          commentaire?: string | null
          created_at?: string
          id?: string
          note: number
          target_id: string
          target_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          commentaire?: string | null
          created_at?: string
          id?: string
          note?: number
          target_id?: string
          target_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      boutiques: {
        Row: {
          adresse: string | null
          categorie: string
          cnib_recto_url: string | null
          cnib_verso_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_partner: boolean
          is_verified: boolean
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          nom: string
          owner_date_naissance: string | null
          owner_nom: string | null
          owner_prenoms: string | null
          owner_user_id: string | null
          produits: string | null
          quartier: string | null
          region: string | null
          registre_commerce_url: string | null
          subscription_expires_at: string | null
          subscription_status: string
          telephone: string | null
          updated_at: string
          ville: string
          visits_count: number
          whatsapp: string | null
        }
        Insert: {
          adresse?: string | null
          categorie: string
          cnib_recto_url?: string | null
          cnib_verso_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_partner?: boolean
          is_verified?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          nom: string
          owner_date_naissance?: string | null
          owner_nom?: string | null
          owner_prenoms?: string | null
          owner_user_id?: string | null
          produits?: string | null
          quartier?: string | null
          region?: string | null
          registre_commerce_url?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string
          telephone?: string | null
          updated_at?: string
          ville: string
          visits_count?: number
          whatsapp?: string | null
        }
        Update: {
          adresse?: string | null
          categorie?: string
          cnib_recto_url?: string | null
          cnib_verso_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_partner?: boolean
          is_verified?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          nom?: string
          owner_date_naissance?: string | null
          owner_nom?: string | null
          owner_prenoms?: string | null
          owner_user_id?: string | null
          produits?: string | null
          quartier?: string | null
          region?: string | null
          registre_commerce_url?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string
          telephone?: string | null
          updated_at?: string
          ville?: string
          visits_count?: number
          whatsapp?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          article_id: string
          created_at: string
          id: string
          quantity: number
          updated_at: string
          user_id: string
          variant_label: string | null
          variant_prix: number | null
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          user_id: string
          variant_label?: string | null
          variant_prix?: number | null
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
          variant_label?: string | null
          variant_prix?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          buyer_id: string
          context_id: string | null
          context_type: string | null
          created_at: string
          id: string
          last_message_at: string
          seller_id: string
          subject: string | null
        }
        Insert: {
          buyer_id: string
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          seller_id: string
          subject?: string | null
        }
        Update: {
          buyer_id?: string
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          seller_id?: string
          subject?: string | null
        }
        Relationships: []
      }
      founder_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          related_user_id: string | null
          transaction_type: string
          withdrawal_network: string | null
          withdrawal_phone: string | null
          withdrawal_status: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          related_user_id?: string | null
          transaction_type: string
          withdrawal_network?: string | null
          withdrawal_phone?: string | null
          withdrawal_status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          related_user_id?: string | null
          transaction_type?: string
          withdrawal_network?: string | null
          withdrawal_phone?: string | null
          withdrawal_status?: string | null
        }
        Relationships: []
      }
      loyalty_rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          points_cost: number
          redemptions_count: number | null
          sponsor_id: string | null
          stock_quantity: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          points_cost: number
          redemptions_count?: number | null
          sponsor_id?: string | null
          stock_quantity?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          points_cost?: number
          redemptions_count?: number | null
          sponsor_id?: string | null
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          points: number
          related_signalement_id: string | null
          related_sponsor_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          points: number
          related_signalement_id?: string | null
          related_sponsor_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          related_signalement_id?: string | null
          related_sponsor_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_related_signalement_id_fkey"
            columns: ["related_signalement_id"]
            isOneToOne: false
            referencedRelation: "signalements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_related_sponsor_id_fkey"
            columns: ["related_sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          article_id: string | null
          created_at: string
          id: string
          nom: string
          order_id: string
          prix: number
          quantity: number
          variant_label: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          id?: string
          nom: string
          order_id: string
          prix?: number
          quantity?: number
          variant_label?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          id?: string
          nom?: string
          order_id?: string
          prix?: number
          quantity?: number
          variant_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          boutique_id: string | null
          buyer_id: string
          buyer_phone: string | null
          created_at: string
          delivery_address: string | null
          delivery_fee: number
          delivery_latitude: number | null
          delivery_longitude: number | null
          delivery_notes: string | null
          id: string
          mode_reception: string
          note: string | null
          payment_operator: string | null
          payment_phone: string | null
          payment_status: string
          seller_user_id: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          boutique_id?: string | null
          buyer_id: string
          buyer_phone?: string | null
          created_at?: string
          delivery_address?: string | null
          delivery_fee?: number
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_notes?: string | null
          id?: string
          mode_reception?: string
          note?: string | null
          payment_operator?: string | null
          payment_phone?: string | null
          payment_status?: string
          seller_user_id: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          boutique_id?: string | null
          buyer_id?: string
          buyer_phone?: string | null
          created_at?: string
          delivery_address?: string | null
          delivery_fee?: number
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_notes?: string | null
          id?: string
          mode_reception?: string
          note?: string | null
          payment_operator?: string | null
          payment_phone?: string | null
          payment_status?: string
          seller_user_id?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      prestataire_applications: {
        Row: {
          amount: number
          cnib_url: string | null
          created_at: string
          diplome_url: string | null
          email: string
          id: string
          metier: string | null
          nom: string
          payment_operator: string | null
          payment_reference: string | null
          photo_visage_url: string | null
          prenom: string
          status: string
          subscription_type: string
          telephone: string
          updated_at: string
          user_id: string
          ville: string
        }
        Insert: {
          amount?: number
          cnib_url?: string | null
          created_at?: string
          diplome_url?: string | null
          email: string
          id?: string
          metier?: string | null
          nom: string
          payment_operator?: string | null
          payment_reference?: string | null
          photo_visage_url?: string | null
          prenom: string
          status?: string
          subscription_type: string
          telephone: string
          updated_at?: string
          user_id: string
          ville: string
        }
        Update: {
          amount?: number
          cnib_url?: string | null
          created_at?: string
          diplome_url?: string | null
          email?: string
          id?: string
          metier?: string | null
          nom?: string
          payment_operator?: string | null
          payment_reference?: string | null
          photo_visage_url?: string | null
          prenom?: string
          status?: string
          subscription_type?: string
          telephone?: string
          updated_at?: string
          user_id?: string
          ville?: string
        }
        Relationships: []
      }
      prestataires: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_available: boolean
          is_verified: boolean
          latitude: number | null
          longitude: number | null
          metier: string
          nom: string
          photo_url: string | null
          prenoms: string
          quartier: string | null
          rating: number | null
          specialite: string | null
          telephone: string
          updated_at: string
          ville: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_available?: boolean
          is_verified?: boolean
          latitude?: number | null
          longitude?: number | null
          metier: string
          nom: string
          photo_url?: string | null
          prenoms: string
          quartier?: string | null
          rating?: number | null
          specialite?: string | null
          telephone: string
          updated_at?: string
          ville: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_available?: boolean
          is_verified?: boolean
          latitude?: number | null
          longitude?: number | null
          metier?: string
          nom?: string
          photo_url?: string | null
          prenoms?: string
          quartier?: string | null
          rating?: number | null
          specialite?: string | null
          telephone?: string
          updated_at?: string
          ville?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_naissance: string | null
          email: string
          id: string
          nom: string
          prenoms: string
          telephone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_naissance?: string | null
          email: string
          id?: string
          nom: string
          prenoms: string
          telephone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_naissance?: string | null
          email?: string
          id?: string
          nom?: string
          prenoms?: string
          telephone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promos_flash: {
        Row: {
          boutique_id: string | null
          created_at: string
          description: string | null
          ends_at: string
          id: string
          image_url: string | null
          is_active: boolean
          owner_user_id: string
          prix_promo: number | null
          reduction_pct: number | null
          starts_at: string
          titre: string
          updated_at: string
        }
        Insert: {
          boutique_id?: string | null
          created_at?: string
          description?: string | null
          ends_at: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          owner_user_id: string
          prix_promo?: number | null
          reduction_pct?: number | null
          starts_at?: string
          titre: string
          updated_at?: string
        }
        Update: {
          boutique_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          owner_user_id?: string
          prix_promo?: number | null
          reduction_pct?: number | null
          starts_at?: string
          titre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promos_flash_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_events: {
        Row: {
          action: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      signalement_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          old_status: string | null
          signalement_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          old_status?: string | null
          signalement_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          old_status?: string | null
          signalement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signalement_status_history_signalement_id_fkey"
            columns: ["signalement_id"]
            isOneToOne: false
            referencedRelation: "signalements"
            referencedColumns: ["id"]
          },
        ]
      }
      signalements: {
        Row: {
          arrondissement: string | null
          audio_url: string | null
          category: string
          commission_montant: number | null
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          montant_total: number | null
          nom_complet: string
          photo_url: string | null
          quartier: string | null
          secteur: string | null
          sous_quartier: string | null
          status: string
          statut_paiement: string
          subcategory: string
          updated_at: string
          user_id: string
          ville: string
        }
        Insert: {
          arrondissement?: string | null
          audio_url?: string | null
          category: string
          commission_montant?: number | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          montant_total?: number | null
          nom_complet: string
          photo_url?: string | null
          quartier?: string | null
          secteur?: string | null
          sous_quartier?: string | null
          status?: string
          statut_paiement?: string
          subcategory: string
          updated_at?: string
          user_id: string
          ville: string
        }
        Update: {
          arrondissement?: string | null
          audio_url?: string | null
          category?: string
          commission_montant?: number | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          montant_total?: number | null
          nom_complet?: string
          photo_url?: string | null
          quartier?: string | null
          secteur?: string | null
          sous_quartier?: string | null
          status?: string
          statut_paiement?: string
          subcategory?: string
          updated_at?: string
          user_id?: string
          ville?: string
        }
        Relationships: []
      }
      sponsor_ads: {
        Row: {
          action_label: string | null
          action_url: string | null
          banner_image_url: string | null
          clicks_count: number | null
          created_at: string
          description: string | null
          display_type: string | null
          end_date: string | null
          id: string
          impressions_count: number | null
          is_active: boolean | null
          priority: number | null
          sponsor_id: string
          start_date: string | null
          target_institutions: string[] | null
          title: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          banner_image_url?: string | null
          clicks_count?: number | null
          created_at?: string
          description?: string | null
          display_type?: string | null
          end_date?: string | null
          id?: string
          impressions_count?: number | null
          is_active?: boolean | null
          priority?: number | null
          sponsor_id: string
          start_date?: string | null
          target_institutions?: string[] | null
          title: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          banner_image_url?: string | null
          clicks_count?: number | null
          created_at?: string
          description?: string | null
          display_type?: string | null
          end_date?: string | null
          id?: string
          impressions_count?: number | null
          is_active?: boolean | null
          priority?: number | null
          sponsor_id?: string
          start_date?: string | null
          target_institutions?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_ads_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          advantage: string | null
          category: string
          code: string
          contact_email: string | null
          contract_end: string | null
          contract_start: string | null
          created_at: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          monthly_fee: number | null
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          advantage?: string | null
          category: string
          code: string
          contact_email?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          monthly_fee?: number | null
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          advantage?: string | null
          category?: string
          code?: string
          contact_email?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          monthly_fee?: number | null
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address: string
          created_at: string
          id: string
          label: string
          latitude: number | null
          longitude: number | null
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          label: string
          latitude?: number | null
          longitude?: number | null
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          label?: string
          latitude?: number | null
          longitude?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_loyalty_points: {
        Row: {
          created_at: string
          id: string
          lifetime_earned: number
          lifetime_spent: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_spent?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_spent?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          institution: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          institution?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          institution?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      founder_balance: {
        Row: {
          current_balance: number | null
          total_commissions: number | null
          total_inscription_gains: number | null
          total_inscriptions: number | null
          total_withdrawn: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: { _action: string; _max_events: number; _window_seconds: number }
        Returns: boolean
      }
      get_citizen_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          pseudo: string
          rang: number
          resolus: number
          total: number
        }[]
      }
      get_marketplace_annonces: {
        Args: { _limited_sample?: number }
        Returns: {
          boosted_until: string | null
          categorie: string
          clicks_count: number
          contact_telephone: string | null
          created_at: string
          description: string | null
          etat: string
          id: string
          is_active: boolean
          photo_url: string | null
          prix: number | null
          quartier: string | null
          region: string | null
          titre: string
          troc_contre: string | null
          type_annonce: string
          updated_at: string
          user_id: string
          views_count: number
          ville: string
          visibility: string
        }[]
        SetofOptions: {
          from: "*"
          to: "annonces_occasion"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_marketplace_articles: {
        Args: { _limited_sample?: number }
        Returns: {
          boosted_until: string | null
          boutique_id: string
          categorie: string
          clicks_count: number
          created_at: string
          description: string | null
          etat: string
          id: string
          is_available: boolean
          nom: string
          owner_user_id: string
          photo_url: string | null
          photos: string[]
          prix: number
          region: string | null
          troc_contre: string | null
          type_annonce: string
          updated_at: string
          variants: Json
          views_count: number
          visibility: string
        }[]
        SetofOptions: {
          from: "*"
          to: "articles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_public_cleanliness_stats: {
        Args: never
        Returns: {
          pending: number
          resolved: number
          total: number
          ville: string
        }[]
      }
      get_public_signalement_pins: {
        Args: never
        Returns: {
          category: string
          created_at: string
          id: string
          latitude: number
          longitude: number
          status: string
          ville: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_founder: { Args: never; Returns: boolean }
      track_article_click: { Args: { _article_id: string }; Returns: undefined }
      track_article_view: { Args: { _article_id: string }; Returns: undefined }
      track_boutique_visit: {
        Args: { _boutique_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "collector" | "admin" | "founder" | "prestataire"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "collector", "admin", "founder", "prestataire"],
    },
  },
} as const
