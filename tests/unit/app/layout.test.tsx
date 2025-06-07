import React from 'react';
import { render, screen } from '@testing-library/react';

// AuthProvider をパススルーのダミーに置き換え、内部の状態更新による act 警告を無くす
jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import RootLayout, { metadata } from '@/app/layout';

describe('RootLayout コンポーネント', () => {
  it('子コンポーネントを正しくレンダリングする', () => {
    render(
      <RootLayout>
        <div data-testid="child">テスト用コンテンツ</div>
      </RootLayout>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('メタデータが正しく設定されている', () => {
    expect(metadata.title).toEqual({
      default: 'Couple Plan - カップルのためのデートプラン管理・お手洗い検索・会話ネタ提供アプリ',
      template: '%s | Couple Plan',
    });
    expect(metadata.description).toBe(
      'カップルで一緒にデートプランを作成・共有・管理できるWebアプリケーション。現在地周辺のお手洗い検索、デート中の会話ネタ提供、行きたい場所の保存、予算管理、公開プランの参考など、デートをより楽しくする緊急ヘルプ機能付きアプリです。'
    );
    expect(metadata.metadataBase).toEqual(new URL('https://coupleplan.com'));
  });
});
