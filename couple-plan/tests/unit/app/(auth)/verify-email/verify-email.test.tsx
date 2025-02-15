import { render, screen } from '@testing-library/react';
import VerifyEmailPage from '@/app/(auth)/verify-email/page';
import { useSearchParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

describe('VerifyEmailPage コンポーネント', () => {
  it('メールアドレスが渡された場合、そのメールアドレスを表示すること', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => key === 'email' ? 'test@example.com' : null,
    });
    render(<VerifyEmailPage />);
    expect(screen.getByText('メール確認のお願い')).toBeInTheDocument();
    expect(
      screen.getByText('test@example.com 宛に確認メールを送信しました。')
    ).toBeInTheDocument();
  });

  it('メールアドレスが渡されない場合、確認メール送信時のテキストが表示されること', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => null,
    });
    render(<VerifyEmailPage />);
    expect(screen.getByText('メール確認のお願い')).toBeInTheDocument();
    expect(
      screen.getByText('確認メールを送信しました。')
    ).toBeInTheDocument();
  });
});
