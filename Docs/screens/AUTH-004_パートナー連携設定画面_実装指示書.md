# AUTH-004: パートナー連携設定画面 実装指示書

## 1. 全体評価

### 目的とゴール
- **主要目的**: カップル関係の確立とパートナーとの連携設定を提供
- **ビジネスゴール**: カップル機能の利用促進とユーザーエンゲージメント向上
- **技術ゴール**: セキュアで直感的なパートナー連携システムの実現

### 受け入れ基準
- ユーザーが2分以内にパートナー連携完了
- QRコード生成が5秒以内に完了
- 連携コード検証が3秒以内に完了
- モバイル・デスクトップ両対応のレスポンシブデザイン
- WCAG 2.1 AA準拠のアクセシビリティ

### 機能段階性
1. **基礎**: QRコード生成、連携リンク生成、連携コード入力
2. **拡張**: QRスキャン、連携履歴、連携状態表示
3. **制約**: 連携制限、セキュリティ検証、タイムアウト処理

## 2. 仕様の厳密化

### コア機能

#### QRコード生成
- **生成**: ユーザー固有のQRコード生成
- **表示**: 高解像度QRコードの表示
- **保存**: QRコードの画像保存機能
- **共有**: QRコードの共有機能

#### 連携リンク生成
- **生成**: ユニークな連携リンク生成
- **表示**: 連携リンクの表示
- **コピー**: 連携リンクのコピー機能
- **共有**: 連携リンクの共有機能

#### 連携コード入力
- **入力**: 6桁の連携コード入力
- **検証**: 連携コードの妥当性検証
- **確認**: 連携相手の確認
- **完了**: カップル関係の確立

#### QRスキャン
- **カメラ**: カメラによるQRコードスキャン
- **検証**: スキャンしたQRコードの検証
- **確認**: 連携相手の確認
- **完了**: カップル関係の確立

### 入力制約 & バリデーション

#### 連携コード
- **長さ**: 6桁
- **形式**: 数字のみ
- **有効期限**: 24時間
- **エラーメッセージ**: "6桁の数字を入力してください"

#### QRコード
- **形式**: 標準QRコード
- **サイズ**: 256x256px以上
- **有効期限**: 24時間
- **エラーメッセージ**: "有効なQRコードをスキャンしてください"

#### 連携リンク
- **形式**: HTTPS URL
- **有効期限**: 24時間
- **使用回数**: 1回のみ
- **エラーメッセージ**: "有効な連携リンクを入力してください"

### データモデル & API

#### リクエストモデル
```typescript
interface CoupleInvitationRequest {
  userId: string;
  invitationType: 'qr' | 'link' | 'code';
  expiresAt: string;
}

interface CoupleVerificationRequest {
  invitationCode: string;
  userId: string;
}

interface CoupleCreationRequest {
  userId1: string;
  userId2: string;
  invitationId: string;
}
```

#### レスポンスモデル
```typescript
interface CoupleInvitationResponse {
  invitationId: string;
  qrCode?: string;
  invitationLink?: string;
  invitationCode?: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
}

interface CoupleVerificationResponse {
  isValid: boolean;
  inviterInfo?: {
    userId: string;
    name: string;
    profileImage?: string;
  };
  message?: string;
}

interface CoupleCreationResponse {
  coupleId: string;
  userId1: string;
  userId2: string;
  createdAt: string;
  status: 'active';
}
```

#### API エンドポイント
- **連携QR生成**: `POST /api/v1/couples/qr`
- **連携リンク生成**: `POST /api/v1/couples/invite`
- **連携コード検証**: `POST /api/v1/couples/verify`
- **カップル関係確立**: `POST /api/v1/couples`

### UX / A11y

#### キーボード操作
- **Tab順序**: QRコード生成 → 連携リンク生成 → 連携コード入力 → 確認ボタン
- **Enter**: フォーム送信
- **Escape**: フォームリセット
- **数字キー**: 連携コード入力

#### スクリーンリーダー対応
- **aria-label**: 各入力フィールドの説明
- **aria-live**: 連携状態の読み上げ
- **aria-describedby**: ヘルプテキストの関連付け
- **role**: フォーム要素の役割定義

#### 色覚対応
- **連携状態**: 色 + アイコン + テキスト
- **エラー表示**: 色 + 警告アイコン + テキスト
- **フォーカス**: 色 + アウトライン + 影

### セキュリティ & プライバシー

#### データ保護
- **連携コード**: 暗号化された生成
- **通信**: HTTPS強制、TLS 1.3以上
- **有効期限**: 24時間の自動失効
- **使用制限**: 1回のみ使用可能

#### セキュリティ検証
- **QRコード**: 署名付きQRコード
- **連携リンク**: トークン付きURL
- **連携コード**: 暗号化されたコード
- **本人確認**: 連携相手の確認

### 非機能要件

#### パフォーマンス
- **QRコード生成**: 5秒以内
- **連携コード検証**: 3秒以内
- **カップル関係確立**: 5秒以内
- **QRスキャン**: 2秒以内

#### 可用性
- **稼働率**: 99.9%以上
- **エラー率**: 1%以下
- **復旧時間**: 5分以内

#### スケーラビリティ
- **同時接続**: 10,000ユーザー
- **スループット**: 1,000リクエスト/秒
- **データ容量**: 100万カップル分の連携

## 3. 曖昧さと解決

### 連携方法の選択
- **QRコード**: モバイル端末での直接スキャン
- **連携リンク**: メッセージアプリでの共有
- **連携コード**: 手動でのコード入力

### 連携の確認
- **相手情報**: 連携相手の基本情報表示
- **確認ダイアログ**: 連携の最終確認
- **キャンセル**: 連携のキャンセル機能

### 連携状態の管理
- **進行中**: 連携処理中の状態表示
- **完了**: 連携完了の状態表示
- **エラー**: 連携エラーの状態表示

## 4. 受け入れ基準例（Gherkin風）

### QRコード連携
```gherkin
Given ユーザーがパートナー連携設定画面にアクセス
When QRコード生成ボタンをクリック
Then QRコードが生成される
And 5秒以内に表示される

Given ユーザーがパートナー連携設定画面にアクセス
When 有効なQRコードをスキャン
Then 連携相手の情報が表示される
And 確認後にカップル関係が確立される
```

### 連携コード連携
```gherkin
Given ユーザーがパートナー連携設定画面にアクセス
When 有効な6桁の連携コードを入力
And 検証ボタンをクリック
Then 連携相手の情報が表示される
And 確認後にカップル関係が確立される

Given ユーザーがパートナー連携設定画面にアクセス
When 無効な連携コードを入力
Then エラーメッセージが表示される
And 連携が阻止される
```

## 5. リスクとトレードオフ

### セキュリティリスク
- **不正連携**: 暗号化された連携コード
- **なりすまし**: 連携相手の確認
- **情報漏洩**: 適切なデータ保護措置

### UXリスク
- **複雑な連携**: 分かりやすい説明とガイダンス
- **QRスキャン**: カメラ権限の適切な処理
- **エラー処理**: 適切なエラーメッセージ

### 技術リスク
- **QRコード生成**: 適切なライブラリの使用
- **カメラアクセス**: ブラウザ互換性の考慮
- **ネットワーク**: タイムアウト設定とリトライ機能

## 6. 拡張余地

### 短期拡張
- **連携履歴**: 過去の連携履歴の表示
- **連携状態**: リアルタイム連携状態の表示
- **連携通知**: 連携完了の通知機能

### 中期拡張
- **グループ連携**: 複数ユーザーとの連携
- **連携テンプレート**: 事前定義された連携設定
- **連携分析**: 連携パターンの分析

### 長期拡張
- **生体認証**: 指紋・顔認証による連携
- **ブロックチェーン**: 分散型連携管理
- **AI連携**: AIによる最適な連携方法の提案

## 7. 実装ガイドライン

### 技術スタック
- **フロントエンド**: React 18 + TypeScript + Tailwind CSS
- **状態管理**: Zustand
- **フォーム管理**: React Hook Form + Zod
- **QRコード**: qrcode.js
- **カメラ**: getUserMedia API
- **HTTP クライアント**: Axios

### コンポーネント設計
```typescript
// メインコンポーネント
interface PartnerLinkageProps {
  userId: string;
  onSuccess: (coupleId: string) => void;
  onError: (error: string) => void;
}

// フォームバリデーション
const linkageSchema = z.object({
  invitationCode: z.string().length(6, '6桁の数字を入力してください').regex(/^\d{6}$/, '数字のみ入力してください')
});

// QRコード生成
const generateQRCode = async (userId: string): Promise<string> => {
  const invitationData = await createInvitation(userId);
  return QRCode.toDataURL(invitationData.invitationCode);
};
```

### スタイリング
```css
/* レスポンシブデザイン */
.linkage-container {
  @apply max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md;
}

.qr-code-section {
  @apply text-center p-6 border-2 border-dashed border-gray-300 rounded-lg;
}

.invitation-code-input {
  @apply w-full p-4 text-center text-2xl font-mono border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none;
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .linkage-container {
    @apply bg-gray-800;
  }
  .qr-code-section {
    @apply border-gray-600;
  }
  .invitation-code-input {
    @apply border-gray-600 bg-gray-700 text-white;
  }
}
```

## 8. 日本語サンプルデータ

### カップル招待データ
```json
{
  "coupleInvitations": [
    {
      "invitationId": "inv_001",
      "userId": "usr_001",
      "invitationType": "qr",
      "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "invitationCode": "123456",
      "invitationLink": "https://coupleplan.app/link/abc123def456",
      "expiresAt": "2025-01-28T10:00:00Z",
      "status": "active",
      "createdAt": "2025-01-27T10:00:00Z"
    },
    {
      "invitationId": "inv_002",
      "userId": "usr_002",
      "invitationType": "link",
      "invitationCode": "789012",
      "invitationLink": "https://coupleplan.app/link/def456ghi789",
      "expiresAt": "2025-01-28T10:00:00Z",
      "status": "active",
      "createdAt": "2025-01-27T10:00:00Z"
    },
    {
      "invitationId": "inv_003",
      "userId": "usr_003",
      "invitationType": "code",
      "invitationCode": "345678",
      "expiresAt": "2025-01-28T10:00:00Z",
      "status": "used",
      "createdAt": "2025-01-27T10:00:00Z"
    },
    {
      "invitationId": "inv_004",
      "userId": "usr_004",
      "invitationType": "qr",
      "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "invitationCode": "901234",
      "invitationLink": "https://coupleplan.app/link/ghi789jkl012",
      "expiresAt": "2025-01-28T10:00:00Z",
      "status": "active",
      "createdAt": "2025-01-27T10:00:00Z"
    },
    {
      "invitationId": "inv_005",
      "userId": "usr_005",
      "invitationType": "link",
      "invitationCode": "567890",
      "invitationLink": "https://coupleplan.app/link/jkl012mno345",
      "expiresAt": "2025-01-28T10:00:00Z",
      "status": "expired",
      "createdAt": "2025-01-26T10:00:00Z"
    }
  ]
}
```

### カップル関係データ
```json
{
  "couples": [
    {
      "coupleId": "cp_001",
      "userId1": "usr_001",
      "userId2": "usr_002",
      "status": "active",
      "createdAt": "2025-01-27T10:00:00Z",
      "invitationId": "inv_001"
    },
    {
      "coupleId": "cp_002",
      "userId1": "usr_003",
      "userId2": "usr_004",
      "status": "active",
      "createdAt": "2025-01-27T10:00:00Z",
      "invitationId": "inv_003"
    },
    {
      "coupleId": "cp_003",
      "userId1": "usr_005",
      "userId2": "usr_006",
      "status": "active",
      "createdAt": "2025-01-27T10:00:00Z",
      "invitationId": "inv_005"
    },
    {
      "coupleId": "cp_004",
      "userId1": "usr_007",
      "userId2": "usr_008",
      "status": "active",
      "createdAt": "2025-01-27T10:00:00Z",
      "invitationId": "inv_007"
    },
    {
      "coupleId": "cp_005",
      "userId1": "usr_009",
      "userId2": "usr_010",
      "status": "active",
      "createdAt": "2025-01-27T10:00:00Z",
      "invitationId": "inv_009"
    }
  ]
}
```

### 連携相手情報データ
```json
{
  "inviterInfo": [
    {
      "userId": "usr_001",
      "name": "山田太郎",
      "profileImage": "https://example.com/avatars/usr_001.jpg",
      "age": 28,
      "interests": ["映画鑑賞", "カフェ巡り", "読書", "旅行"]
    },
    {
      "userId": "usr_002",
      "name": "佐藤花子",
      "profileImage": "https://example.com/avatars/usr_002.jpg",
      "age": 25,
      "interests": ["料理", "ヨガ", "アート", "音楽"]
    },
    {
      "userId": "usr_003",
      "name": "田中次郎",
      "profileImage": "https://example.com/avatars/usr_003.jpg",
      "age": 30,
      "interests": ["スポーツ", "ゲーム", "バーベキュー", "ドライブ"]
    },
    {
      "userId": "usr_004",
      "name": "渡辺雪",
      "profileImage": "https://example.com/avatars/usr_004.jpg",
      "age": 22,
      "interests": ["写真", "インスタ映え", "ショッピング", "スイーツ"]
    },
    {
      "userId": "usr_005",
      "name": "鈴木明",
      "profileImage": "https://example.com/avatars/usr_005.jpg",
      "age": 35,
      "interests": ["ワイン", "グルメ", "温泉", "歴史"]
    }
  ]
}
```

### 連携状態データ
```json
{
  "linkageStatus": [
    {
      "status": "generating",
      "label": "QRコード生成中",
      "description": "QRコードを生成しています。しばらくお待ちください。",
      "icon": "loading",
      "color": "blue"
    },
    {
      "status": "ready",
      "label": "連携準備完了",
      "description": "パートナーにQRコードをスキャンしてもらうか、連携コードを共有してください。",
      "icon": "check",
      "color": "green"
    },
    {
      "status": "scanning",
      "label": "QRコードスキャン中",
      "description": "カメラでQRコードをスキャンしています。",
      "icon": "camera",
      "color": "blue"
    },
    {
      "status": "verifying",
      "label": "連携コード検証中",
      "description": "連携コードを検証しています。",
      "icon": "loading",
      "color": "blue"
    },
    {
      "status": "confirming",
      "label": "連携確認中",
      "description": "連携相手の情報を確認してください。",
      "icon": "user",
      "color": "yellow"
    },
    {
      "status": "completed",
      "label": "連携完了",
      "description": "パートナーとの連携が完了しました。",
      "icon": "check-circle",
      "color": "green"
    },
    {
      "status": "error",
      "label": "連携エラー",
      "description": "連携中にエラーが発生しました。",
      "icon": "error",
      "color": "red"
    },
    {
      "status": "expired",
      "label": "連携期限切れ",
      "description": "連携の有効期限が切れました。",
      "icon": "clock",
      "color": "gray"
    }
  ]
}
```

### エラーメッセージ
```json
{
  "errorMessages": {
    "invitationCode": {
      "required": "連携コードを入力してください",
      "invalid": "6桁の数字を入力してください",
      "expired": "連携コードの有効期限が切れています",
      "used": "この連携コードは既に使用されています",
      "notFound": "連携コードが見つかりません"
    },
    "qrCode": {
      "generationFailed": "QRコードの生成に失敗しました",
      "scanFailed": "QRコードのスキャンに失敗しました",
      "invalid": "有効なQRコードをスキャンしてください",
      "expired": "QRコードの有効期限が切れています"
    },
    "invitationLink": {
      "generationFailed": "連携リンクの生成に失敗しました",
      "invalid": "有効な連携リンクを入力してください",
      "expired": "連携リンクの有効期限が切れています",
      "used": "この連携リンクは既に使用されています"
    },
    "camera": {
      "permissionDenied": "カメラの使用が許可されていません",
      "notAvailable": "カメラが利用できません",
      "scanError": "スキャン中にエラーが発生しました"
    },
    "general": {
      "networkError": "ネットワークエラーが発生しました",
      "serverError": "サーバーエラーが発生しました",
      "timeout": "タイムアウトが発生しました",
      "unknown": "不明なエラーが発生しました"
    }
  }
}
```

### 成功メッセージ
```json
{
  "successMessages": {
    "qrCodeGenerated": "QRコードが正常に生成されました",
    "invitationLinkGenerated": "連携リンクが正常に生成されました",
    "invitationCodeGenerated": "連携コードが正常に生成されました",
    "qrCodeScanned": "QRコードが正常にスキャンされました",
    "invitationCodeVerified": "連携コードが正常に検証されました",
    "coupleCreated": "パートナーとの連携が完了しました",
    "linkageCompleted": "連携が正常に完了しました"
  }
}
```

## 9. 最終チェックリスト

### 機能要件
- [ ] QRコード生成機能が正常に動作する
- [ ] 連携リンク生成機能が正常に動作する
- [ ] 連携コード入力機能が正常に動作する
- [ ] QRスキャン機能が正常に動作する
- [ ] カップル関係確立機能が正常に動作する

### 非機能要件
- [ ] レスポンシブデザインが実装されている
- [ ] アクセシビリティ（WCAG 2.1 AA）に準拠している
- [ ] パフォーマンス要件を満たしている
- [ ] セキュリティ要件が実装されている
- [ ] エラー率が許容範囲内である

### ユーザビリティ
- [ ] 直感的なUI/UXが実装されている
- [ ] 適切なフィードバックが提供されている
- [ ] 連携手順が分かりやすい
- [ ] エラーメッセージが分かりやすい
- [ ] キーボード操作が可能である

### セキュリティ
- [ ] 連携コードが適切に暗号化されている
- [ ] HTTPS通信が強制されている
- [ ] 認証・認可が適切に実装されている
- [ ] 連携履歴が記録されている
- [ ] データ保護措置が実装されている

### 技術要件
- [ ] QRコード生成が適切に実装されている
- [ ] カメラアクセスが適切に処理されている
- [ ] 連携コード検証が適切に実装されている
- [ ] エラーハンドリングが適切に実装されている
- [ ] タイムアウト処理が適切に実装されている

---

**作成日**: 2025年1月27日  
**バージョン**: 1.0  
**作成者**: ソフトウェアエンジニア・UX/UIデザイナー  
**承認者**: [承認者名]  
**レビュー者**: [レビュー者名]
