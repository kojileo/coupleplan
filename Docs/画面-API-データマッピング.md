# CouplePlan 画面-API-データマッピング

## 概要

CouplePlanプラットフォームの画面からマイクロサービスAPI、データ管理までの詳細なマッピングを、マイクロサービスアーキテクチャの原則に基づいて作成しました。

## 1. 画面別機能・APIマッピング表

### 認証・初期設定系

#### AUTH-001: ログイン・アカウント作成画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| AUTH-001 | ログイン・アカウント作成 | アカウント作成 | API呼び出し | API-AUTH-001 | ユーザー登録 | `/api/v1/users` | POST | email, password, name | User |
| AUTH-001 | ログイン・アカウント作成 | ログイン認証 | API呼び出し | API-AUTH-002 | ユーザー認証 | `/api/v1/auth/login` | POST | email, password | UserSession |
| AUTH-001 | ログイン・アカウント作成 | バリデーション | 画面内処理 | - | - | - | - | - | - |
| AUTH-001 | ログイン・アカウント作成 | エラーハンドリング | 画面内処理 | - | - | - | - | - | - |

#### AUTH-002: プロフィール設定画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| AUTH-002 | プロフィール設定 | プロフィール保存 | API呼び出し | API-UM-001 | プロフィール更新 | `/api/v1/users/{userId}/profile` | PUT | name, age, interests, preferences | UserProfile |
| AUTH-002 | プロフィール設定 | 画像アップロード | API呼び出し | API-UM-002 | 画像アップロード | `/api/v1/users/{userId}/avatar` | POST | file | UserProfile |
| AUTH-002 | プロフィール設定 | 入力バリデーション | 画面内処理 | - | - | - | - | - | - |
| AUTH-002 | プロフィール設定 | プレビュー表示 | 画面内処理 | - | - | - | - | - | - |

#### AUTH-003: プライバシー設定画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| AUTH-003 | プライバシー設定 | プライバシー設定保存 | API呼び出し | API-UM-003 | プライバシー設定更新 | `/api/v1/users/{userId}/privacy` | PUT | privacySettings | UserProfile |
| AUTH-003 | プライバシー設定 | 設定項目表示 | API呼び出し | API-UM-004 | プライバシー設定取得 | `/api/v1/users/{userId}/privacy` | GET | userId | UserProfile |
| AUTH-003 | プライバシー設定 | リアルタイムプレビュー | 画面内処理 | - | - | - | - | - | - |

#### AUTH-004: パートナー連携設定画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| AUTH-004 | パートナー連携設定 | QRコード生成 | API呼び出し | API-UM-005 | 連携QR生成 | `/api/v1/couples/qr` | POST | userId | CoupleInvitation |
| AUTH-004 | パートナー連携設定 | 連携リンク生成 | API呼び出し | API-UM-006 | 連携リンク生成 | `/api/v1/couples/invite` | POST | userId | CoupleInvitation |
| AUTH-004 | パートナー連携設定 | 連携コード入力 | API呼び出し | API-UM-007 | 連携コード検証 | `/api/v1/couples/verify` | POST | inviteCode | CoupleInvitation |
| AUTH-004 | パートナー連携設定 | 連携完了 | API呼び出し | API-UM-008 | カップル関係確立 | `/api/v1/couples` | POST | userId1, userId2 | Couple |
| AUTH-004 | パートナー連携設定 | QRスキャン | 画面内処理 | - | - | - | - | - | - |

### UC-001: AIデートプラン提案・生成

#### UC001-001: デートプラン作成画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| UC001-001 | デートプラン作成 | 要件入力 | 画面内処理 | - | - | - | - | - | - |
| UC001-001 | デートプラン作成 | ユーザープロフィール取得 | API呼び出し | API-UM-009 | プロフィール取得 | `/api/v1/users/{userId}/profile` | GET | userId | UserProfile |
| UC001-001 | デートプラン作成 | 過去履歴取得 | API呼び出し | API-DE-001 | デート履歴取得 | `/api/v1/dates/history` | GET | coupleId | Date |
| UC001-001 | デートプラン作成 | プラン生成依頼 | API呼び出し | API-DP-001 | AIプラン生成 | `/api/v1/plans/generate` | POST | budget, duration, location, preferences | DatePlan |
| UC001-001 | デートプラン作成 | バリデーション | 画面内処理 | - | - | - | - | - | - |

#### UC001-002: AI生成中画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| UC001-002 | AI生成中 | 生成進捗取得 | API呼び出し | API-DP-002 | 生成状況取得 | `/api/v1/plans/{planId}/status` | GET | planId | DatePlan |
| UC001-002 | AI生成中 | リアルタイム更新 | 画面内処理 | - | - | - | - | - | - |
| UC001-002 | AI生成中 | タイムアウト処理 | 画面内処理 | - | - | - | - | - | - |

#### UC001-003: プラン提案画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| UC001-003 | プラン提案 | 提案プラン取得 | API呼び出し | API-DP-003 | 提案プラン取得 | `/api/v1/plans/{planId}/proposals` | GET | planId | PlanRecommendation |
| UC001-003 | プラン提案 | プラン選択 | API呼び出し | API-DP-004 | プラン選択 | `/api/v1/plans/{planId}/select` | POST | planId, selectedProposalId | DatePlan |
| UC001-003 | プラン提案 | フィードバック送信 | API呼び出し | API-DP-005 | フィードバック登録 | `/api/v1/plans/{planId}/feedback` | POST | planId, rating, comment | PlanFeedback |
| UC001-003 | プラン提案 | 詳細表示切り替え | 画面内処理 | - | - | - | - | - | - |

#### UC001-004: プラン詳細画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| UC001-004 | プラン詳細 | プラン詳細取得 | API呼び出し | API-DP-006 | プラン詳細取得 | `/api/v1/plans/{planId}` | GET | planId | DatePlan, PlanItem |
| UC001-004 | プラン詳細 | 外部情報取得 | API呼び出し | API-PI-001 | 外部情報取得 | `/api/v1/external/places` | GET | placeId | PortalContent |
| UC001-004 | プラン詳細 | 地図表示 | 画面内処理 | - | - | - | - | - | - |
| UC001-004 | プラン詳細 | 予算計算 | 画面内処理 | - | - | - | - | - | - |

### UC-002: カップル共同デートプラン編集

#### UC002-001: 共同編集画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| UC002-001 | 共同編集 | 編集セッション開始 | API呼び出し | API-COLLAB-001 | セッション開始 | `/api/v1/sessions` | POST | planId, userId | PlanSession |
| UC002-001 | 共同編集 | リアルタイム同期 | API呼び出し | API-COLLAB-002 | 編集同期 | `/api/v1/sessions/{sessionId}/sync` | WebSocket | sessionId, operation | EditOperation |
| UC002-001 | 共同編集 | 編集操作送信 | API呼び出し | API-COLLAB-003 | 編集操作登録 | `/api/v1/sessions/{sessionId}/operations` | POST | sessionId, operation | EditOperation |
| UC002-001 | 共同編集 | 競合検出 | 画面内処理 | - | - | - | - | - | - |
| UC002-001 | 共同編集 | カーソル位置同期 | 画面内処理 | - | - | - | - | - | - |

#### UC002-002: 編集競合解決画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| UC002-002 | 競合解決 | 競合情報取得 | API呼び出し | API-COLLAB-004 | 競合情報取得 | `/api/v1/sessions/{sessionId}/conflicts` | GET | sessionId | EditConflict |
| UC002-002 | 競合解決 | 競合解決 | API呼び出し | API-COLLAB-005 | 競合解決 | `/api/v1/sessions/{sessionId}/conflicts/{conflictId}/resolve` | POST | sessionId, conflictId, resolution | EditConflict |
| UC002-002 | 競合解決 | 解決選択UI | 画面内処理 | - | - | - | - | - | - |

### UC-003: ポータル起点統合プラットフォーム

#### UC003-001: ポータルトップ画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| UC003-001 | ポータルトップ | 記事一覧取得 | API呼び出し | API-PI-002 | 記事一覧取得 | `/api/v1/portal/articles` | GET | page, category | PortalContent |
| UC003-001 | ポータルトップ | 人気スポット取得 | API呼び出し | API-PI-003 | 人気スポット取得 | `/api/v1/portal/trending` | GET | limit | PortalContent |
| UC003-001 | ポータルトップ | 検索実行 | API呼び出し | API-PI-004 | コンテンツ検索 | `/api/v1/portal/search` | GET | query, filters | PortalContent |
| UC003-001 | ポータルトップ | アプリ誘導 | 画面内処理 | - | - | - | - | - | - |
| UC003-001 | ポータルトップ | レスポンシブ表示 | 画面内処理 | - | - | - | - | - | - |

#### UC003-002: デート情報検索画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| UC003-002 | デート情報検索 | 検索実行 | API呼び出し | API-PI-005 | 詳細検索 | `/api/v1/portal/search/advanced` | POST | query, location, budget, category | PortalContent |
| UC003-002 | デート情報検索 | フィルタ適用 | API呼び出し | API-PI-006 | フィルタ検索 | `/api/v1/portal/search/filtered` | POST | filters | PortalContent |
| UC003-002 | デート情報検索 | 検索履歴保存 | API呼び出し | API-PI-007 | 検索履歴保存 | `/api/v1/portal/search/history` | POST | userId, query | ContentDelivery |
| UC003-002 | デート情報検索 | リアルタイム検索 | 画面内処理 | - | - | - | - | - | - |
| UC003-002 | デート情報検索 | 検索結果表示 | 画面内処理 | - | - | - | - | - | - |

#### UC003-003: 記事詳細画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| UC003-003 | 記事詳細 | 記事詳細取得 | API呼び出し | API-PI-008 | 記事詳細取得 | `/api/v1/portal/articles/{articleId}` | GET | articleId | PortalContent |
| UC003-003 | 記事詳細 | 関連記事取得 | API呼び出し | API-PI-009 | 関連記事取得 | `/api/v1/portal/articles/{articleId}/related` | GET | articleId | PortalContent |
| UC003-003 | 記事詳細 | 閲覧履歴記録 | API呼び出し | API-PI-010 | 閲覧履歴記録 | `/api/v1/portal/articles/{articleId}/view` | POST | articleId, userId | ContentDelivery |
| UC003-003 | 記事詳細 | プラン作成誘導 | 画面内処理 | - | - | - | - | - | - |
| UC003-003 | 記事詳細 | ソーシャルシェア | 画面内処理 | - | - | - | - | - | - |

### UC-004: AI喧嘩仲裁・関係修復システム

#### UC004-001: 仲裁依頼画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| UC004-001 | 仲裁依頼 | 仲裁依頼送信 | API呼び出し | API-RM-001 | 仲裁依頼 | `/api/v1/mediation/request` | POST | coupleId, description, severity | Conflict |
| UC004-001 | 仲裁依頼 | 関係性データ取得 | API呼び出し | API-RM-002 | 関係性データ取得 | `/api/v1/relationships/{coupleId}` | GET | coupleId | Relationship |
| UC004-001 | 仲裁依頼 | 過去の対立履歴取得 | API呼び出し | API-RM-003 | 対立履歴取得 | `/api/v1/conflicts/history` | GET | coupleId | Conflict |
| UC004-001 | 仲裁依頼 | 入力バリデーション | 画面内処理 | - | - | - | - | - | - |

#### UC004-002: 状況分析画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| UC004-002 | 状況分析 | 分析結果取得 | API呼び出し | API-RM-004 | 対立分析 | `/api/v1/mediation/{mediationId}/analysis` | GET | mediationId | Conflict |
| UC004-002 | 状況分析 | 感情分析結果取得 | API呼び出し | API-RM-005 | 感情分析 | `/api/v1/mediation/{mediationId}/emotions` | GET | mediationId | RelationshipMetric |
| UC004-002 | 状況分析 | 分析進捗取得 | API呼び出し | API-RM-006 | 分析進捗取得 | `/api/v1/mediation/{mediationId}/progress` | GET | mediationId | Mediation |
| UC004-002 | 状況分析 | 可視化表示 | 画面内処理 | - | - | - | - | - | - |

#### UC004-003: 仲裁提案画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| UC004-003 | 仲裁提案 | 仲裁提案取得 | API呼び出し | API-RM-007 | 仲裁提案取得 | `/api/v1/mediation/{mediationId}/proposals` | GET | mediationId | MediationProposal |
| UC004-003 | 仲裁提案 | 提案選択 | API呼び出し | API-RM-008 | 提案選択 | `/api/v1/mediation/{mediationId}/select` | POST | mediationId, proposalId | Mediation |
| UC004-003 | 仲裁提案 | 提案フィードバック | API呼び出し | API-RM-009 | 提案フィードバック | `/api/v1/mediation/{mediationId}/feedback` | POST | mediationId, feedback | MediationProposal |
| UC004-003 | 仲裁提案 | 提案詳細表示 | 画面内処理 | - | - | - | - | - | - |


### UC-007: 段階的マネタイズ制御

#### UC007-001: 課金管理画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| UC007-001 | 課金管理 | サブスクリプション取得 | API呼び出し | API-MON-001 | サブスク取得 | `/api/v1/subscriptions/{coupleId}` | GET | coupleId | Subscription |
| UC007-001 | 課金管理 | プラン変更 | API呼び出し | API-MON-002 | プラン変更 | `/api/v1/subscriptions/{coupleId}/plan` | PUT | coupleId, newPlan | Subscription |
| UC007-001 | 課金管理 | 支払い履歴取得 | API呼び出し | API-MON-003 | 支払い履歴 | `/api/v1/payments/{coupleId}` | GET | coupleId | Payment |
| UC007-001 | 課金管理 | 使用量取得 | API呼び出し | API-MON-004 | 使用量取得 | `/api/v1/usage/{coupleId}` | GET | coupleId | UsageMetrics |
| UC007-001 | 課金管理 | 料金計算表示 | 画面内処理 | - | - | - | - | - | - |

#### UC007-002: 機能解放画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| UC007-002 | 機能解放 | 機能フラグ取得 | API呼び出し | API-MON-005 | 機能フラグ取得 | `/api/v1/features/{coupleId}` | GET | coupleId | FeatureFlag |
| UC007-002 | 機能解放 | 機能解放状況取得 | API呼び出し | API-MON-006 | 解放状況取得 | `/api/v1/features/{coupleId}/status` | GET | coupleId | FeatureFlag |
| UC007-002 | 機能解放 | アップグレード誘導 | 画面内処理 | - | - | - | - | - | - |
| UC007-002 | 機能解放 | 制限表示 | 画面内処理 | - | - | - | - | - | - |

### 共通・システム系

#### COMMON-001: ダッシュボード画面

| 画面ID | 画面名 | 機能 | 処理種別 | API ID | API名 | エンドポイント | HTTPメソッド | 主要パラメータ | 管理データ |
|--------|--------|------|----------|--------|-------|----------------|--------------|----------------|------------|
| COMMON-001 | ダッシュボード | ダッシュボードデータ取得 | API呼び出し | API-UM-010 | ダッシュボード取得 | `/api/v1/dashboard/{userId}` | GET | userId | User, Date, Relationship |
| COMMON-001 | ダッシュボード | 通知取得 | API呼び出し | API-UM-011 | 通知取得 | `/api/v1/notifications/{userId}` | GET | userId | Notification |
| COMMON-001 | ダッシュボード | 関係性スコア取得 | API呼び出し | API-RM-010 | 関係性スコア取得 | `/api/v1/relationships/{coupleId}/score` | GET | coupleId | Relationship |
| COMMON-001 | ダッシュボード | リアルタイム更新 | 画面内処理 | - | - | - | - | - | - |
| COMMON-001 | ダッシュボード | カード表示 | 画面内処理 | - | - | - | - | - | - |

## 2. APIサービスと管理データの責務マッピング表

| サービス名 | サービスID | 主要エンティティ | 管理データ | 主要API | 責務 |
|------------|------------|------------------|------------|---------|------|
| User Management Service | MS-001 | User, Couple, UserProfile, UserSession | User, Couple, UserProfile, UserSession, CoupleInvitation | API-UM-001〜011 | ユーザー管理、認証、プロフィール、セッション管理 |
| Date Planning Service | MS-002 | DatePlan, PlanItem, PlanTemplate | DatePlan, PlanItem, PlanTemplate, PlanRecommendation, PlanFeedback | API-DP-001〜006 | デートプラン生成、管理、AI提案 |
| Collaboration Service | MS-003 | PlanSession, EditOperation, EditConflict | PlanSession, EditOperation, EditConflict, CollaborationState | API-COLLAB-001〜005 | リアルタイム協働編集、競合解決 |
| Relationship Management Service | MS-004 | Relationship, Conflict, Mediation | Relationship, Conflict, Mediation, RelationshipMetric, MediationProposal | API-RM-001〜010 | 関係性分析、対立仲裁、修復提案 |
| Platform Integration Service | MS-007 | PortalContent, ExternalService | PortalContent, ExternalService, IntegrationConfig, ContentDelivery | API-PI-001〜010 | ポータルコンテンツ、外部連携 |
| Monetization Service | MS-008 | Subscription, Payment, FeatureFlag | Subscription, Payment, FeatureFlag, UsageMetrics, BillingCycle | API-MON-001〜006 | 課金管理、機能制御、使用量管理 |

## 3. ハイレベルマッピング表

| 画面カテゴリ | 主要サービス | 主要データ | 主要API | 特徴 |
|--------------|--------------|------------|---------|------|
| 認証・初期設定 | MS-001 (User Management) | User, UserProfile | API-UM-001〜008 | 認証、プロフィール管理、パートナー連携 |
| AIデートプラン | MS-002 (Date Planning) | DatePlan, PlanRecommendation | API-DP-001〜006 | AI生成、提案、フィードバック |
| 共同編集 | MS-003 (Collaboration) | PlanSession, EditOperation | API-COLLAB-001〜005 | リアルタイム同期、競合解決 |
| ポータル | MS-007 (Platform Integration) | PortalContent, ContentDelivery | API-PI-001〜010 | コンテンツ配信、検索、外部連携 |
| 仲裁・関係修復 | MS-004 (Relationship Management) | Conflict, Mediation | API-RM-001〜010 | AI分析、仲裁提案、関係修復 |
| 課金・機能制御 | MS-008 (Monetization) | Subscription, FeatureFlag | API-MON-001〜006 | 段階的課金、機能解放制御 |
| ダッシュボード | MS-001, MS-004 | User, Relationship | API-UM-010, API-RM-010 | 統合表示、リアルタイム更新 |

## 4. 設計のベストプラクティスと注意点

### 冪等性（Idempotency）
- **プラン生成API**: 同じパラメータでの重複リクエストを防ぐため、リクエストIDを使用
- **編集操作API**: 操作IDによる冪等性確保
- **支払いAPI**: Stripeの冪等性キーを活用

### 競合制御（Conflict Resolution）
- **共同編集**: Operational Transform (OT) アルゴリズムによる競合解決
- **関係性データ**: 楽観的ロック（version field）による更新競合制御
- **課金処理**: 悲観的ロックによる重複課金防止

### バルク操作（Bulk Operations）
- **メモリ抽出**: バッチ処理による大量データの効率的処理
- **通知送信**: キューイングシステムによる非同期処理
- **データ同期**: イベントソーシングによる一括同期

### エラーハンドリング
- **API呼び出し**: 指数バックオフによるリトライ機構
- **リアルタイム通信**: WebSocket接続の自動再接続
- **データ整合性**: Sagaパターンによる分散トランザクション管理

### セキュリティ
- **認証**: JWT トークンによる認証・認可
- **データ暗号化**: AES-256による機密データ暗号化
- **API制限**: レート制限による不正利用防止

---

**作成日**: 2025年1月27日  
**バージョン**: 1.0  
**作成者**: ソフトウェアアーキテクト  
**承認者**: [承認者名]  
**レビュー者**: [レビュー者名]
