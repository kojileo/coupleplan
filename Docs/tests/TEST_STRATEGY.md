# CouplePlan テスト戦略詳細

## ドキュメント情報

- **作成日**: 2025年10月11日
- **バージョン**: 1.0.0
- **親ドキュメント**: [TEST_PLAN.md](../TEST_PLAN.md)

---

## 目次

1. [テストピラミッドの実装](#1-テストピラミッドの実装)
2. [テストレベル別戦略](#2-テストレベル別戦略)
3. [ベストプラクティス](#3-ベストプラクティス)
4. [テストパターン集](#4-テストパターン集)
5. [モック戦略](#5-モック戦略)
6. [非機能テスト戦略](#6-非機能テスト戦略)
7. [テスト自動化戦略](#7-テスト自動化戦略)

---

## 1. テストピラミッドの実装

### 1.1 理想的なテスト分布

```
              /\
             /  \      E2E Tests
            / 10% \    - 80 cases
           /--------\
          /          \  Integration Tests
         /    20%     \ - 200 cases
        /--------------\
       /                \ Unit Tests
      /       70%         \ - 400 cases
     /----------------------\
```

**目標比率**:

- 単体テスト: 70%（400ケース）
- 統合テスト: 20%（200ケース）
- E2Eテスト: 10%（80ケース）

### 1.2 各層の責務

#### 単体テスト（Unit Tests）

**責務**:

- 個別関数の動作検証
- ビジネスロジックの正確性
- エッジケース・エラーケースの網羅

**特徴**:

- ✅ 高速（< 10ms/test）
- ✅ 安定
- ✅ 独立
- ✅ 保守容易

**対象外**:

- ❌ 外部依存（DB, API）
- ❌ UI統合
- ❌ ビジネスフロー

#### 統合テスト（Integration Tests）

**責務**:

- モジュール間連携
- API統合
- データフロー

**特徴**:

- ⚠️ 中速（< 1秒/test）
- ⚠️ 外部依存あり（モック使用）
- ✅ 実装に近い

**対象外**:

- ❌ UI操作
- ❌ ブラウザ互換性
- ❌ E2Eフロー

#### E2Eテスト（End-to-End Tests）

**責務**:

- ユーザーフロー検証
- クロスブラウザ互換性
- 本番環境に近い検証

**特徴**:

- ⚠️ 低速（> 10秒/test）
- ⚠️ 不安定（環境依存）
- ⚠️ 保守コスト高

**焦点**:

- ✅ クリティカルパスのみ
- ✅ ビジネス価値の高い機能
- ✅ リグレッション防止

---

## 2. テストレベル別戦略

### 2.1 単体テスト戦略

#### 2.1.1 テスト対象の選定

**優先度：高**

```typescript
// ビジネスロジック
src / lib / ai - service.ts;
src / lib / plan - validation.ts;
src / lib / subscription - logic.ts;

// ユーティリティ
src / lib / utils.ts;
src / lib / validation.ts;
src / lib / date - utils.ts;

// カスタムフック
src / hooks / useRequireAuth.ts;
src / hooks / useSubscription.ts;
```

**優先度：中**

```typescript
// UIコンポーネント（ロジック部分）
src/components/features/**/*.tsx
src/components/subscription/**/*.tsx
```

**優先度：低**

```typescript
// 純粋表示コンポーネント
src/components/ui/**/*.tsx
```

#### 2.1.2 AAA（Arrange-Act-Assert）パターン

```typescript
describe('generateDatePlan', () => {
  it('should generate plan with valid input', async () => {
    // Arrange: テストデータ準備
    const input = {
      budget: 10000,
      area: 'tokyo',
      preferences: ['restaurant'],
    };

    // Act: 関数実行
    const result = await generateDatePlan(input);

    // Assert: 結果検証
    expect(result).toHaveProperty('title');
    expect(result.items).toHaveLength(3);
    expect(result.totalBudget).toBeLessThanOrEqual(10000);
  });
});
```

#### 2.1.3 テストケース設計

**正常系（Happy Path）**:

```typescript
it('should return success with valid data', () => {
  // 標準的な入力での動作
});
```

**境界値（Boundary）**:

```typescript
it('should handle minimum budget (0 yen)', () => {
  // 最小値
});

it('should handle maximum budget (1,000,000 yen)', () => {
  // 最大値
});
```

**異常系（Error Cases）**:

```typescript
it('should throw error with negative budget', () => {
  // マイナス値
});

it('should handle API timeout gracefully', () => {
  // タイムアウト
});
```

**エッジケース**:

```typescript
it('should handle empty preferences', () => {
  // 空配列
});

it('should handle special characters in input', () => {
  // 特殊文字
});
```

#### 2.1.4 カバレッジ戦略

**Statement Coverage（文カバレッジ）**: 80%以上

全ての実行文が最低1回は実行されることを保証。

**Branch Coverage（分岐カバレッジ）**: 75%以上

全てのif/else、switch、三項演算子の全分岐を実行。

```typescript
function calculateDiscount(price: number, isMember: boolean): number {
  // Branch 1: isMember === true
  // Branch 2: isMember === false
  if (isMember) {
    return price * 0.9;
  }
  return price;
}

// テストケース
describe('calculateDiscount', () => {
  it('should apply 10% discount for members', () => {
    // Branch 1
    expect(calculateDiscount(1000, true)).toBe(900);
  });

  it('should not apply discount for non-members', () => {
    // Branch 2
    expect(calculateDiscount(1000, false)).toBe(1000);
  });
});
```

**Function Coverage（関数カバレッジ）**: 80%以上

全ての関数が最低1回は呼び出されることを保証。

#### 2.1.5 モック戦略（単体テスト）

**原則**: 外部依存は全てモック化

```typescript
// ❌ Bad: 実際のAPIを呼び出す
it('should fetch user data', async () => {
  const user = await fetchUserFromAPI('user-id');
  expect(user.name).toBe('Test User');
});

// ✅ Good: APIをモック化
it('should fetch user data', async () => {
  jest.spyOn(api, 'fetchUser').mockResolvedValue({
    id: 'user-id',
    name: 'Test User',
  });

  const user = await fetchUserFromAPI('user-id');
  expect(user.name).toBe('Test User');
});
```

**モック対象**:

- 外部API（Gemini, Stripe, Supabase）
- ファイルシステム
- 時間・日付（`Date.now()`）
- ランダム値（`Math.random()`）

---

### 2.2 統合テスト戦略

#### 2.2.1 MSWによるAPIモック

**セットアップ**:

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Gemini API
  http.post('https://generativelanguage.googleapis.com/v1/*', () => {
    return HttpResponse.json({
      candidates: [
        {
          content: {
            parts: [{ text: JSON.stringify(mockPlan) }],
          },
        },
      ],
    });
  }),

  // Supabase API
  http.get('https://*.supabase.co/rest/v1/profiles', () => {
    return HttpResponse.json([mockProfile]);
  }),
];
```

```typescript
// tests/integration/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### 2.2.2 API統合テスト例

```typescript
// tests/integration/api/plans.test.ts
import { server } from '../setup';
import { http, HttpResponse } from 'msw';

describe('Plans API Integration', () => {
  it('should create plan and save to database', async () => {
    const response = await fetch('/api/plans/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budget: 10000,
        area: 'tokyo',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    // データベース保存確認
    expect(data.plan).toHaveProperty('id');
    expect(data.plan.status).toBe('draft');
  });

  it('should handle Gemini API failure', async () => {
    // 特定のリクエストのみエラーにする
    server.use(
      http.post('https://generativelanguage.googleapis.com/v1/*', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const response = await fetch('/api/plans/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget: 10000 }),
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it('should retry on rate limit', async () => {
    let callCount = 0;

    server.use(
      http.post('https://generativelanguage.googleapis.com/v1/*', () => {
        callCount++;
        if (callCount === 1) {
          return new HttpResponse(null, {
            status: 429,
            headers: { 'Retry-After': '1' },
          });
        }
        return HttpResponse.json({ success: true });
      })
    );

    const response = await fetch('/api/plans/generate', {
      method: 'POST',
      body: JSON.stringify({ budget: 10000 }),
    });

    expect(callCount).toBe(2); // リトライ確認
    expect(response.status).toBe(200);
  });
});
```

#### 2.2.3 Supabase統合テスト

```typescript
// tests/integration/supabase/auth.test.ts
import { createClient } from '@supabase/supabase-js';

describe('Supabase Auth Integration', () => {
  let supabase: any;

  beforeEach(() => {
    supabase = createClient(process.env.TEST_SUPABASE_URL!, process.env.TEST_SUPABASE_ANON_KEY!);
  });

  it('should sign up new user', async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'Test1234!',
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('test@example.com');
  });

  it('should enforce RLS policy', async () => {
    // ログインせずにプロフィール取得
    const { data, error } = await supabase.from('profiles').select('*');

    expect(error).toBeDefined(); // RLSによりエラー
    expect(data).toBeNull();
  });
});
```

---

### 2.3 E2Eテスト戦略

#### 2.3.1 Page Object Model（POM）パターン

**構造**:

```
tests/e2e/
  ├── pages/
  │   ├── LoginPage.ts
  │   ├── DashboardPage.ts
  │   ├── PlanCreatePage.ts
  │   └── PlanDetailPage.ts
  ├── fixtures/
  │   └── testData.ts
  └── specs/
      ├── auth.spec.ts
      ├── plan-generation.spec.ts
      └── partner-linkage.spec.ts
```

**実装例**:

```typescript
// tests/e2e/pages/LoginPage.ts
import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async expectLoginSuccess() {
    await expect(this.page).toHaveURL('/dashboard');
  }

  async expectLoginError(message: string) {
    await expect(this.page.locator('.error-message')).toContainText(message);
  }
}
```

```typescript
// tests/e2e/specs/auth.spec.ts
import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { testUsers } from '../fixtures/testData';

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(testUsers.valid.email, testUsers.valid.password);
    await loginPage.expectLoginSuccess();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'WrongPassword');
    await loginPage.expectLoginError('メールアドレスまたはパスワードが正しくありません');
  });
});
```

#### 2.3.2 待機戦略

**❌ Bad: Sleep待機（フレークの原因）**

```typescript
await page.click('button');
await page.waitForTimeout(5000); // 固定時間待機
```

**✅ Good: 明示的待機**

```typescript
await page.click('button');
await page.waitForSelector('.result', { state: 'visible' });
```

**待機メソッド一覧**:

| メソッド             | 用途             | 例               |
| -------------------- | ---------------- | ---------------- |
| `waitForSelector()`  | 要素の出現待機   | ローディング完了 |
| `waitForURL()`       | URL変更待機      | ページ遷移       |
| `waitForResponse()`  | API応答待機      | データ取得       |
| `waitForLoadState()` | ページロード待機 | 初期表示         |

**例**:

```typescript
// AI生成完了待機
await page.click('text=プランを生成');
await page.waitForResponse((response) => response.url().includes('/api/plans/generate'), {
  timeout: 30000,
});
await page.waitForSelector('.plan-card');
```

#### 2.3.3 フレーク対策

**原則**:

1. 明示的待機の使用
2. リトライ戦略（最大2回）
3. 隔離実行（テスト間の独立性）
4. 安定したセレクタ使用

**安定したセレクタ**:

```typescript
// ❌ Bad: 構造依存
await page.click('div > div > button:nth-child(3)');

// ❌ Bad: テキスト依存（変更に弱い）
await page.click('text=Submit');

// ✅ Good: data-testid
await page.click('[data-testid="submit-button"]');

// ✅ Good: role + name
await page.click('role=button[name="送信"]');
```

**テスト独立性**:

```typescript
test.beforeEach(async ({ page }) => {
  // 各テスト前にクリーンな状態を作る
  await page.goto('/login');
  await loginAsTestUser(page);
  await resetTestData();
});

test.afterEach(async () => {
  // テスト後のクリーンアップ
  await cleanupTestData();
});
```

#### 2.3.4 並列実行戦略

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 5 : undefined,

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

**並列実行時の注意**:

- テストデータの独立性確保（ユニークID使用）
- 共有リソースへのアクセス制御
- レート制限への配慮

---

## 3. ベストプラクティス

### 3.1 テストコードの原則

#### FIRST原則

- **F**ast: 高速
- **I**ndependent: 独立
- **R**epeatable: 再現可能
- **S**elf-Validating: 自己検証
- **T**imely: タイムリー

#### DRY（Don't Repeat Yourself）

**❌ Bad: 重複コード**

```typescript
it('test 1', () => {
  const user = { id: '1', name: 'Test', email: 'test@example.com' };
  // テストロジック
});

it('test 2', () => {
  const user = { id: '1', name: 'Test', email: 'test@example.com' };
  // テストロジック
});
```

**✅ Good: ヘルパー関数**

```typescript
const createTestUser = () => ({
  id: '1',
  name: 'Test',
  email: 'test@example.com',
});

it('test 1', () => {
  const user = createTestUser();
  // テストロジック
});

it('test 2', () => {
  const user = createTestUser();
  // テストロジック
});
```

### 3.2 テスト命名規則

**パターン**: `should [expected behavior] when [condition]`

```typescript
// ✅ Good
it('should return empty array when no plans exist', () => {});
it('should throw error when budget is negative', () => {});
it('should apply discount when user is premium member', () => {});

// ❌ Bad
it('test plan generation', () => {});
it('error case', () => {});
it('works correctly', () => {});
```

**describeのネスト**:

```typescript
describe('DatePlanService', () => {
  describe('generatePlan', () => {
    describe('with valid input', () => {
      it('should generate plan successfully', () => {});
      it('should respect budget constraint', () => {});
    });

    describe('with invalid input', () => {
      it('should throw error when budget is negative', () => {});
      it('should throw error when area is empty', () => {});
    });
  });

  describe('savePlan', () => {
    // ...
  });
});
```

### 3.3 アサーションのベストプラクティス

#### 1テスト1コンセプト

```typescript
// ❌ Bad: 複数のコンセプトを1つのテストに詰め込む
it('should handle user operations', () => {
  const user = createUser();
  expect(user.id).toBeDefined();

  updateUser(user, { name: 'New Name' });
  expect(user.name).toBe('New Name');

  deleteUser(user.id);
  expect(getUser(user.id)).toBeNull();
});

// ✅ Good: 1テスト1コンセプト
describe('User operations', () => {
  it('should create user with id', () => {
    const user = createUser();
    expect(user.id).toBeDefined();
  });

  it('should update user name', () => {
    const user = createUser();
    updateUser(user, { name: 'New Name' });
    expect(user.name).toBe('New Name');
  });

  it('should delete user', () => {
    const user = createUser();
    deleteUser(user.id);
    expect(getUser(user.id)).toBeNull();
  });
});
```

#### 具体的なアサーション

```typescript
// ❌ Bad: 曖昧
expect(result).toBeTruthy();

// ✅ Good: 具体的
expect(result).toBe(true);
expect(result.items).toHaveLength(3);
expect(result.status).toBe('success');
```

---

## 4. テストパターン集

### 4.1 非同期処理テスト

#### Promise

```typescript
it('should resolve with data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

it('should reject with error', async () => {
  await expect(fetchInvalidData()).rejects.toThrow('Invalid data');
});
```

#### Callback

```typescript
it('should call callback with result', (done) => {
  fetchDataWithCallback((error, data) => {
    expect(error).toBeNull();
    expect(data).toBeDefined();
    done();
  });
});
```

### 4.2 エラーハンドリングテスト

```typescript
describe('Error Handling', () => {
  it('should throw specific error', () => {
    expect(() => {
      processInvalidInput(-1);
    }).toThrow('Budget must be positive');
  });

  it('should return error object', async () => {
    const result = await generatePlan({ budget: -1 });
    expect(result.error).toBe('INVALID_BUDGET');
    expect(result.data).toBeNull();
  });

  it('should handle API timeout', async () => {
    jest.useFakeTimers();

    const promise = fetchDataWithTimeout(5000);
    jest.advanceTimersByTime(5000);

    await expect(promise).rejects.toThrow('Timeout');

    jest.useRealTimers();
  });
});
```

### 4.3 Reactコンポーネントテスト

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanCreateForm } from '@/components/PlanCreateForm';

describe('PlanCreateForm', () => {
  it('should render form fields', () => {
    render(<PlanCreateForm />);

    expect(screen.getByLabelText('予算')).toBeInTheDocument();
    expect(screen.getByLabelText('エリア')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '生成' })).toBeInTheDocument();
  });

  it('should show validation error for invalid budget', async () => {
    render(<PlanCreateForm />);

    const budgetInput = screen.getByLabelText('予算');
    fireEvent.change(budgetInput, { target: { value: '-1000' } });
    fireEvent.blur(budgetInput);

    await waitFor(() => {
      expect(screen.getByText('予算は0円以上で入力してください')).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<PlanCreateForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '10000' } });
    fireEvent.change(screen.getByLabelText('エリア'), { target: { value: 'tokyo' } });
    fireEvent.click(screen.getByRole('button', { name: '生成' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        budget: 10000,
        area: 'tokyo',
      });
    });
  });
});
```

---

## 5. モック戦略

### 5.1 モックの種類

| 種類     | 説明                 | 用途               |
| -------- | -------------------- | ------------------ |
| **Mock** | 振る舞いを記録・検証 | 関数呼び出しの確認 |
| **Stub** | 固定値を返す         | 外部依存の置き換え |
| **Spy**  | 実装を保持しつつ記録 | 既存関数の監視     |
| **Fake** | 簡易実装             | In-memoryDB等      |

### 5.2 Jest モック例

#### 関数モック

```typescript
// モック作成
const mockGeneratePlan = jest.fn();

// 戻り値設定
mockGeneratePlan.mockReturnValue({ id: '1', title: 'Test Plan' });

// Promise戻り値
mockGeneratePlan.mockResolvedValue({ id: '1' });

// エラー
mockGeneratePlan.mockRejectedValue(new Error('API Error'));

// 呼び出し検証
expect(mockGeneratePlan).toHaveBeenCalledTimes(1);
expect(mockGeneratePlan).toHaveBeenCalledWith({ budget: 10000 });
```

#### モジュールモック

```typescript
// __mocks__/ai-service.ts
export const generateDatePlan = jest.fn().mockResolvedValue({
  title: 'Mock Plan',
  items: [],
});

// テストファイル
jest.mock('@/lib/ai-service');

import { generateDatePlan } from '@/lib/ai-service';

it('should use mocked service', async () => {
  const result = await generateDatePlan({ budget: 10000 });
  expect(result.title).toBe('Mock Plan');
});
```

#### Spy

```typescript
import * as aiService from '@/lib/ai-service';

it('should call AI service', async () => {
  const spy = jest.spyOn(aiService, 'generateDatePlan').mockResolvedValue(mockPlan);

  await createPlan({ budget: 10000 });

  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});
```

### 5.3 MSWモック戦略

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // 成功レスポンス
  http.post('/api/plans/generate', () => {
    return HttpResponse.json({ plan: mockPlan });
  }),

  // エラーレスポンス
  http.post('/api/plans/generate', () => {
    return new HttpResponse(null, { status: 500 });
  }),

  // 遅延レスポンス
  http.post('/api/plans/generate', async () => {
    await delay(2000);
    return HttpResponse.json({ plan: mockPlan });
  }),

  // 条件付きレスポンス
  http.post('/api/plans/generate', async ({ request }) => {
    const body = await request.json();
    if (body.budget < 0) {
      return new HttpResponse(null, { status: 400 });
    }
    return HttpResponse.json({ plan: mockPlan });
  }),
];
```

---

## 6. 非機能テスト戦略

### 6.1 性能テスト

#### Lighthouse

```bash
# コマンド実行
npx lighthouse https://coupleplan-xxx.a.run.app \
  --output html \
  --output json \
  --output-path ./lighthouse-report

# スコア確認
# Performance: 90+
# Accessibility: 90+
# Best Practices: 90+
# SEO: 90+
```

#### Cloud Run固有の性能テスト

**コールドスタート時間**:

```bash
# Cloud Runインスタンスをゼロにする
gcloud run services update coupleplan-staging \
  --region=asia-northeast1 \
  --min-instances=0

# 待機（インスタンスがシャットダウン）
sleep 60

# コールドスタート時間を測定
time curl https://staging-coupleplan-xxx.a.run.app/

# 目標: < 5秒
```

**コンカレンシーテスト**:

```bash
# 同時リクエスト数を測定
ab -n 1000 -c 80 https://staging-coupleplan-xxx.a.run.app/

# 目標:
# - コンカレンシー: 80（デフォルト設定）
# - 失敗率: < 1%
```

**メモリ・CPU使用率**:

```bash
# Cloud Monitoringでリソース使用率を確認
gcloud monitoring dashboards create --config-from-file=monitoring-config.yaml

# 目標:
# - メモリ使用率: < 80%
# - CPU使用率: < 70%
```

#### カスタム性能測定

```typescript
// tests/performance/page-load.test.ts
import { test, expect } from '@playwright/test';

test('should load dashboard within 3 seconds', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000);
});
```

### 6.2 セキュリティテスト

#### XSS対策テスト

```typescript
it('should sanitize user input', () => {
  const maliciousInput = '<script>alert("XSS")</script>';
  const sanitized = sanitizeInput(maliciousInput);

  expect(sanitized).not.toContain('<script>');
  expect(sanitized).not.toContain('alert');
});
```

#### CSRF対策テスト

```typescript
it('should require CSRF token', async () => {
  const response = await fetch('/api/plans/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ budget: 10000 }),
    // CSRF token なし
  });

  expect(response.status).toBe(403);
});
```

#### RLS（Row Level Security）テスト

```typescript
it('should prevent unauthorized access', async () => {
  const supabase = createClient(/* ... */);

  // ユーザーAとしてログイン
  await supabase.auth.signInWithPassword({
    email: 'userA@example.com',
    password: 'password',
  });

  // ユーザーBのデータにアクセス試行
  const { data, error } = await supabase.from('profiles').select('*').eq('id', 'userB-id');

  expect(error).toBeDefined(); // RLSによりエラー
  expect(data).toBeNull();
});
```

### 6.3 アクセシビリティテスト

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<PlanCreateForm />);
  const results = await axe(container);

  expect(results).toHaveNoViolations();
});
```

---

## 7. テスト自動化戦略

### 7.1 CI/CD統合

#### プルリクエスト時

```yaml
# .github/workflows/pr.yml
name: PR Tests

on: pull_request

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Unit tests
        run: npm run test:unit -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

      - name: Integration tests
        run: npm run test:integration
```

#### マージ時

```yaml
# .github/workflows/main.yml
name: Main Tests

on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      # ... (Lint, Unit, Integration)

      - name: E2E tests
        run: |
          npx playwright install --with-deps
          npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

      - name: Deploy to Cloud Run Staging
        if: success()
        uses: google-github-actions/deploy-cloudrun@v1
        with:
          service: coupleplan-staging
          region: asia-northeast1
          image: gcr.io/${{ secrets.GCP_PROJECT_ID }}/coupleplan:${{ github.sha }}
          credentials: ${{ secrets.GCP_SA_KEY }}
```

### 7.2 テスト実行最適化

#### 並列実行

```javascript
// jest.config.js
module.exports = {
  maxWorkers: '50%', // CPU数の50%を使用
};
```

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 5 : undefined,
  fullyParallel: true,
});
```

#### 選択的実行

```bash
# 変更ファイルに関連するテストのみ
npm run test -- --changedSince=main

# 特定ファイルのみ
npm run test -- src/lib/ai-service.test.ts

# 特定パターン
npm run test -- --testNamePattern="should generate"
```

#### キャッシュ活用

```yaml
# .github/workflows
- uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ${{ github.workspace }}/.next/cache
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
```

### 7.3 フレーク管理

#### リトライ設定

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
});
```

#### フレーク検出

```bash
# 同じテストを複数回実行
npm run test:e2e -- --repeat-each=10
```

#### フレーク対策チェックリスト

- [ ] 明示的待機を使用（Sleep禁止）
- [ ] テストデータの独立性確保
- [ ] タイムアウト設定の適切性
- [ ] セレクタの安定性
- [ ] ネットワーク遅延の考慮

---

## 付録

### A. テストコマンド一覧

```bash
# 全テスト
npm run test:all

# 単体テスト
npm run test:unit
npm run test:unit:watch
npm run test:unit:coverage

# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:debug
npm run test:e2e:ui
npm run test:e2e:chromium

# 契約テスト
npm run test:cdc

# Lint
npm run lint
npm run lint:fix

# 型チェック
npx tsc --noEmit
```

### B. 参考リソース

- [Jest公式ドキュメント](https://jestjs.io/docs/getting-started)
- [Playwright公式ドキュメント](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/)
- [MSW](https://mswjs.io/docs/)
- [Test Pyramid - Martin Fowler](https://martinfowler.com/bliki/TestPyramid.html)

---

**最終更新**: 2025年10月11日  
**次回レビュー**: 2025年11月1日
