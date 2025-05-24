import { NextRequest, NextResponse } from 'next/server';

// 簡易的なレート制限実装（本番環境では Redis などを使用推奨）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest): NextResponse {
  // セキュリティヘッダーの設定
  const response = NextResponse.next();

  // レート制限の実装（開発環境では無効化）
  if (request.nextUrl.pathname.startsWith('/api/') && process.env.NODE_ENV !== 'development') {
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const key = `${ip}-${request.nextUrl.pathname}`;
    const now = Date.now();

    // 5分間のウィンドウで最大リクエスト数（環境に応じて調整）
    const windowMs = 5 * 60 * 1000; // 5分
    const maxRequests = process.env.NODE_ENV === 'production' ? 100 : 1000; // 開発時は緩い制限

    const record = rateLimitMap.get(key);

    if (!record || record.resetTime < now) {
      // 新しいウィンドウ
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    } else {
      // 既存のウィンドウ内
      record.count++;

      if (record.count > maxRequests) {
        return NextResponse.json(
          { error: 'レート制限に達しました。しばらく待ってから再試行してください。' },
          { status: 429 }
        );
      }
    }

    // レスポンスヘッダーにレート制限情報を追加
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', (maxRequests - (record?.count || 1)).toString());
    response.headers.set('X-RateLimit-Reset', (record?.resetTime || now + windowMs).toString());
  }

  // セキュリティヘッダー
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    // 静的ファイルとNext.js内部ファイルを除外
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.ico).*)',
  ],
};
