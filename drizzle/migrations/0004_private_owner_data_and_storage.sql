DO $migration$
DECLARE r record; predicate text; commands text; command text;
BEGIN
  FOR r IN SELECT schemaname,tablename,policyname FROM pg_policies WHERE schemaname='public' OR (schemaname='storage' AND tablename='objects') LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I',r.policyname,r.schemaname,r.tablename);
  END LOOP;
  FOR r IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p') LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',r.relname);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated',r.relname);
    EXECUTE format('GRANT ALL ON public.%I TO service_role',r.relname);
  END LOOP;
  FOR r IN SELECT * FROM (VALUES
    ('profiles','user_id = auth.uid()','SELECT,INSERT,UPDATE'),
    ('user_roles','user_id = auth.uid()','SELECT'),
    ('signalements','user_id = auth.uid()','SELECT,INSERT,UPDATE,DELETE'),
    ('articles','owner_user_id = auth.uid()','SELECT,INSERT,UPDATE,DELETE'),
    ('boutiques','owner_user_id = auth.uid()','SELECT,INSERT,UPDATE,DELETE'),
    ('annonces_occasion','user_id = auth.uid()','SELECT,INSERT,UPDATE,DELETE'),
    ('annonces_institutionnelles','author_id = auth.uid()','SELECT,INSERT,UPDATE,DELETE'),
    ('promos_flash','owner_user_id = auth.uid()','SELECT,INSERT,UPDATE,DELETE'),
    ('avis','user_id = auth.uid()','SELECT,INSERT,UPDATE,DELETE'),
    ('cart_items','user_id = auth.uid()','SELECT,INSERT,UPDATE,DELETE'),
    ('user_addresses','user_id = auth.uid()','SELECT,INSERT,UPDATE,DELETE'),
    ('ad_subscriptions','user_id = auth.uid()','SELECT,INSERT,UPDATE'),
    ('prestataire_applications','user_id = auth.uid()','SELECT,INSERT'),
    ('loyalty_transactions','user_id = auth.uid()','SELECT'),
    ('user_loyalty_points','user_id = auth.uid()','SELECT'),
    ('rate_limit_events','user_id = auth.uid()','SELECT'),
    ('signalement_followers','user_id = auth.uid()','SELECT'),
    ('signalement_status_history','EXISTS (SELECT 1 FROM public.signalements s WHERE s.id = signalement_id AND s.user_id = auth.uid())','SELECT'),
    ('conversations','buyer_id = auth.uid() OR seller_id = auth.uid()','SELECT,UPDATE'),
    ('orders','buyer_id = auth.uid() OR seller_user_id = auth.uid()','SELECT,UPDATE'),
    ('order_items','EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.buyer_id = auth.uid() OR o.seller_user_id = auth.uid()))','SELECT'),
    ('messages','EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid()))','SELECT,UPDATE'),
    ('founder_transactions','public.is_app_admin()','SELECT,INSERT,UPDATE'),
    ('prestataires','public.is_app_admin()','SELECT,INSERT,UPDATE,DELETE'),
    ('sponsors','public.is_app_admin()','SELECT,INSERT,UPDATE,DELETE'),
    ('sponsor_ads','public.is_app_admin()','SELECT,INSERT,UPDATE,DELETE'),
    ('loyalty_rewards','public.is_app_admin()','SELECT,INSERT,UPDATE,DELETE')
  ) AS specs(table_name,owner_expression,allowed_commands) LOOP
    predicate := '(auth.uid() IS NOT NULL) AND (' || r.owner_expression || ')';
    FOREACH command IN ARRAY string_to_array(r.allowed_commands,',') LOOP
      EXECUTE format('GRANT %s ON public.%I TO authenticated',command,r.table_name);
      IF command='INSERT' THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (%s)','private_insert',r.table_name,predicate);
      ELSIF command='UPDATE' THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)','private_update',r.table_name,predicate,predicate);
      ELSE
        EXECUTE format('CREATE POLICY %I ON public.%I FOR %s TO authenticated USING (%s)','private_' || lower(command),r.table_name,command,predicate);
      END IF;
    END LOOP;
  END LOOP;
END $migration$;
GRANT INSERT ON public.user_roles TO authenticated;
CREATE POLICY private_default_role ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid() AND role = 'user'::public.app_role AND institution IS NULL);
GRANT INSERT ON public.conversations, public.orders, public.messages, public.order_items TO authenticated;
CREATE POLICY private_buyer_insert ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL AND buyer_id = auth.uid());
CREATE POLICY private_buyer_insert ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL AND buyer_id = auth.uid());
CREATE POLICY private_sender_insert ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL AND sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())));
CREATE POLICY private_buyer_insert ON public.order_items FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid()));
GRANT DELETE ON public.orders TO authenticated;
CREATE POLICY private_buyer_cancel ON public.orders FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL AND buyer_id = auth.uid() AND status IN ('en_attente','annulee'));
REVOKE ALL ON public.founder_balance FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.founder_balance TO authenticated;
GRANT ALL ON public.founder_balance TO service_role;

CREATE POLICY private_file_select ON storage.objects FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL AND bucket_id IN ('avatars','signalements-photos','signalements-audio','prestataire-docs','marketplace-photos') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY private_file_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL AND bucket_id IN ('avatars','signalements-photos','signalements-audio','prestataire-docs','marketplace-photos') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY private_file_update ON storage.objects FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL AND bucket_id IN ('avatars','signalements-photos','signalements-audio','prestataire-docs','marketplace-photos') AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (auth.uid() IS NOT NULL AND bucket_id IN ('avatars','signalements-photos','signalements-audio','prestataire-docs','marketplace-photos') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY private_file_delete ON storage.objects FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL AND bucket_id IN ('avatars','signalements-photos','signalements-audio','prestataire-docs','marketplace-photos') AND (storage.foldername(name))[1] = auth.uid()::text);

DO $functions$
DECLARE r record;
BEGIN
  FOR r IN SELECT p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated',r.signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role',r.signature);
  END LOOP;
END $functions$;
ALTER FUNCTION public.get_marketplace_articles(integer) SECURITY INVOKER;
ALTER FUNCTION public.get_marketplace_annonces(integer) SECURITY INVOKER;
ALTER FUNCTION public.get_public_signalement_pins() SECURITY INVOKER;
ALTER FUNCTION public.get_public_cleanliness_stats() SECURITY INVOKER;
ALTER FUNCTION public.get_citizen_leaderboard(integer) SECURITY INVOKER;
ALTER FUNCTION public.track_article_view(uuid) SECURITY INVOKER;
ALTER FUNCTION public.track_article_click(uuid) SECURITY INVOKER;
ALTER FUNCTION public.track_boutique_visit(uuid) SECURITY INVOKER;
GRANT EXECUTE ON FUNCTION public.get_marketplace_articles(integer),public.get_marketplace_annonces(integer),public.get_public_signalement_pins(),public.get_public_cleanliness_stats(),public.get_citizen_leaderboard(integer),public.track_article_view(uuid),public.track_article_click(uuid),public.track_boutique_visit(uuid),public.is_app_admin(),public.is_admin_entry_account(),public.is_founder(),public.has_role(uuid,public.app_role),public.get_admin_registrations(text,text,integer),public.check_rate_limit(text,integer,integer),public.submit_signalement(text,text,text,text,text[],text,numeric,numeric,numeric,text,text,text,timestamptz) TO authenticated;

DO $report$
DECLARE definition text;
BEGIN
  SELECT pg_get_functiondef('public.submit_signalement(text,text,text,text,text[],text,numeric,numeric,numeric,text,text,text,timestamptz)'::regprocedure) INTO definition;
  IF strpos(definition,'WHERE s.category = _category AND s.parent_id IS NULL') = 0 THEN
    RAISE EXCEPTION 'Report function changed: ownership patch must be reviewed';
  END IF;
  definition := replace(definition,'WHERE s.category = _category AND s.parent_id IS NULL','WHERE s.user_id = uid AND s.category = _category AND s.parent_id IS NULL');
  definition := replace(definition,'IF uid IS NULL THEN RAISE EXCEPTION ''Non authentifié''; END IF;',
    'IF uid IS NULL THEN RAISE EXCEPTION ''Non authentifié''; END IF;
    IF EXISTS (SELECT 1 FROM unnest(_photos) AS paths(path) WHERE path IS NULL OR split_part(path,''/'',1) <> uid::text) OR (_audio_url IS NOT NULL AND split_part(_audio_url,''/'',1) <> uid::text) THEN
      RAISE EXCEPTION ''Vous ne pouvez joindre que vos propres fichiers'' USING ERRCODE = ''42501'';
    END IF;');
  EXECUTE definition;
END $report$;
COMMENT ON FUNCTION public.submit_signalement(text,text,text,text,text[],text,numeric,numeric,numeric,text,text,text,timestamptz) IS 'Private submission: authenticated owner media and same-owner deduplication; cross-account merging disabled.';