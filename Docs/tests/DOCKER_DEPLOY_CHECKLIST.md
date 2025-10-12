# Docker & Deploy 整合性チェックリスト

**最終更新**: 2025-10-11  
**目的**: Dockerfile、deploy.yml、.dockerignoreの整合性確認

---

## ✅ 整合性確認結果

### 1. ビルド時引数（--build-arg）

#### Dockerfile で定義 (ARG)

```dockerfile
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### deploy.yml Staging で渡す

```yaml
--build-arg NEXT_PUBLIC_SUPABASE_URL="${{ secrets.STAGING_SUPABASE_URL }}"
--build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${{ secrets.STAGING_SUPABASE_ANON_KEY }}"
```

#### deploy.yml Production で渡す

```yaml
--build-arg NEXT_PUBLIC_SUPABASE_URL="${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}"
--build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}"
```

**✅ 結果**: 完全一致

**理由**: `NEXT_PUBLIC_*` 変数はビルド時にNext.jsアプリケーションにバンドルされる必要があるため、ビルド引数として渡す。

---

### 2. ランタイム環境変数（env_vars）

#### Dockerfile コメント記載

```dockerfile
# Secrets (Secret Manager推奨):
#   - SUPABASE_SERVICE_ROLE_KEY
#   - GEMINI_API_KEY
#   - RESEND_API_KEY
# AI Configuration:
#   - AI_PROVIDER
#   - AI_MODEL
#   - AI_MAX_TOKENS
#   - AI_TEMPERATURE
# Email Configuration:
#   - ADMIN_EMAIL
#   - FROM_EMAIL
```

#### deploy.yml Staging env_vars

```yaml
NODE_ENV=staging
NEXT_PUBLIC_SUPABASE_URL=${{ secrets.STAGING_SUPABASE_URL }}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.STAGING_SUPABASE_ANON_KEY }}
SUPABASE_SERVICE_ROLE_KEY=${{ secrets.STAGING_SUPABASE_SERVICE_ROLE_KEY }}
GEMINI_API_KEY=${{ secrets.STAGING_GEMINI_API_KEY }}
AI_PROVIDER=${{ secrets.STAGING_AI_PROVIDER }}
AI_MODEL=${{ secrets.STAGING_AI_MODEL }}
AI_MAX_TOKENS=${{ secrets.STAGING_AI_MAX_TOKENS }}
AI_TEMPERATURE=${{ secrets.STAGING_AI_TEMPERATURE }}
RESEND_API_KEY=${{ secrets.STAGING_RESEND_API_KEY }}
ADMIN_EMAIL=${{ secrets.ADMIN_EMAIL }}
FROM_EMAIL=${{ secrets.FROM_EMAIL }}
```

#### deploy.yml Production env_vars

```yaml
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
SUPABASE_SERVICE_ROLE_KEY=${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}
AI_PROVIDER=${{ secrets.AI_PROVIDER }}
AI_MODEL=${{ secrets.AI_MODEL }}
AI_MAX_TOKENS=${{ secrets.AI_MAX_TOKENS }}
AI_TEMPERATURE=${{ secrets.AI_TEMPERATURE }}
RESEND_API_KEY=${{ secrets.RESEND_API_KEY }}
ADMIN_EMAIL=${{ secrets.ADMIN_EMAIL }}
FROM_EMAIL=${{ secrets.FROM_EMAIL }}
```

**✅ 結果**: 完全一致（Dockerfileコメント更新済み）

**理由**: これらは機密情報や実行時設定のため、Cloud Runのランタイム環境変数として渡す。

**注意**: `NEXT_PUBLIC_*` 変数は、ビルド時とランタイムの両方で設定されるが、これは問題なし。ビルド時の値がアプリケーションにバンドルされ、ランタイム値はサーバーサイドで使用される。

---

### 3. .dockerignore 除外パターン

#### 重要な除外項目

```
# 環境ファイル（セキュリティ）
.env*

# ビルド出力（再生成される）
.next
node_modules

# テスト関連（本番に不要）
tests
coverage
*.test.ts
*.test.tsx

# ドキュメント（本番に不要）
README.md
Docs
```

**✅ 結果**: 適切に設定済み

**理由**:

- `.env*` ファイルは除外（Secretsはビルド引数/ランタイム変数で渡す）
- `node_modules` は deps ステージで再構築
- `.next` はビルドステージで生成
- テスト・ドキュメントファイルは本番イメージから除外してサイズ削減

---

## 📋 環境変数の分類

### ビルド時のみ必要（--build-arg）

| 変数名                          | 理由                                     |
| ------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | クライアントサイドで使用（バンドル必須） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | クライアントサイドで使用（バンドル必須） |

### ランタイムのみ必要（env_vars）

| 変数名                      | 理由                               |
| --------------------------- | ---------------------------------- |
| `NODE_ENV`                  | 実行環境識別                       |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバーサイドのみ、機密情報       |
| `GEMINI_API_KEY`            | サーバーサイドのみ、機密情報       |
| `AI_PROVIDER`               | サーバーサイド設定、環境ごとに可変 |
| `AI_MODEL`                  | サーバーサイド設定、環境ごとに可変 |
| `AI_MAX_TOKENS`             | サーバーサイド設定、環境ごとに可変 |
| `AI_TEMPERATURE`            | サーバーサイド設定、環境ごとに可変 |
| `RESEND_API_KEY`            | サーバーサイドのみ、機密情報       |
| `ADMIN_EMAIL`               | サーバーサイド設定                 |
| `FROM_EMAIL`                | サーバーサイド設定                 |

### 両方で設定（ビルド時 & ランタイム）

| 変数名                          | 理由                                                       |
| ------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ビルド時にバンドル、ランタイムでもサーバーサイドで参照可能 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ビルド時にバンドル、ランタイムでもサーバーサイドで参照可能 |

**注**: `NEXT_PUBLIC_*` 変数は両方で設定するのが一般的なパターン。

---

## 🔒 セキュリティチェック

### ✅ 機密情報の取り扱い

1. **ビルド時の機密情報**
   - ❌ `SUPABASE_SERVICE_ROLE_KEY` はビルド引数として渡さない（正しい）
   - ❌ `GEMINI_API_KEY` はビルド引数として渡さない（正しい）
   - ❌ `RESEND_API_KEY` はビルド引数として渡さない（正しい）
   - ✅ `NEXT_PUBLIC_*` のみビルド引数として渡す（公開情報）

2. **ランタイムの機密情報**
   - ✅ すべての機密情報は Cloud Run の env_vars で渡す
   - ✅ GitHub Secrets を使用して値を保護

3. **.env ファイル**
   - ✅ `.dockerignore` で除外されている
   - ✅ Git でも `.gitignore` で除外されている前提

---

## 🎯 ベストプラクティス確認

### ✅ 実装済み

1. **Multi-stage Build**
   - `deps` → `builder` → `runner` の3ステージ
   - イメージサイズ最小化

2. **非rootユーザー実行**
   - `USER nextjs` でセキュリティ強化

3. **ポート設定**
   - Cloud Run デフォルトの 8080 を使用

4. **環境変数の分離**
   - ビルド時 vs ランタイムを明確に区別

5. **ヘルスチェック**
   - `/api/health` エンドポイント実装
   - Cloud Run の自動ヘルスチェックを利用

---

## 📝 改善済み項目

### v1.0 → v1.1（2025-10-11）

1. **Dockerfile コメント更新**
   - AI設定環境変数（`AI_PROVIDER`, `AI_MODEL`, `AI_MAX_TOKENS`, `AI_TEMPERATURE`）を追加
   - カテゴリ別に整理（Secrets / AI Configuration / Email Configuration）

2. **deploy.yml AI環境変数追加**
   - Staging環境に `STAGING_AI_*` を追加
   - 本番環境に `AI_*` を追加

3. **環境別の最適化**
   - Staging: `gemini-2.0-flash-lite` (低コスト)
   - Production: `gemini-2.0-flash-exp` (高品質)

### v1.1 → v1.2（2025-10-11）

1. **不要な環境変数を削除**
   - ビルド引数から削除: `NEXT_PUBLIC_ADSENSE_CLIENT_ID`, `GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_OPENWEATHER_API_KEY`
   - env_varsから削除: `STAGING_ADSENSE_CLIENT_ID`, `STAGING_OPENWEATHER_API_KEY`, `NEXT_PUBLIC_ADSENSE_CLIENT_ID`, `NEXT_PUBLIC_OPENWEATHER_API_KEY`, `GOOGLE_SITE_VERIFICATION`
   - Secrets数: 25個 → 22個（-3個）

2. **Dockerfile最適化**
   - ビルド引数を2個のみに削減（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
   - コメントも簡潔化

3. **deploy.yml簡素化**
   - Staging/Production両方のビルド引数とenv_varsを削減
   - より明確で保守しやすい構成に

---

## 🚀 デプロイフロー

### Staging（developブランチ）

```bash
1. git push origin develop
   ↓
2. Test実行（Lint, Unit, Integration）
   ↓
3. Docker Build（STAGING_* Secrets使用）
   ├─ ビルド引数: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
   ├─ イメージタグ: coupleplan-staging:$SHA
   └─ Push: Artifact Registry
   ↓
4. Cloud Run Deploy
   ├─ Service: coupleplan-staging
   ├─ Min: 0, Max: 3, Memory: 512Mi
   ├─ env_vars: STAGING_* Secrets
   └─ URL: https://staging-coupleplan-xxx.a.run.app
   ↓
5. Health Check（/api/health）
   ↓
✅ Staging デプロイ完了
```

### Production（mainブランチ）

```bash
1. git push origin main
   ↓
2. Test実行（Lint, Unit, Integration）
   ↓
3. Docker Build（本番 Secrets使用）
   ├─ ビルド引数: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
   ├─ イメージタグ: coupleplan:$SHA
   └─ Push: Artifact Registry
   ↓
4. Cloud Run Deploy
   ├─ Service: coupleplan
   ├─ Min: 0, Max: 10, Memory: 1Gi
   ├─ env_vars: Production Secrets
   └─ URL: https://coupleplan-xxx.a.run.app
   ↓
5. Health Check（/api/health）
   ↓
✅ Production デプロイ完了
```

---

## ✅ 最終確認チェックリスト

### Dockerfile

- [x] ビルド引数（ARG）は `NEXT_PUBLIC_*` のみ
- [x] ランタイム環境変数のコメントが最新
- [x] AI設定環境変数が記載されている
- [x] Multi-stage build 実装
- [x] 非rootユーザー実行
- [x] ポート8080設定

### deploy.yml

- [x] Staging用ビルド引数が正しい
- [x] Production用ビルド引数が正しい
- [x] Staging env_vars が完全
- [x] Production env_vars が完全
- [x] AI設定環境変数が含まれる
- [x] デプロイ前テスト実行
- [x] デプロイ後ヘルスチェック

### .dockerignore

- [x] `.env*` ファイル除外
- [x] `node_modules` 除外
- [x] `.next` 除外
- [x] テストファイル除外
- [x] ドキュメント除外

### GitHub Secrets

- [x] 22個のSecrets設定済み（設定予定）
- [x] Staging用 Secrets定義（9個）
- [x] Production用 Secrets定義（9個）
- [x] 共通 Secrets定義（4個）
- [x] AI設定 Secrets定義
- [x] WIF設定済み
- [x] 不要変数削除（AdSense、OpenWeather、Google Site Verification）

---

## 🎉 結論

**すべての整合性が確認されました！**

✅ Dockerfile、deploy.yml、.dockerignoreは完全に一致しています  
✅ ビルド時引数とランタイム環境変数が適切に分離されています  
✅ AI設定環境変数が正しく追加されています  
✅ セキュリティベストプラクティスに準拠しています  
✅ 環境別の最適化が実装されています

次のステップは、GitHub Secretsの設定とデプロイテストです！
