-- カップル招待テーブルの作成
CREATE TABLE IF NOT EXISTS public.couple_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL,
  to_user_id UUID,
  invitation_code VARCHAR(6) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_couple_invitations_code ON public.couple_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_couple_invitations_from_user ON public.couple_invitations(from_user_id);

-- RLSの有効化
ALTER TABLE public.couple_invitations ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの作成
-- ユーザーは自分が作成した招待を閲覧可能
CREATE POLICY "Users can view own invitations" ON public.couple_invitations
  FOR SELECT USING (auth.uid() = from_user_id);

-- ユーザーは自分の招待を作成可能
CREATE POLICY "Users can create own invitations" ON public.couple_invitations
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- ユーザーは自分の招待を更新可能
CREATE POLICY "Users can update own invitations" ON public.couple_invitations
  FOR UPDATE USING (auth.uid() = from_user_id);

-- すべてのユーザーは有効な招待コードを検証可能（検証用）
CREATE POLICY "Users can verify invitation codes" ON public.couple_invitations
  FOR SELECT USING (status = 'active' AND expires_at > NOW());

-- コメント
COMMENT ON TABLE public.couple_invitations IS 'パートナー連携招待テーブル';
COMMENT ON COLUMN public.couple_invitations.id IS '招待ID';
COMMENT ON COLUMN public.couple_invitations.from_user_id IS '招待を送信したユーザーID';
COMMENT ON COLUMN public.couple_invitations.to_user_id IS '招待を受信したユーザーID（オプション）';
COMMENT ON COLUMN public.couple_invitations.invitation_code IS '6桁の招待コード';
COMMENT ON COLUMN public.couple_invitations.status IS 'ステータス: active, used, expired';
COMMENT ON COLUMN public.couple_invitations.expires_at IS '有効期限';
COMMENT ON COLUMN public.couple_invitations.created_at IS '作成日時';
COMMENT ON COLUMN public.couple_invitations.updated_at IS '更新日時';

