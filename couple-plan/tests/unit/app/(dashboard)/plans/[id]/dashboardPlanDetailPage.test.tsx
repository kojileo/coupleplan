import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PlanDetailPage from '@/app/(dashboard)/plans/[id]/page';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

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
      delete: jest.fn(),
    },
  },
}));

// PublishDialog を簡易モック化（isOpen の状態で表示内容を切替）
jest.mock('@/components/features/plans/PublishDialog', () => ({
  __esModule: true,
  default: (props: { isOpen: boolean; onClose: () => void; planId: string }) => (
    <div data-testid="publish-dialog">{props.isOpen ? 'Open' : 'Closed'}</div>
  ),
}));

describe('PlanDetailPage コンポーネント', () => {
  const push = jest.fn();
  const mockUserId = 'user-123';
  const mockPlan = {
    id: '123',
    title: 'Plan Detail Title',
    description: 'Plan description',
    date: '2023-10-10',
    budget: 1500,
    location: 'https://example.com',
    createdAt: '2023-10-01',
    updatedAt: '2023-10-05',
    userId: mockUserId, // プラン作成者のID
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    // console.error をモック化して、テスト中のエラーログを抑制
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ロード中にスピナーが表示される', () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    (api.plans.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('プラン作成者の場合、編集系のボタンが表示される', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    // 編集系のボタンが表示されていることを確認
    expect(screen.getByRole('button', { name: /公開設定/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /編集/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /削除/i })).toBeInTheDocument();
  });

  it('プラン作成者以外の場合、編集系のボタンが表示されない', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: 'different-user' } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    // 編集系のボタンが表示されていないことを確認
    expect(screen.queryByRole('button', { name: /公開設定/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /編集/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /削除/i })).not.toBeInTheDocument();
  });

  it('プラン作成者の場合、削除処理が実行できる', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    (api.plans.delete as jest.Mock).mockResolvedValueOnce({});
    window.confirm = jest.fn(() => true);
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /削除/i }));

    await waitFor(() => {
      expect(api.plans.delete).toHaveBeenCalledWith('token123', '123');
      expect(push).toHaveBeenCalledWith('/plans');
    });
  });

  it('削除確認ダイアログでキャンセルした場合、削除処理が実行されない', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    window.confirm = jest.fn(() => false); // キャンセルを選択
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /削除/i }));

    // 削除APIが呼ばれていないことを確認
    expect(api.plans.delete).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalledWith('/plans');
  });

  it('プラン削除に失敗した場合、エラーメッセージが表示される', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    (api.plans.delete as jest.Mock).mockResolvedValueOnce({ error: '削除に失敗しました' });
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /削除/i }));

    await waitFor(() => {
      expect(api.plans.delete).toHaveBeenCalledWith('token123', '123');
      expect(window.alert).toHaveBeenCalledWith('プランの削除に失敗しました');
      expect(push).not.toHaveBeenCalledWith('/plans');
    });
  });

  it('プラン作成者の場合、公開設定ダイアログを開ける', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    expect(screen.getByTestId('publish-dialog')).toHaveTextContent('Closed');
    fireEvent.click(screen.getByRole('button', { name: /公開設定/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId('publish-dialog')).toHaveTextContent('Open');
    });
  });

  it('プランの詳細情報が正しく表示される', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    // 詳細情報の表示を確認
    expect(screen.getByText('説明')).toBeInTheDocument();
    expect(screen.getByText('Plan description')).toBeInTheDocument();
    expect(screen.getByText('予算')).toBeInTheDocument();
    expect(screen.getByText('¥1,500')).toBeInTheDocument();
    expect(screen.getByText('場所URL')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    
    // 日付の表示を確認
    const date = new Date(mockPlan.date).toLocaleDateString();
    expect(screen.getByText(date)).toBeInTheDocument();

    // 作成日・更新日の表示を確認
    const createdDate = new Date(mockPlan.createdAt).toLocaleDateString();
    const updatedDate = new Date(mockPlan.updatedAt).toLocaleDateString();
    expect(screen.getByText(`作成日: ${createdDate}`)).toBeInTheDocument();
    expect(screen.getByText(`更新日: ${updatedDate}`)).toBeInTheDocument();
  });

  it('プラン作成者以外でも詳細情報を閲覧できる', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: 'different-user' } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    // 基本情報が表示されることを確認
    expect(screen.getByText('Plan description')).toBeInTheDocument();
    expect(screen.getByText('¥1,500')).toBeInTheDocument();
    
    // 編集系のボタンが表示されないことを確認
    expect(screen.queryByRole('button', { name: /公開設定/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /編集/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /削除/i })).not.toBeInTheDocument();
  });

  it('セッションがない場合、プランデータを取得しない', async () => {
    // セッションがない状態をモック
    (useAuth as jest.Mock).mockReturnValue({ session: null });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    // ローディング表示が終わるまで待機
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    // APIが呼ばれていないことを確認
    expect(api.plans.get).not.toHaveBeenCalled();
    // 何も表示されないことを確認（!planの条件分岐に入るため）
    expect(document.body.textContent).toBe('');
  });

  it('プランデータの取得に失敗した場合、プラン一覧ページにリダイレクトされる', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    // エラーレスポンスをモック
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ error: 'プランの取得に失敗しました' });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/plans');
    });

    // コンソールエラーが出力されていることを確認
    expect(console.error).toHaveBeenCalled();
  });

  it('プランが見つからない場合、何も表示されない', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    // データがnullのレスポンスをモック
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: null });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    // ローディング表示が終わるまで待機
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    // 何も表示されないことを確認
    expect(document.body.textContent).toBe('');
  });

  it('paramsの解決に失敗した場合、ローディング表示が継続される', () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    
    // paramsの解決に失敗するPromiseをモック
    // Promise.rejectの代わりに、resolveしないPromiseを使用
    const pendingPromise = new Promise<{id: string}>(() => {
      // 意図的に解決しないPromise
    });
    
    render(<PlanDetailPage params={pendingPromise} />);
    
    // ローディングスピナーが表示されていることを確認
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('編集ボタンをクリックすると、編集ページに遷移する', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    // 編集ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /編集/i }));
    
    // 編集ページに遷移することを確認
    expect(push).toHaveBeenCalledWith('/plans/123/edit');
  });

  it('PublishDialogのonCloseコールバックが呼ばれると、ダイアログが閉じる', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    
    // PublishDialogのモックを一時的に上書き
    const originalPublishDialog = jest.requireMock('@/components/features/plans/PublishDialog').default;
    jest.requireMock('@/components/features/plans/PublishDialog').default = (props: any) => {
      // onCloseを即時に呼び出すボタンを追加
      return (
        <div data-testid="publish-dialog">
          {props.isOpen ? 'Open' : 'Closed'}
          {props.isOpen && (
            <button data-testid="close-dialog-button" onClick={props.onClose}>
              Close Dialog
            </button>
          )}
        </div>
      );
    };
    
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    // 公開設定ボタンをクリックしてダイアログを開く
    fireEvent.click(screen.getByRole('button', { name: /公開設定/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId('publish-dialog')).toHaveTextContent('Open');
    });
    
    // ダイアログの閉じるボタンをクリック
    fireEvent.click(screen.getByTestId('close-dialog-button'));
    
    // ダイアログが閉じることを確認
    expect(screen.getByTestId('publish-dialog')).toHaveTextContent('Closed');
    
    // モックを元に戻す
    jest.requireMock('@/components/features/plans/PublishDialog').default = originalPublishDialog;
  });

  it('場所URLのリンクがクリック可能であることを確認', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    
    // window.openをモック化
    const originalOpen = window.open;
    window.open = jest.fn();
    
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    // 場所URLのリンクを取得
    const locationLink = screen.getByText('example.com');
    expect(locationLink.tagName).toBe('A');
    expect(locationLink).toHaveAttribute('href', 'https://example.com');
    expect(locationLink).toHaveAttribute('target', '_blank');
    expect(locationLink).toHaveAttribute('rel', 'noopener noreferrer');
    
    // モックを元に戻す
    window.open = originalOpen;
  });

  it('場所URLが設定されていない場合、「未設定」と表示される', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    // locationがnullのプランをモック
    const planWithoutLocation = { ...mockPlan, location: null };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: planWithoutLocation });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    // 場所URLが「未設定」と表示されることを確認
    expect(screen.getByText('未設定')).toBeInTheDocument();
  });

  it('日付が設定されていない場合、「未設定」と表示される', async () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      session: { access_token: 'token123', user: { id: mockUserId } }
    });
    // dateがnullのプランをモック
    const planWithoutDate = { ...mockPlan, date: null };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: planWithoutDate });
    render(<PlanDetailPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Plan Detail Title')).toBeInTheDocument();
    });

    // 日付が「未設定」と表示されることを確認
    expect(screen.getByText('未設定')).toBeInTheDocument();
  });
});