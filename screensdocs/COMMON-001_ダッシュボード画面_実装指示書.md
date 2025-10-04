# COMMON-001: ダッシュボード画面 実装指示書

## 1. 全体評価

### 目的とゴール
- **主要目的**: アプリ横断の主要指標（関係性スコア、最新プラン、通知）を集約表示し次アクションに導く
- **ビジネスゴール**: 日次アクティブ率向上とクロスユースケース誘導、マネタイズ段階に応じた訴求
- **技術ゴール**: 各サービス領域のサマリーデータを一括取得しリアルタイム更新を安定化

### 受け入れ基準
- ダッシュボード主要カードが1.5秒以内に表示される
- 通知リストが3秒以内に取得され、未読件数がヘッダーに同期表示
- 関係性スコアは最新値と前週比を表示し、値更新時にアニメーション提示
- 主要カードや通知はキーボード操作・スクリーンリーダーでアクセス可能
- エラー発生時はリトライ導線とサポートリンクを表示

### 機能段階性
1. **基礎**: ダッシュボードデータ取得、通知表示、関係性スコア、クイックアクション
2. **拡張**: AI洞察カード、個別リマインダー、日次ジャーナル
3. **制約**: カード上限12枚、通知取得50件、リアルタイム更新15秒周期

## 2. 仕様の厳密化

### コア機能

#### ダッシュボードデータ取得
- **取得**: GET /api/v1/dashboard/{userId}
- **内容**: 主要カードセット（次のデート、最新仲裁状況、推奨タスクなど）
- **失敗**: プレースホルダー表示とリトライボタン

#### 通知取得
- **取得**: GET /api/v1/notifications/{userId}
- **フィルタ**: 未読・既読、カテゴリ別
- **操作**: 個別既読化、全既読化

#### 関係性スコア取得
- **取得**: GET /api/v1/relationships/{coupleId}/score
- **表示**: 現在値、前週比、トレンドアイコン
- **閾値**: 低スコア時は改善提案カードを活性化

#### リアルタイム更新
- **接続**: Server-Sent EventsまたはWebSocketで主要カードの更新を受信
- **イベント**: , , 
- **フォールバック**: 15秒ごとのポーリング

#### カード表示
- **レイアウト**: 2カラム（モバイルは1カラム）
- **タイプ**: メトリクスカード、タスクリスト、CTAカード
- **カスタマイズ**: カード表示順のドラッグ&ドロップ（将来的対応）

### 入力制約 & バリデーション

#### userId
- **形式**: UUID v4
- **必須**: 必須
- **エラーメッセージ**: "ユーザー情報を取得できません"

#### coupleId
- **形式**: UUID v4
- **必須**: ユーザーがカップル連携済みの場合に必須
- **エラーメッセージ**: "カップル情報を取得できません"

#### notificationFilter
- **形式**: enum(all | unread | archived)
- **必須**: 任意
- **エラーメッセージ**: "通知フィルタが不正です"

### データモデル & API

#### リクエスト / レスポンスモデル
~~~typescript
interface DashboardResponse {
  userId: string;
  coupleId?: string;
  cards: DashboardCard[];
  quickActions: QuickAction[];
  refreshedAt: string;
}

interface DashboardCard {
  cardId: string;
  type: 'metric' | 'task' | 'cta' | 'timeline';
  title: string;
  description?: string;
  value?: number | string;
  delta?: { value: number; trend: 'up' | 'down' | 'flat' };
  cta?: { label: string; action: string };
  data?: Record<string, unknown>;
}

interface NotificationItem {
  notificationId: string;
  title: string;
  body: string;
  category: 'plan' | 'mediation' | 'memory' | 'system';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface RelationshipScoreResponse {
  coupleId: string;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  delta: number;
  measuredAt: string;
}

interface DashboardEvent {
  type: 'dashboard.card.update' | 'notification.new' | 'relationship.score.update';
  payload: any;
  emittedAt: string;
}
~~~

#### API エンドポイント
- ダッシュボードデータ取得: GET /api/v1/dashboard/{userId}
- 通知取得: GET /api/v1/notifications/{userId}
- 関係性スコア取得: GET /api/v1/relationships/{coupleId}/score
- 通知既読化: POST /api/v1/notifications/{notificationId}/read
- リアルタイム更新: SSE /api/v1/dashboard/{userId}/events

### UX / A11y

#### レイアウト
- タブレット以上は2カラム、モバイルは1カラムとセクションタブ
- カードごとにaria-labelledby/aria-describedbyを設定
- ヒーローカードに主要KPIとCTAを配置

#### キーボード操作
- でカード間を移動、でCTA起動
- 通知リストは上下矢印で移動、でアーカイブ
- ショートカット例: で通知セクションへフォーカス

#### アクセシビリティ
- スコアメーターはaria-valuenow/aria-valuemin/aria-valuemaxを定義
- 比較データはテキストで冗長化し色依存を排除
- リアルタイム通知はaria-live="polite"で読み上げ

### セキュリティ & プライバシー
- **認証**: アクセストークン必須、userIdとトークンの一致を検証
- **通信**: HTTPS/TLS1.3以上、SSE/WSSも同様
- **キャッシュ**: ブラウザキャッシュは5分以内、共有端末では無効
- **ログ**: ダッシュボード表示ログにPIIを含めず匿名化IDで計測

### 非機能要件
- **レスポンス**: ダッシュボードAPI 1.5秒以内、通知API 2秒以内
- **リアルタイム性**: SSE遅延300ms以内、フォールバックポーリング15秒
- **可用性**: 99.9%、ダッシュボードAPI失敗率2%以下
- **可観測性**: APIレイテンシ、カードクリック率、未読通知率を計測

## 3. 曖昧さと解決

### カード優先順位
- 既読通知が多い場合でも最新3件のみ表示し「すべて表示」で遷移
- カード数が多い場合は折りたたみ、ユーザー設定で順序変更（拡張）

### 関係性スコア更新
- スコアが未取得の場合はプレースホルダー表示と計測準備ガイダンス
- 大幅変動時はアラートカードで背景情報を説明

### マルチデバイスセッション
- SSE接続は1ユーザー2接続まで許容、超過時はポーリングへ切替
- カード操作はクライアントローカルで保持し、セッション間同期は将来対応

## 4. 受け入れ基準例（Gherkin風）

### 初回表示
~~~gherkin
Given 認証済みユーザーがダッシュボードにアクセスする
When ダッシュボードAPIが正常に応答する
Then 1.5秒以内に主要カードが表示される
And 関係性スコアカードに現在値と前週比が表示される
~~~

### 通知同期
~~~gherkin
Given 未読通知が存在する
When 新しい通知イベントが届く
Then 未読バッジが1件増加する
And 通知リスト上部に新しい通知が追加される
~~~

## 5. リスクとトレードオフ

### 技術リスク
- 多数API依存による遅延 → バックエンドでアグリゲーション、部分レンダリング
- SSE切断 → 自動再接続とポーリングフォールバック
- 通知スパム → レートリミットとカテゴリ別表示制御

### UXリスク
- 情報過多 → カード分類と折りたたみ、個別設定
- メトリクス誤解 → ツールチップと説明リンク
- リアルタイム更新の煩雑さ → 控えめなアニメーションとバッチ更新

### プライバシーリスク
- 共用端末での情報露出 → クイックロック導線とセッションタイムアウト
- 通知内容の機密性 → カテゴリに応じてプレビュー制限

## 6. 拡張余地

### 短期拡張
- AIインサイトカード（関係性改善提案）
- メモ入力ウィジェット
- ウィジェット並び替え

### 中期拡張
- ウィジェットマーケットプレイス
- 目標設定と進捗ガントチャート
- 外部カレンダー連携

### 長期拡張
- パーソナライズレイアウト自動生成
- マルチカップル/家族モード
- 音声アシスタント統合

## 7. 実装ガイドライン

### 技術スタック
- **フロントエンド**: React 18 + TypeScript + Tailwind CSS
- **状態管理**: React Query（データフェッチ） + Zustand（UIローカル状態）
- **リアルタイム**: EventSource（SSE） + WebSocketフォールバック
- **可視化**: RechartsまたはVisx

### コンポーネント設計
~~~typescript
interface DashboardPageProps {
  userId: string;
  coupleId?: string;
}

interface DashboardCardProps {
  card: DashboardCard;
  onAction?: (action: string) => void;
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

interface RelationshipScoreWidgetProps {
  data: RelationshipScoreResponse | null;
  loading: boolean;
}
~~~

### スタイリング
~~~css
.dashboard-page {
  @apply max-w-6xl mx-auto px-4 py-10 space-y-8;
}

.dashboard-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.dashboard-card {
  @apply bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4;
}

.notification-panel {
  @apply bg-white rounded-2xl shadow-md border border-slate-200 p-5 max-h-[28rem] overflow-y-auto;
}

.score-widget {
  @apply bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 text-white rounded-2xl p-6 shadow-lg;
}
~~~

### テレメトリ
- カード表示回数、CTAクリック率、通知既読率
- リアルタイムイベント成功率、再接続回数
- カード並び替え（実装後）の利用率

