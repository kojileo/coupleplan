# CouplePlan テストケース

## ドキュメント情報

- **作成日**: 2025年10月11日
- **バージョン**: 1.0.0
- **親ドキュメント**: [TEST_PLAN.md](../TEST_PLAN.md)

---

## 目次

1. [テストケーステンプレート](#1-テストケーステンプレート)
2. [認証機能テストケース](#2-認証機能テストケース)
3. [UC-001: AIデートプラン テストケース](#3-uc-001-aiデートプラン-テストケース)
4. [UC-007: マネタイズ テストケース](#4-uc-007-マネタイズ-テストケース)
5. [共通機能テストケース](#5-共通機能テストケース)

---

## 1. テストケーステンプレート

### 1.1 テストケース記述フォーマット

| 項目                | 説明                                                |
| ------------------- | --------------------------------------------------- |
| **Test ID**         | 一意のテストID（例: TC-AUTH-001）                   |
| **Test Name**       | テスト名（日本語）                                  |
| **Priority**        | P0（Critical）, P1（High）, P2（Medium）, P3（Low） |
| **Test Type**       | Unit / Integration / E2E / Performance / Security   |
| **Preconditions**   | 前提条件                                            |
| **Test Steps**      | テスト手順                                          |
| **Test Data**       | テストデータ                                        |
| **Expected Result** | 期待結果                                            |
| **Actual Result**   | 実際の結果（実行時に記入）                          |
| **Status**          | Pass / Fail / Blocked / Skip                        |
| **Notes**           | 備考                                                |

### 1.2 テストケース例

```markdown
### TC-AUTH-001: 正常なログイン

**Priority**: P0 (Critical)  
**Test Type**: E2E  
**Preconditions**:

- ユーザーアカウントが登録済み
- ログアウト状態

**Test Steps**:

1. ログイン画面に遷移
2. メールアドレス入力: test@example.com
3. パスワード入力: Test1234!
4. 「ログイン」ボタンをクリック

**Expected Result**:

- ダッシュボード画面に遷移
- ユーザー名が表示される
- エラーメッセージが表示されない

**Test Data**:

- Email: test@example.com
- Password: Test1234!

**Status**: Pass  
**Notes**: -
```

---

## 2. 認証機能テストケース

### 2.1 ユーザー登録（Sign Up）

#### TC-AUTH-001: 正常な新規登録

**Priority**: P0 (Critical)  
**Test Type**: E2E

**Preconditions**:

- 新規ユーザー（未登録のメールアドレス）

**Test Steps**:

1. `/signup` に遷移
2. メールアドレス入力: newuser@example.com
3. パスワード入力: Test1234!
4. パスワード確認入力: Test1234!
5. 「アカウント作成」ボタンをクリック
6. 受信メールの認証リンクをクリック

**Expected Result**:

- メール認証画面に遷移
- 「認証メールを送信しました」メッセージ表示
- メール認証後、ログイン可能になる

**Test Data**:

```json
{
  "email": "newuser@example.com",
  "password": "Test1234!"
}
```

**Status**: -  
**Notes**: -

---

#### TC-AUTH-002: 既存メールアドレスでの登録

**Priority**: P0 (Critical)  
**Test Type**: Unit

**Preconditions**:

- test@example.com は既に登録済み

**Test Steps**:

1. `/signup` に遷移
2. メールアドレス入力: test@example.com
3. パスワード入力: Test1234!
4. 「アカウント作成」ボタンをクリック

**Expected Result**:

- エラーメッセージ表示: 「このメールアドレスは既に使用されています」
- アカウントが作成されない

**Status**: -  
**Notes**: -

---

#### TC-AUTH-003: パスワード強度不足

**Priority**: P1 (High)  
**Test Type**: Unit

**Test Steps**:

1. パスワード入力: "123" （8文字未満）
2. バリデーション実行

**Expected Result**:

- エラーメッセージ: 「パスワードは8文字以上で入力してください」

**Test Data**:
| パスワード | 期待結果 |
|----------|---------|
| "123" | エラー: 8文字未満 |
| "password" | エラー: 大文字なし |
| "PASSWORD123" | エラー: 小文字なし |
| "Password" | エラー: 数字なし |
| "Password123" | ✅ 成功 |

**Status**: -  
**Notes**: -

---

### 2.2 ログイン

#### TC-AUTH-010: 正常なログイン

**Priority**: P0 (Critical)  
**Test Type**: E2E

**Preconditions**:

- ユーザーアカウント登録済み
- メール認証完了
- ログアウト状態

**Test Steps**:

1. `/login` に遷移
2. メールアドレス入力: test@example.com
3. パスワード入力: Test1234!
4. 「ログイン」ボタンをクリック

**Expected Result**:

- `/dashboard` に遷移
- ユーザー名が表示される
- セッションが確立される

**Status**: -  
**Notes**: -

---

#### TC-AUTH-011: 誤ったパスワードでのログイン

**Priority**: P0 (Critical)  
**Test Type**: E2E

**Test Steps**:

1. `/login` に遷移
2. メールアドレス入力: test@example.com
3. パスワード入力: WrongPassword123
4. 「ログイン」ボタンをクリック

**Expected Result**:

- エラーメッセージ: 「メールアドレスまたはパスワードが正しくありません」
- ログイン画面に留まる

**Status**: -  
**Notes**: -

---

#### TC-AUTH-012: 未認証アカウントでのログイン

**Priority**: P1 (High)  
**Test Type**: E2E

**Preconditions**:

- アカウント登録済みだがメール未認証

**Test Steps**:

1. `/login` に遷移
2. 未認証アカウントの認証情報でログイン試行

**Expected Result**:

- エラーメッセージ: 「メールアドレスの認証が完了していません」
- 認証メール再送オプション表示

**Status**: -  
**Notes**: -

---

### 2.3 パスワードリセット

#### TC-AUTH-020: パスワードリセットフロー

**Priority**: P1 (High)  
**Test Type**: E2E

**Test Steps**:

1. `/forgot-password` に遷移
2. メールアドレス入力: test@example.com
3. 「リセットリンクを送信」ボタンをクリック
4. 受信メールのリセットリンクをクリック
5. 新しいパスワード入力: NewPassword123!
6. パスワード確認入力: NewPassword123!
7. 「パスワードを変更」ボタンをクリック
8. 新しいパスワードでログイン試行

**Expected Result**:

- 各ステップでSuccess メッセージ表示
- 新しいパスワードでログイン成功

**Status**: -  
**Notes**: -

---

### 2.4 パートナー連携

#### TC-AUTH-030: 招待コード生成

**Priority**: P1 (High)  
**Test Type**: E2E

**Preconditions**:

- ユーザーAがログイン済み
- パートナー未連携

**Test Steps**:

1. `/dashboard/partner-linkage` に遷移
2. 「招待コードを生成」ボタンをクリック

**Expected Result**:

- 6桁の招待コード表示
- コードの有効期限表示（24時間）
- コピーボタン表示

**Status**: -  
**Notes**: -

---

#### TC-AUTH-031: 招待コードでの連携

**Priority**: P1 (High)  
**Test Type**: E2E

**Preconditions**:

- ユーザーAが招待コード生成済み
- ユーザーBがログイン済み

**Test Steps**:

1. ユーザーBで `/dashboard/partner-linkage` に遷移
2. 招待コード入力: (ユーザーAが生成したコード)
3. 「連携する」ボタンをクリック

**Expected Result**:

- 成功メッセージ: 「パートナーと連携しました」
- Couple レコードが作成される
- 双方のダッシュボードにパートナー情報表示

**Status**: -  
**Notes**: -

---

#### TC-AUTH-032: 無効な招待コード

**Priority**: P2 (Medium)  
**Test Type**: Integration

**Test Steps**:

1. 招待コード入力: "INVALID"
2. 「連携する」ボタンをクリック

**Expected Result**:

- エラーメッセージ: 「招待コードが無効です」

**Test Data**:
| コード | 期待結果 |
|-------|---------|
| "INVALID" | エラー: 存在しない |
| "(24時間経過したコード)" | エラー: 期限切れ |
| "(既に使用済みのコード)" | エラー: 使用済み |

**Status**: -  
**Notes**: -

---

## 3. UC-001: AIデートプラン テストケース

### 3.1 プラン生成（基本）

#### TC-UC001-001: 正常なプラン生成

**Priority**: P0 (Critical)  
**Test Type**: E2E

**Preconditions**:

- ユーザーがログイン済み
- Gemini API が正常稼働

**Test Steps**:

1. `/dashboard/plans/create` に遷移
2. フォーム入力:
   - 予算: 10000
   - エリア: tokyo
   - 好み: レストラン、映画
3. 「プランを生成」ボタンをクリック
4. AI生成中画面で待機
5. プラン提案画面で結果確認

**Expected Result**:

- 生成時間 < 30秒
- プラン表示（タイトル、3-5アイテム）
- 予算合計 ≤ 10000円
- 全アイテムに店舗名・住所・緯度経度あり

**Test Data**:

```json
{
  "budget": 10000,
  "area": "tokyo",
  "preferences": ["restaurant", "movie"],
  "date": "2025-10-20",
  "time": "18:00"
}
```

**Status**: -  
**Notes**: -

---

#### TC-UC001-002: 最小予算でのプラン生成

**Priority**: P1 (High)  
**Test Type**: Integration

**Test Steps**:

1. 予算: 1000円 でプラン生成

**Expected Result**:

- プラン生成成功
- 予算内のアイテムのみ提案
- 警告メッセージ: 「予算が少ないため、選択肢が限られます」

**Status**: -  
**Notes**: -

---

#### TC-UC001-003: 最大予算でのプラン生成

**Priority**: P2 (Medium)  
**Test Type**: Integration

**Test Steps**:

1. 予算: 100000円 でプラン生成

**Expected Result**:

- プラン生成成功
- 高級レストラン・施設を含むプラン提案

**Status**: -  
**Notes**: -

---

### 3.2 プラン生成（エラーケース）

#### TC-UC001-010: AI API タイムアウト

**Priority**: P0 (Critical)  
**Test Type**: Integration

**Preconditions**:

- Gemini API レスポンスタイムアウト（30秒超）をシミュレート

**Test Steps**:

1. プラン生成実行
2. 30秒経過を待機

**Expected Result**:

- タイムアウトエラーメッセージ表示
- 「もう一度試す」ボタン表示
- ユーザーデータは保持される

**Status**: -  
**Notes**: -

---

#### TC-UC001-011: AI API レート制限

**Priority**: P0 (Critical)  
**Test Type**: Integration

**Preconditions**:

- Gemini API レート制限到達（1分間10リクエスト超）

**Test Steps**:

1. 短時間に11回プラン生成を試行

**Expected Result**:

- 11回目は待機
- リトライ機構が動作
- エラーメッセージ: 「しばらくお待ちください」

**Status**: -  
**Notes**: -

---

### 3.3 プラン保存・編集

#### TC-UC001-020: プラン保存

**Priority**: P1 (High)  
**Test Type**: E2E

**Test Steps**:

1. プラン生成完了
2. プラン詳細画面で「このプランを保存」ボタンをクリック

**Expected Result**:

- データベースに保存される
- 成功メッセージ表示
- 保存済みプラン一覧に表示される

**Status**: -  
**Notes**: -

---

#### TC-UC001-021: プランカスタマイズ

**Priority**: P1 (High)  
**Test Type**: E2E

**Test Steps**:

1. 保存済みプランを開く
2. カスタマイズビューに遷移
3. アイテム編集:
   - 予算変更: 3000円 → 4000円
   - 時間変更: 60分 → 90分
4. 「変更を保存」ボタンをクリック

**Expected Result**:

- 変更が反映される
- 予算合計が自動再計算される
- 所要時間合計が自動再計算される

**Status**: -  
**Notes**: -

---

#### TC-UC001-022: アイテム追加

**Priority**: P1 (High)  
**Test Type**: E2E

**Test Steps**:

1. カスタマイズビューで「アイテムを追加」ボタンをクリック
2. 新しいアイテム入力:
   - 名前: カフェ
   - 予算: 1000円
   - 時間: 30分
3. 「追加」ボタンをクリック

**Expected Result**:

- アイテムがリストに追加される
- order_indexが自動設定される
- 予算・時間の合計が更新される

**Status**: -  
**Notes**: -

---

#### TC-UC001-023: アイテム削除

**Priority**: P2 (Medium)  
**Test Type**: E2E

**Test Steps**:

1. カスタマイズビューでアイテムの「削除」ボタンをクリック
2. 確認ダイアログで「削除する」を選択

**Expected Result**:

- アイテムが削除される
- 予算・時間の合計が更新される
- 最低1つのアイテムは残る（全削除不可）

**Status**: -  
**Notes**: -

---

### 3.4 プラン確定

#### TC-UC001-030: プラン確定

**Priority**: P1 (High)  
**Test Type**: E2E

**Test Steps**:

1. カスタマイズ完了後、「このプランで確定」ボタンをクリック
2. 確認ダイアログで「確定する」を選択

**Expected Result**:

- プランステータスが "confirmed" に変更
- ダッシュボードに確定済みプランとして表示
- 編集不可になる（閲覧のみ）

**Status**: -  
**Notes**: -

---

## 4. UC-007: マネタイズ テストケース

### 4.1 利用制限

#### TC-UC007-001: 日次制限チェック

**Priority**: P0 (Critical)  
**Test Type**: Integration

**Preconditions**:

- Freeプランユーザー
- 本日の利用回数: 0回

**Test Steps**:

1. AIプラン生成を3回実行
2. 4回目の生成を試行

**Expected Result**:

- 1-3回目: 正常に生成
- 4回目: 制限到達モーダル表示
  - 「本日の作成回数に達しました」
  - 「明日また3回作成できます」
  - Premium案内表示

**Status**: -  
**Notes**: -

---

#### TC-UC007-002: 月次制限チェック

**Priority**: P0 (Critical)  
**Test Type**: Integration

**Preconditions**:

- Freeプランユーザー
- 今月の利用回数: 9回

**Test Steps**:

1. AIプラン生成を1回実行（10回目）
2. 2回目の生成を試行

**Expected Result**:

- 10回目: 正常に生成
- 11回目: 制限到達モーダル表示
  - 「今月の作成回数に達しました」
  - 「来月にリセットされます」
  - Premium案内表示

**Status**: -  
**Notes**: -

---

#### TC-UC007-003: 制限リセット（日次）

**Priority**: P1 (High)  
**Test Type**: Integration

**Preconditions**:

- 本日3回利用済み（日次制限到達）

**Test Steps**:

1. 日付を翌日に変更（テスト環境）
2. AIプラン生成を試行

**Expected Result**:

- プラン生成成功
- 残り回数: 日次 2/3、月次 更新

**Status**: -  
**Notes**: タイムゾーン JST で動作確認

---

#### TC-UC007-004: 制限リセット（月次）

**Priority**: P1 (High)  
**Test Type**: Integration

**Preconditions**:

- 今月10回利用済み（月次制限到達）

**Test Steps**:

1. 日付を翌月1日に変更（テスト環境）
2. AIプラン生成を試行

**Expected Result**:

- プラン生成成功
- 残り回数: 日次 2/3、月次 9/10

**Status**: -  
**Notes**: -

---

### 4.2 サブスクリプション

#### TC-UC007-010: Premium案内表示

**Priority**: P1 (High)  
**Test Type**: E2E

**Preconditions**:

- Freeプランユーザー

**Test Steps**:

1. ダッシュボードで「Premium」リンクをクリック
2. Premium案内ページを確認

**Expected Result**:

- 価格表示: ¥480/月
- 機能比較表示（Free vs Premium）
- 「近日公開予定」メッセージ表示（Phase 1.1）

**Status**: -  
**Notes**: Phase 1.2でStripe連携後にテスト更新

---

#### TC-UC007-011: 使用状況表示

**Priority**: P2 (Medium)  
**Test Type**: E2E

**Test Steps**:

1. ダッシュボードで使用状況カードを確認

**Expected Result**:

- 今日の残り回数表示: X/3
- 今月の残り回数表示: Y/10
- プログレスバー表示

**Status**: -  
**Notes**: -

---

### 4.3 データ整合性

#### TC-UC007-020: 使用履歴記録

**Priority**: P0 (Critical)  
**Test Type**: Integration

**Test Steps**:

1. AIプラン生成を1回実行
2. データベースの `plan_generation_usage` テーブルを確認

**Expected Result**:

- 新しいレコードが作成される
- user_id、plan_id、generated_at が正しく記録
- generation_date、generation_month が自動生成

**Status**: -  
**Notes**: -

---

#### TC-UC007-021: 同時リクエスト処理

**Priority**: P1 (High)  
**Test Type**: Integration

**Test Steps**:

1. 2つのブラウザタブで同時にプラン生成を実行

**Expected Result**:

- 両方とも正常に処理される
- 使用回数が正確にカウントされる（2回増加）
- データ競合が発生しない

**Status**: -  
**Notes**: -

---

## 5. 共通機能テストケース

### 5.1 ダッシュボード

#### TC-COMMON-001: ダッシュボード表示

**Priority**: P0 (Critical)  
**Test Type**: E2E

**Preconditions**:

- ユーザーがログイン済み

**Test Steps**:

1. `/dashboard` に遷移

**Expected Result**:

- ユーザー名表示
- 6つの機能カード表示:
  - AIデートプラン
  - 共同編集
  - Date Canvas
  - AI仲裁
  - ポータル
  - Premium
- 通知エリア表示

**Status**: -  
**Notes**: -

---

### 5.2 ナビゲーション

#### TC-COMMON-010: グローバルナビゲーション

**Priority**: P1 (High)  
**Test Type**: E2E

**Test Steps**:

1. 任意の画面で「ホーム」リンクをクリック

**Expected Result**:

- ダッシュボードに遷移
- ナビゲーションバーは全ページで表示

**Status**: -  
**Notes**: -

---

### 5.3 エラーハンドリング

#### TC-COMMON-020: 404エラー

**Priority**: P2 (Medium)  
**Test Type**: E2E

**Test Steps**:

1. 存在しないURL `/nonexistent` にアクセス

**Expected Result**:

- 404エラーページ表示
- 「ページが見つかりません」メッセージ
- ホームへのリンク表示

**Status**: -  
**Notes**: -

---

#### TC-COMMON-021: ネットワークエラー

**Priority**: P1 (High)  
**Test Type**: Integration

**Preconditions**:

- ネットワーク障害をシミュレート

**Test Steps**:

1. API呼び出し実行

**Expected Result**:

- エラーメッセージ: 「ネットワークエラーが発生しました」
- リトライボタン表示

**Status**: -  
**Notes**: -

---

## 6. インフラ・コンテナテストケース

### 6.1 Dockerビルド

#### TC-INFRA-001: Dockerビルド成功

**Priority**: P0 (Critical)  
**Test Type**: Integration

**Preconditions**:

- Dockerfileが存在する
- 必要な依存関係ファイル（package.json等）が存在

**Test Steps**:

1. Dockerイメージをビルド
   ```bash
   docker build -t coupleplan:test .
   ```

**Expected Result**:

- ビルドが成功する
- エラーが発生しない
- イメージサイズ < 500MB

**Status**: -  
**Notes**: マルチステージビルドで最適化

---

#### TC-INFRA-002: コンテナ起動テスト

**Priority**: P0 (Critical)  
**Test Type**: Integration

**Test Steps**:

1. コンテナを起動
   ```bash
   docker run -d -p 8080:8080 \
     -e NEXT_PUBLIC_SUPABASE_URL=xxx \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
     coupleplan:test
   ```
2. ヘルスチェック
   ```bash
   curl http://localhost:8080/api/health
   ```

**Expected Result**:

- コンテナが正常に起動
- ポート8080でリッスン
- ヘルスチェックが200 OKを返す

**Status**: -  
**Notes**: -

---

#### TC-INFRA-003: イメージサイズ最適化

**Priority**: P1 (High)  
**Test Type**: Performance

**Test Steps**:

1. イメージサイズを確認
   ```bash
   docker images coupleplan:test --format "{{.Size}}"
   ```

**Expected Result**:

- イメージサイズ < 500MB
- ベースイメージ: node:18-alpine使用
- マルチステージビルドで不要ファイル除外

**Status**: -  
**Notes**: -

---

#### TC-INFRA-004: セキュリティスキャン

**Priority**: P1 (High)  
**Test Type**: Security

**Test Steps**:

1. Trivyでスキャン
   ```bash
   docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
     aquasec/trivy image coupleplan:test
   ```

**Expected Result**:

- Critical脆弱性: 0件
- High脆弱性: < 5件
- 既知の脆弱性に対する対策実施

**Status**: -  
**Notes**: 定期的にスキャン実行（週次）

---

### 6.2 Cloud Run デプロイ

#### TC-INFRA-010: Cloud Runデプロイ成功

**Priority**: P0 (Critical)  
**Test Type**: E2E

**Test Steps**:

1. GitHub Actions経由でデプロイ実行
2. デプロイログを確認
3. Cloud Run URLにアクセス

**Expected Result**:

- デプロイが成功する
- サービスが正常に起動
- URLでアプリケーションにアクセス可能

**Status**: -  
**Notes**: -

---

#### TC-INFRA-011: Secret Manager統合

**Priority**: P0 (Critical)  
**Test Type**: Integration

**Test Steps**:

1. Secret Managerからシークレット取得
2. 環境変数として利用可能か確認

**Expected Result**:

- 全シークレットが正常に読み込まれる
- アプリケーション内でアクセス可能
- シークレットがログに出力されない

**Status**: -  
**Notes**: SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY

---

#### TC-INFRA-012: コールドスタート性能

**Priority**: P1 (High)  
**Test Type**: Performance

**Preconditions**:

- min-instances = 0 に設定

**Test Steps**:

1. 全インスタンスをシャットダウン（60秒待機）
2. 初回リクエストを送信
3. 応答時間を測定

**Expected Result**:

- コールドスタート時間 < 5秒
- アプリケーションが正常に応答

**Status**: -  
**Notes**: -

---

#### TC-INFRA-013: ウォームインスタンス性能

**Priority**: P1 (High)  
**Test Type**: Performance

**Test Steps**:

1. 既に起動しているインスタンスにリクエスト
2. 応答時間を測定

**Expected Result**:

- 応答時間 < 1秒
- レイテンシが安定

**Status**: -  
**Notes**: -

---

### 6.3 スケーリング

#### TC-INFRA-020: オートスケーリング

**Priority**: P1 (High)  
**Test Type**: Performance

**Test Steps**:

1. 負荷テストツールで100リクエスト/秒を送信
2. Cloud Consoleでインスタンス数を監視

**Expected Result**:

- 負荷に応じて自動的にスケールアウト
- 最大10インスタンス（設定値）まで増加
- 負荷減少後、自動的にスケールイン

**Status**: -  
**Notes**: max-instances=10 設定

---

#### TC-INFRA-021: コンカレンシー設定

**Priority**: P2 (Medium)  
**Test Type**: Performance

**Test Steps**:

1. 1インスタンスあたり80リクエストを同時送信
2. 処理状況を確認

**Expected Result**:

- 80リクエストまで1インスタンスで処理
- 81個目で新しいインスタンスが起動
- エラー率 < 1%

**Status**: -  
**Notes**: concurrency=80 設定

---

### 6.4 環境変数・シークレット

#### TC-INFRA-030: 環境変数の読み込み

**Priority**: P0 (Critical)  
**Test Type**: Integration

**Test Steps**:

1. アプリケーション起動
2. 環境変数が正しく読み込まれているか確認

**Expected Result**:

- 全必須環境変数が設定されている
- NEXT*PUBLIC*\* 変数がクライアント側で利用可能
- シークレットがログに出力されない

**Status**: -  
**Notes**: -

---

## 付録

### A. テストデータ

#### ユーザーアカウント

```json
{
  "validUser": {
    "email": "test@example.com",
    "password": "Test1234!",
    "name": "テストユーザー"
  },
  "premiumUser": {
    "email": "premium@example.com",
    "password": "Premium1234!",
    "name": "プレミアムユーザー"
  },
  "unverifiedUser": {
    "email": "unverified@example.com",
    "password": "Test1234!",
    "name": "未認証ユーザー"
  }
}
```

#### プランデータ

```json
{
  "validPlan": {
    "title": "東京デートプラン",
    "budget": 10000,
    "area": "tokyo",
    "items": [
      {
        "name": "イタリアンレストラン",
        "budget": 5000,
        "duration": 90,
        "order_index": 1
      },
      {
        "name": "映画館",
        "budget": 3000,
        "duration": 150,
        "order_index": 2
      },
      {
        "name": "カフェ",
        "budget": 2000,
        "duration": 60,
        "order_index": 3
      }
    ]
  }
}
```

### B. テスト実行チェックリスト

実行前:

- [ ] テスト環境の確認
- [ ] テストデータの準備
- [ ] 外部サービスのモック設定

実行中:

- [ ] テスト結果の記録
- [ ] スクリーンショット/動画キャプチャ
- [ ] ログの収集

実行後:

- [ ] バグレポート作成
- [ ] カバレッジレポート確認
- [ ] テストデータのクリーンアップ

### C. バグレポートテンプレート

```markdown
## Bug Report

**Bug ID**: BUG-XXXX  
**Title**: [簡潔なバグタイトル]  
**Severity**: Critical / High / Medium / Low  
**Priority**: P0 / P1 / P2 / P3

**Environment**:

- OS:
- Browser:
- Version:

**Steps to Reproduce**:

1.
2.
3.

**Expected Result**:

**Actual Result**:

**Screenshots**:
[添付]

**Logs**:
[添付]

**Notes**:
```

---

**最終更新**: 2025年10月11日  
**次回レビュー**: 2025年11月1日
