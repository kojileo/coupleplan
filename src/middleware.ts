import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { authCircuitBreaker } from '@/lib/circuit-breaker';
import { authStopManager } from '@/lib/auth-stop';

// 簡易的なレート制限実装（本番環境では Redis などを使用推奨）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // セキュリティヘッダーの設定
  const response = NextResponse.next();

  // 認証が必要なページのパスのみチェック
  const protectedPaths = ['/dashboard', '/profile', '/settings'];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  // グローバル停止フラグをチェック
  if (authStopManager.isAuthStopped()) {
    console.warn('Middleware - 認証システムが停止中です。認証チェックをスキップします。');
    return response;
  }

  // 緊急対策：認証チェックを完全に無効化
  // リフレッシュトークンエラーの無限ループを防ぐため
  if (false && isProtectedPath) {
    // サーキットブレーカーがオープンの場合は認証チェックをスキップ
    if (authCircuitBreaker.isOpen()) {
      console.warn('Middleware - サーキットブレーカーがオープンです。認証チェックをスキップします。');
      return response;
    }

    try {
      const supabase = createMiddlewareClient({ req: request, res: response });

      // セッションを取得
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        // レート制限エラーの場合は警告のみ表示し、リダイレクトは行わない
        if (sessionError.message?.includes('rate limit') || sessionError.message?.includes('over_request_rate_limit')) {
          console.warn('Middleware - Supabaseレート制限に達しています。認証チェックをスキップします。');
          return response; // そのまま通す
        }
        
        // リフレッシュトークンエラーの場合はサーキットブレーカーをトリガー
        if (sessionError.message?.includes('refresh_token_not_found') || sessionError.message?.includes('Invalid Refresh Token')) {
          console.warn('Middleware - リフレッシュトークンが見つかりません。サーキットブレーカーをトリガーします。');
          authCircuitBreaker.recordFailure();
          
          // サーキットブレーカーがオープンになった場合は認証チェックをスキップ
          if (authCircuitBreaker.isOpen()) {
            console.warn('Middleware - サーキットブレーカーがオープンになりました。認証チェックをスキップします。');
            return response;
          }
          
          const redirectUrl = new URL('/login', request.url);
          redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
          redirectUrl.searchParams.set('clearSession', 'true');
          return NextResponse.redirect(redirectUrl);
        }
        
        console.error('Middleware - セッション取得エラー:', sessionError);
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      if (!session) {
        console.log('Middleware - セッションなし、ログインページにリダイレクト');
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      console.log('Middleware - セッション確認済み、アクセス許可');
      // 成功を記録
      authCircuitBreaker.recordSuccess();
    } catch (error) {
      console.error('認証チェックエラー:', error);
      // レート制限エラーの場合はそのまま通す
      if (error instanceof Error && (error.message.includes('rate limit') || error.message.includes('over_request_rate_limit'))) {
        console.warn('Middleware - レート制限エラー、認証チェックをスキップします');
        return response;
      }
      
      // その他のエラーもサーキットブレーカーに記録
      authCircuitBreaker.recordFailure();
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

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
