import React from 'react';
import { render, screen } from '@testing-library/react'

// AuthProvider をパススルーのダミーに置き換え、内部の状態更新による act 警告を無くす
jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import RootLayout, { metadata } from '@/app/layout'

describe('RootLayout コンポーネント', () => {
  it('子コンポーネントを正しくレンダリングする', () => {
    render(
      <RootLayout>
        <div data-testid="child">テスト用コンテンツ</div>
      </RootLayout>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('メタデータが正しく設定されている', () => {
    expect(metadata.title).toBe('Couple Plan')
    expect(metadata.description).toBe('カップル向けデートプラン管理アプリ')
  })
})