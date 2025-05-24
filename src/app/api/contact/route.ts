import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

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

    // Resend APIキーの確認と初期化
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'メール送信設定に問題があります。管理者にお問い合わせください。' },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // 管理者へのお問い合わせ通知メール
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@example.com';

    try {
      // 1. 管理者への通知メール
      const { data: adminEmailData, error: adminEmailError } = await resend.emails.send({
        from: fromEmail,
        to: [adminEmail],
        subject: `【お問い合わせ】${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #e91e63; padding-bottom: 10px;">
              新しいお問い合わせがあります
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">お問い合わせ詳細</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 8px 0; font-weight: bold; color: #6c757d;">お名前:</td>
                  <td style="padding: 8px 0;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 8px 0; font-weight: bold; color: #6c757d;">メールアドレス:</td>
                  <td style="padding: 8px 0;">${email}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 8px 0; font-weight: bold; color: #6c757d;">お問い合わせ種別:</td>
                  <td style="padding: 8px 0;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #6c757d; vertical-align: top;">お問い合わせ内容:</td>
                  <td style="padding: 8px 0; white-space: pre-wrap;">${message}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1976d2; margin-top: 0;">対応について</h4>
              <p style="margin: 0; color: #424242;">
                このお問い合わせに対する回答は、送信者（${email}）宛に直接メールで返信してください。
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            <p style="color: #6c757d; font-size: 12px; text-align: center;">
              送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}<br>
              Couple Plan - お問い合わせ管理システム
            </p>
          </div>
        `,
      });

      if (adminEmailError) {
        console.error('管理者メール送信エラー:', adminEmailError);
        return NextResponse.json(
          { error: 'メール送信中にエラーが発生しました。時間をおいて再度お試しください。' },
          { status: 500 }
        );
      }

      // 2. 送信者への自動返信メール
      const { data: autoReplyData, error: autoReplyError } = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: 'お問い合わせを受け付けました - Couple Plan',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e91e63; margin: 0;">Couple Plan</h1>
              <p style="color: #6c757d; margin: 5px 0;">カップルのためのデートプラン作成・共有アプリ</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">お問い合わせを受け付けました</h2>
              <p>
                ${name} 様<br><br>
                この度は、Couple Planにお問い合わせいただき、誠にありがとうございます。<br>
                以下の内容でお問い合わせを受け付けいたしました。
              </p>
            </div>
            
            <div style="background-color: #ffffff; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">受信内容</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 8px 0; font-weight: bold; color: #6c757d; width: 120px;">お問い合わせ種別:</td>
                  <td style="padding: 8px 0;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #6c757d; vertical-align: top;">お問い合わせ内容:</td>
                  <td style="padding: 8px 0; white-space: pre-wrap;">${message}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #2e7d32; margin-top: 0;">今後の流れ</h4>
              <p style="margin: 0; color: #424242;">
                お問い合わせの内容を確認の上、通常2-3営業日以内にご回答いたします。<br>
                緊急性の高いお問い合わせの場合は、優先的に対応いたします。
              </p>
            </div>
            
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #f57c00; margin-top: 0;">よくある質問</h4>
              <p style="margin: 0; color: #424242;">
                もしお問い合わせの内容がよくある質問に該当する場合は、<br>
                お問い合わせページの「よくある質問」セクションもご覧ください。
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            <div style="text-align: center;">
              <p style="color: #6c757d; font-size: 14px; margin: 0;">
                このメールは自動送信されています。<br>
                返信いただく必要はございません。
              </p>
              <p style="color: #6c757d; font-size: 12px; margin: 10px 0 0 0;">
                送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}<br>
                © 2025 Couple Plan. All rights reserved.
              </p>
            </div>
          </div>
        `,
      });

      if (autoReplyError) {
        console.error('自動返信メール送信エラー:', autoReplyError);
        // 自動返信のエラーは管理者メールが送信されていれば問題ないとする
      }

      // 成功ログ
      console.log('お問い合わせメール送信成功:', {
        name,
        email,
        subject,
        adminEmailId: adminEmailData?.id,
        autoReplyEmailId: autoReplyData?.id,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          message: 'お問い合わせを受け付けました。ご回答まで少々お待ちください。',
          success: true,
        },
        { status: 200 }
      );
    } catch (emailError) {
      console.error('Resend メール送信エラー:', emailError);
      return NextResponse.json(
        { error: 'メール送信中にエラーが発生しました。時間をおいて再度お試しください。' },
        { status: 500 }
      );
    }
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
