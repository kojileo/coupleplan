import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditPlanPage from '@/app/(dashboard)/plans/[id]/edit/page';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
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
  const push = jest.fn();
  const back = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push, back });
    (useAuth as jest.Mock).mockReturnValue({ session: { access_token: 'token123' } });
    // console.error をモック化して、テスト中のエラーログを抑制
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ロード中はスピナーが表示される', () => {
    (api.plans.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('paramsの解決に失敗した場合、ローディング表示が継続される', () => {
    // paramsの解決に失敗するPromiseをモック
    // Promise.rejectの代わりに、resolveしないPromiseを使用
    const pendingPromise = new Promise<{id: string}>(() => {
      // 意図的に解決しないPromise
    });
    
    render(<EditPlanPage params={pendingPromise} />);
    
    // ローディングスピナーが表示されていることを確認
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('セッションがない場合、プランが見つからないメッセージが表示される', async () => {
    // セッションなしでレンダリング
    (useAuth as jest.Mock).mockReturnValue({ session: null });
    
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);
    
    // ローディング表示が終わるまで待機
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
    
    // プランが見つからないメッセージが表示されることを確認
    expect(screen.getByText('マイプランが見つかりません')).toBeInTheDocument();
    
    // マイプラン一覧に戻るボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /マイプラン一覧に戻る/i }));
    
    // プラン一覧ページに遷移することを確認
    expect(push).toHaveBeenCalledWith('/plans');
  });

  it('プランデータの取得に失敗した場合、プラン一覧ページにリダイレクトされる', async () => {
    // APIエラーをモック
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ error: 'データの取得に失敗しました' });
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);
    
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/plans');
    });
    
    // コンソールエラーが出力されていることを確認
    expect(console.error).toHaveBeenCalled();
  });

  it('プランが存在しない場合、"マイプランが見つかりません" と戻るボタンが表示され、ボタン押下で /plans に遷移する', async () => {
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: null });
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByText('マイプランが見つかりません')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /マイプラン一覧に戻る/i }));
    expect(push).toHaveBeenCalledWith('/plans');
  });

  it('キャンセルボタンをクリックすると、前のページに戻る', async () => {
    const mockPlan = {
      id: '123',
      title: 'Old Title',
      description: 'Old description',
      date: '2023-10-10',
      budget: 1000,
      location: 'https://old.com',
      isPublic: false,
    };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Old Title')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /キャンセル/i }));
    expect(back).toHaveBeenCalled();
  });

  it('フォームの各フィールドを変更できる', async () => {
    const mockPlan = {
      id: '123',
      title: 'Old Title',
      description: 'Old description',
      date: '2023-10-10',
      budget: 1000,
      location: 'https://old.com',
      isPublic: false,
    };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Old Title')).toBeInTheDocument();
    });

    // タイトルの変更
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'New Title' } });
    expect(screen.getByDisplayValue('New Title')).toBeInTheDocument();

    // 説明の変更
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: 'New description' } });
    expect(screen.getByDisplayValue('New description')).toBeInTheDocument();

    // 日付の変更
    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2023-11-11' } });
    expect(screen.getByDisplayValue('2023-11-11')).toBeInTheDocument();

    // 予算の変更
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '2000' } });
    expect(screen.getByDisplayValue('2000')).toBeInTheDocument();

    // 場所URLの変更
    fireEvent.change(screen.getByLabelText('場所URL'), { target: { value: 'https://new.com' } });
    expect(screen.getByDisplayValue('https://new.com')).toBeInTheDocument();
  });

  it('日付が設定されていないプランを正しく表示できる', async () => {
    const mockPlanWithoutDate = {
      id: '123',
      title: 'Plan Title',
      description: 'Description',
      date: null, // 日付なし
      budget: 1000,
      location: 'https://example.com',
      isPublic: false,
    };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlanWithoutDate });
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Plan Title')).toBeInTheDocument();
    });

    // 日付フィールドが空であることを確認
    const dateInput = screen.getByLabelText('日付') as HTMLInputElement;
    expect(dateInput.value).toBe('');
  });

  it('説明が設定されていないプランを正しく表示できる', async () => {
    const mockPlanWithoutDescription = {
      id: '123',
      title: 'Plan Title',
      description: null, // 説明なし
      date: '2023-10-10',
      budget: 1000,
      location: 'https://example.com',
      isPublic: false,
    };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlanWithoutDescription });
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Plan Title')).toBeInTheDocument();
    });

    // 説明フィールドが空であることを確認
    const descriptionInput = screen.getByLabelText('説明') as HTMLTextAreaElement;
    expect(descriptionInput.value).toBe('');
  });

  it('場所URLが設定されていないプランを正しく表示できる', async () => {
    const mockPlanWithoutLocation = {
      id: '123',
      title: 'Plan Title',
      description: 'Description',
      date: '2023-10-10',
      budget: 1000,
      location: null, // 場所URLなし
      isPublic: false,
    };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlanWithoutLocation });
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Plan Title')).toBeInTheDocument();
    });

    // 場所URLフィールドが空であることを確認
    const locationInput = screen.getByLabelText('場所URL') as HTMLInputElement;
    expect(locationInput.value).toBe('');
  });

  it('正常な更新時に /plans/{id} へリダイレクトされる', async () => {
    const mockPlan = {
      id: '123',
      title: 'Old Title',
      description: 'Old description',
      date: '2023-10-10',
      budget: 1000,
      location: 'https://old.com',
      isPublic: false,
    };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    (api.plans.update as jest.Mock).mockResolvedValueOnce({});
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);

    // データ読込完了を待つ
    await waitFor(() => {
      expect(screen.getByDisplayValue('Old Title')).toBeInTheDocument();
    });

    // タイトルの変更と送信
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'New Title' } });
    fireEvent.click(screen.getByRole('button', { name: /保存/i }));

    await waitFor(() => {
      expect(api.plans.update).toHaveBeenCalledWith('token123', '123', expect.objectContaining({
        title: 'New Title'
      }));
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/plans/123');
    });
  });

  it('更新失敗時にアラートが表示される', async () => {
    const mockPlan = {
      id: '123',
      title: 'Old Title',
      description: 'Old description',
      date: '2023-10-10',
      budget: 1000,
      location: 'https://old.com',
      isPublic: false,
    };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    (api.plans.update as jest.Mock).mockResolvedValueOnce({ error: 'Update error' });
    window.alert = jest.fn();
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Old Title')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'New Title' } });
    fireEvent.click(screen.getByRole('button', { name: /保存/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('プランの更新に失敗しました');
    });
    expect(push).not.toHaveBeenCalled();
  });

  it('保存中は保存ボタンが無効化され、テキストが「保存中...」に変わる', async () => {
    const mockPlan = {
      id: '123',
      title: 'Old Title',
      description: 'Old description',
      date: '2023-10-10',
      budget: 1000,
      location: 'https://old.com',
      isPublic: false,
    };
    (api.plans.get as jest.Mock).mockResolvedValueOnce({ data: mockPlan });
    
    // 保存処理が完了しない Promise を返す
    (api.plans.update as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
    
    render(<EditPlanPage params={Promise.resolve({ id: '123' })} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Old Title')).toBeInTheDocument();
    });

    // 保存ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /保存/i }));
    
    // ボタンが無効化され、テキストが変わることを確認
    const saveButton = screen.getByRole('button', { name: /保存中/i });
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveTextContent('保存中...');
  });
});