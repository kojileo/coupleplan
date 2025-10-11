# COMMON-003: ヘルプセンター画面 実装指示書

## 1. 画面概要
- ステータス: 実装済プロト
- ゴール:
  - FAQ やガイドを通じて自己解決率を高める
  - 問い合わせチャネルへの導線を整理する
  - 障害・メンテナンス情報を即座に提示する

## 2. 主なセクション
- 検索バーと人気キーワード
- カテゴリ別FAQカード
- ガイド/チュートリアル動画リンク
- 問い合わせフォーム/チャットへの導線
- ステータスアラート（稼働状況通知）

## 3. UIメモ
- ベーススタイルは `css/common.css` / `css/components.css` に準拠
- モバイルビューは `css/responsive.css` のブレークポイント (max-width: 768px) を利用
- 遷移には `js/navigation.js` の `navigateTo`/`goBack` を活用

## 4. 操作と遷移
| 要素 | 遷移/動作 | 備考 |
|------|-----------|------|
| 戻るボタン | history.back() | COMMON-001 などへ戻る |
| FAQカード | 詳細モーダル / 別画面 | Article ID でルーティング |
| サポートへ連絡 | support@coupleplan.app への mailto | 将来的にチケットAPIと連携 |

## 5. API / データ連携
- **GET /api/v1/help/categories**: カテゴリ一覧
- **GET /api/v1/help/articles?keyword=**: FAQ検索
- **POST /api/v1/help/contact**: 問い合わせ送信

## 6. テスト観点
- 検索キーワード入力でサジェストが表示される
- ステータスアラートが重大度で色分けされる
- 問い合わせ送信後にサンクスメッセージが表示される

## 7. 実装メモ
- 記事データはCMS (Contentful等) との連携を想定
- 障害情報は Statuspage API など外部連携を検討
- チャットサポート導入時はWebSocket接続を別途設計

