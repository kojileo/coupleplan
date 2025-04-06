import '@testing-library/jest-dom'
import './tests/mocks/supabase'
import { Request, Response } from 'node-fetch'

// グローバルに Request と Response を定義
global.Request = Request
global.Response = Response

// タイムゾーンを設定
process.env.TZ = 'Asia/Tokyo'

// 日付のモック - toLocaleDateStringのみをモック
const originalToLocaleDateString = Date.prototype.toLocaleDateString
Date.prototype.toLocaleDateString = function(...args) {
  // 無効な日付の場合は元のメソッドを呼び出す
  try {
    // 日付が有効かどうかを確認
    if (isNaN(this.getTime())) {
      return originalToLocaleDateString.apply(this, args)
    }
    
    const isoString = this.toISOString()
    if (isoString.includes('2024-01-01')) {
      return '2024年1月1日 18:00'
    } else if (isoString.includes('2024-01-02')) {
      return '2024年1月2日 18:00'
    } else if (isoString.includes('2024-03-20')) {
      return '2024年3月20日 15:30'
    }
  } catch (e) {
    // エラーが発生した場合（無効な日付など）
    console.warn('Date.toLocaleDateString mock error:', e)
  }
  
  // デフォルトは元のメソッドを呼び出す
  return originalToLocaleDateString.apply(this, args)
}

// NextResponse のモック
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextResponse: {
      json: (data, init) => new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init?.headers,
        },
      })
    }
  }
})

// 既存の console.error をラップして、特定のエラーメッセージをフィルタリングする
const originalConsoleError = console.error;

console.error = (...args) => {
  // 「cannot be a child of」と「ログインエラー:」を含む場合は出力しない
  if (
    args.length > 0 &&
    typeof args[0] === 'string' &&
    (args[0].includes('cannot be a child of') || args[0].includes('ログインエラー:'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// グローバルなモックの設定
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};