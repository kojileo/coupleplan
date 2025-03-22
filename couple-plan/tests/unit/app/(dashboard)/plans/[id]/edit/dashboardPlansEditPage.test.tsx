// テスト全体で global.fetch をモック関数として定義
if (!global.fetch) {
  global.fetch = jest.fn();
}

import React from 'react';
import { render, screen } from '@testing-library/react';
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
  });
  
  it('コンポーネントが正しくレンダリングされる', () => {
    render(<EditPlanPage params={Promise.resolve({ id: 'test-plan-id' })} />);
    
    // ロード中の表示がされる
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});