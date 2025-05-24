-- Row Level Security (RLS) の有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- プロフィールテーブルのポリシー
-- ユーザーは自分のプロフィールのみ読み取り可能
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のプロフィールのみ挿入可能
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- プランテーブルのポリシー
-- 公開プランは誰でも閲覧可能、非公開プランは作成者のみ閲覧可能
CREATE POLICY "Public plans are viewable by everyone" ON public.plans
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- ユーザーは自分のプランのみ挿入可能
CREATE POLICY "Users can insert own plans" ON public.plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のプランのみ更新可能
CREATE POLICY "Users can update own plans" ON public.plans
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のプランのみ削除可能
CREATE POLICY "Users can delete own plans" ON public.plans
  FOR DELETE USING (auth.uid() = user_id);

-- ロケーションテーブルのポリシー
-- プランの所有者のみロケーションを管理可能
CREATE POLICY "Users can manage locations of own plans" ON public.locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = locations.plan_id
      AND plans.user_id = auth.uid()
    )
  );

-- 公開プランのロケーションは誰でも閲覧可能
CREATE POLICY "Public plan locations are viewable" ON public.locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = locations.plan_id
      AND plans.is_public = true
    )
  );

-- いいねテーブルのポリシー
-- 認証済みユーザーは公開プランにいいね可能
CREATE POLICY "Authenticated users can like public plans" ON public.likes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = likes.plan_id
      AND plans.is_public = true
    )
  );

-- ユーザーは自分のいいねのみ削除可能
CREATE POLICY "Users can delete own likes" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- いいねは誰でも閲覧可能（公開プランのもののみ）
CREATE POLICY "Likes on public plans are viewable" ON public.likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = likes.plan_id
      AND plans.is_public = true
    )
  );

-- セキュリティ関数：管理者チェック
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- 管理者用ポリシー（すべてのデータにアクセス可能）
CREATE POLICY "Admins have full access to all data" ON public.profiles
  FOR ALL USING (is_admin());

CREATE POLICY "Admins have full access to all plans" ON public.plans
  FOR ALL USING (is_admin());

CREATE POLICY "Admins have full access to all locations" ON public.locations
  FOR ALL USING (is_admin());

CREATE POLICY "Admins have full access to all likes" ON public.likes
  FOR ALL USING (is_admin()); 