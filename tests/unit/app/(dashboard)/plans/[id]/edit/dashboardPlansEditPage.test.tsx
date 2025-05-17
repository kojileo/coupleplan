// テスト全体で global.fetch をモック関数として定義
if (!global.fetch) {
  global.fetch = jest.fn();
}

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import EditPlanPage from '@/app/(dashboard)/plans/[id]/edit/page';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  api: {
    plans: {
      get: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('EditPlanPage コンポーネント', () => {
  const mockRouter = {
    back: jest.fn(),
    push: jest.fn(),
  };

  const mockSession = {
    access_token: process.env.TEST_ACCESS_TOKEN,
    user: { id: 'test-user-id' },
  };

  const mockPlan = {
    id: 'test-plan-id',
    title: 'テストプラン',
    description: 'テスト説明',
    date: new Date('2024-01-01'),
    locations: [],
    region: 'tokyo',
    budget: 10000,
    isPublic: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (api.plans.get as jest.Mock).mockResolvedValue({ data: mockPlan });
    (api.plans.update as jest.Mock).mockResolvedValue({ data: mockPlan });
  });

  it('コンポーネントが正しくレンダリングされる', async () => {
    render(<EditPlanPage params={Promise.resolve({ id: 'test-plan-id' })} />);

    await waitFor(() => {
      expect(screen.getByLabelText('タイトル')).toHaveValue('テストプラン');
      expect(screen.getByLabelText('説明')).toHaveValue('テスト説明');
      expect(screen.getByLabelText('日付')).toHaveValue('2024-01-01');
      expect(screen.getByLabelText('予算')).toHaveValue(10000);
      expect(screen.getByLabelText('地域')).toHaveValue('tokyo');
    });
  });

  it('プランの更新が成功する', async () => {
    render(<EditPlanPage params={Promise.resolve({ id: 'test-plan-id' })} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('タイトル'), 'テストプラン');
    await user.type(screen.getByLabelText('説明'), 'テスト説明');
    await user.type(screen.getByLabelText('日付'), '2024-01-01');
    await user.type(screen.getByLabelText('予算'), '10000');
    await user.selectOptions(screen.getByLabelText('地域'), 'tokyo');

    await user.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => {
      expect(api.plans.update).toHaveBeenCalledWith(
        'test-token',
        'test-plan-id',
        expect.any(Object)
      );
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  it('エラー発生時に適切に処理される', async () => {
    (api.plans.update as jest.Mock).mockRejectedValueOnce(new Error('APIエラー'));
    render(<EditPlanPage params={Promise.resolve({ id: 'test-plan-id' })} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('プランの更新に失敗しました');
    });
  });
});
