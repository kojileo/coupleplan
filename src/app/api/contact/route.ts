import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const requestData: unknown = await request.json();
    const { name, email, subject, message } = requestData as ContactFormData;

    // バリデーション
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: '必須項目が入力されていません' }, { status: 400 });
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'メールアドレスの形式が正しくありません' },
        { status: 400 }
      );
    }

    // ここで実際のメール送信処理を行う
    // 例: SendGrid, Resend, Gmail APIなどを使用
    console.log('お問い合わせを受信:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    // 現在はコンソールに出力するのみ
    // 実際の本番環境では、メール送信やデータベースへの保存を行う

    return NextResponse.json(
      {
        message: 'お問い合わせを受け付けました。ご回答まで少々お待ちください。',
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('お問い合わせ処理エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。時間をおいて再度お試しください。' },
      { status: 500 }
    );
  }
}

export function GET(): NextResponse {
  return NextResponse.json(
    { error: 'このエンドポイントはPOSTメソッドのみ対応しています' },
    { status: 405 }
  );
}
