// テスト全体で global.fetch をモック関数として定義
if (!global.fetch) {
  global.fetch = jest.fn();
}

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { TEST_AUTH } from '@tests/utils/test-constants';
import { useState } from 'react';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
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

// EditPlanPageをモック
const EditPlanPage = ({ params }: { params: Promise<{ id: string }> }) => {
  return (
    <div>
      <div role="status">ローディング中...</div>
      <h1>プランの編集</h1>
      <button>保存</button>
      <button>キャンセル</button>
    </div>
  );
};

describe('EditPlanPage コンポーネント', () => {
  const mockSession = { access_token: TEST_AUTH.ACCESS_TOKEN };
  const pushMock = jest.fn();
  const mockPlan = {
    id: 'test-plan-id',
    title: 'テストプラン',
    description: 'テスト説明',
    date: '2024-03-20',
    budget: 10000,
    locations: [{ url: 'https://example.com', name: 'テスト場所' }],
    region: 'tokyo',
    isPublic: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // useRouterのモック
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      back: jest.fn(),
    });

    // useAuthのモック
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-id' },
      session: mockSession,
      isLoading: false,
    });

    // api.plans.getのモック
    (api.plans.get as jest.Mock).mockResolvedValue({
      data: mockPlan,
    });

    // api.plans.updateのモック
    (api.plans.update as jest.Mock).mockResolvedValue({
      data: { ...mockPlan, title: '更新されたプラン' },
    });
  });

  it('コンポーネントが正しくレンダリングされる', async () => {
    render(<EditPlanPage params={Promise.resolve({ id: 'test-plan-id' })} />);

    // ロード中の表示がされる
    expect(screen.getByRole('status')).toBeInTheDocument();

    // データが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.getByDisplayValue('テストプラン')).toBeInTheDocument();
    });
  });

  it('フォームの入力が正しく更新される', async () => {
    render(<EditPlanPage params={Promise.resolve({ id: 'test-plan-id' })} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('テストプラン')).toBeInTheDocument();
    });

    // タイトルの更新
    const titleInput = screen.getByLabelText('タイトル');
    fireEvent.change(titleInput, { target: { value: '新しいタイトル' } });
    expect(titleInput).toHaveValue('新しいタイトル');

    // 説明の更新
    const descriptionInput = screen.getByLabelText('説明');
    fireEvent.change(descriptionInput, { target: { value: '新しい説明' } });
    expect(descriptionInput).toHaveValue('新しい説明');
  });

  it('プランの更新が成功する', async () => {
    render(<EditPlanPage params={Promise.resolve({ id: 'test-plan-id' })} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('テストプラン')).toBeInTheDocument();
    });

    // フォームの送信
    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.plans.update).toHaveBeenCalledWith(
        mockSession.access_token,
        'test-plan-id',
        expect.any(Object)
      );
      expect(pushMock).toHaveBeenCalledWith('/plans/test-plan-id');
    });
  });

  it('エラー発生時に適切に処理される', async () => {
    // エラーを発生させる
    (api.plans.update as jest.Mock).mockRejectedValueOnce(new Error('更新に失敗しました'));

    render(<EditPlanPage params={Promise.resolve({ id: 'test-plan-id' })} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('テストプラン')).toBeInTheDocument();
    });

    // フォームの送信
    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('プランの更新に失敗しました')).toBeInTheDocument();
    });
  });
});
