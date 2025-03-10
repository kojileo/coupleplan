import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewPlanPage from '@/app/(dashboard)/plans/new/page';
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
      create: jest.fn(),
    },
  },
}));

describe('NewPlanPage コンポーネント', () => {
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

  it('フォームの入力と送信で新規プランを作成し、/plans へリダイレクトする', async () => {
    // 成功時：エラーがなく空のレスポンスを返す
    (api.plans.create as jest.Mock).mockResolvedValueOnce({});
    render(<NewPlanPage />);
    
    // 入力フォームへの値入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'Test Plan' } });
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: 'Plan description' } });
    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2023-10-12' } });
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('場所URL'), { target: { value: 'https://example.com' } });
    
    // 送信
    fireEvent.click(screen.getByRole('button', { name: /作成/i }));

    await waitFor(() => {
      // api.plans.createが呼ばれたことを確認
      expect(api.plans.create).toHaveBeenCalled();
      
      // 呼び出し引数を取得
      const args = (api.plans.create as jest.Mock).mock.calls[0];
      
      // 第1引数はトークン
      expect(args[0]).toBe('token123');
      
      // 第2引数はプランデータ
      const planData = args[1];
      
      // タイトル、説明、予算、場所、公開設定を検証
      expect(planData.title).toBe('Test Plan');
      expect(planData.description).toBe('Plan description');
      expect(planData.budget).toBe(1000);
      expect(planData.location).toBe('https://example.com');
      expect(planData.isPublic).toBe(false);
      
      // 日付を検証
      const date = planData.date;
      expect(date).toBeTruthy();
      expect(typeof date).toBe('object');
      
      // 日付の値を検証（年月日）
      if (date && typeof date.getFullYear === 'function') {
        expect(date.getFullYear()).toBe(2023);
        expect(date.getMonth()).toBe(9); // 10月は9（0-indexed）
        expect(date.getDate()).toBe(12);
      } else {
        fail('date is not a valid Date object');
      }
    });
    
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/plans');
    });
  });

  it('フォームの各フィールドを変更できる', () => {
    render(<NewPlanPage />);
    
    // タイトルの変更
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'Test Plan' } });
    expect(screen.getByLabelText('タイトル')).toHaveValue('Test Plan');
    
    // 説明の変更
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: 'Plan description' } });
    expect(screen.getByLabelText('説明')).toHaveValue('Plan description');
    
    // 日付の変更
    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2023-10-12' } });
    expect(screen.getByLabelText('日付')).toHaveValue('2023-10-12');
    
    // 予算の変更
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '1000' } });
    expect(screen.getByLabelText('予算')).toHaveValue(1000);
    
    // 場所URLの変更
    fireEvent.change(screen.getByLabelText('場所URL'), { target: { value: 'https://example.com' } });
    expect(screen.getByLabelText('場所URL')).toHaveValue('https://example.com');
  });

  it('キャンセルボタンをクリックすると、前のページに戻る', () => {
    render(<NewPlanPage />);
    
    // キャンセルボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /キャンセル/i }));
    
    // 前のページに戻ることを確認
    expect(back).toHaveBeenCalled();
  });

  it('セッションがない場合、フォーム送信時に何も起こらない', async () => {
    // セッションなしをモック
    (useAuth as jest.Mock).mockReturnValue({ session: null });
    
    render(<NewPlanPage />);
    
    // 入力フォームへの値入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'Test Plan' } });
    
    // 送信
    fireEvent.click(screen.getByRole('button', { name: /作成/i }));
    
    // APIが呼ばれないことを確認
    expect(api.plans.create).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it('作成失敗時にエラーメッセージが表示される', async () => {
    // 失敗時：error プロパティが返る
    (api.plans.create as jest.Mock).mockResolvedValueOnce({ error: 'Error message' });
    window.alert = jest.fn();
    render(<NewPlanPage />);

    // 同じように入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'Test Plan' } });
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: 'Plan description' } });
    fireEvent.change(screen.getByLabelText('日付'), { target: { value: '2023-10-12' } });
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('場所URL'), { target: { value: 'https://example.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /作成/i }));
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('プランの作成に失敗しました');
    });
    expect(push).not.toHaveBeenCalled();
  });

  it('ネットワークエラーなどの例外が発生した場合、エラーメッセージが表示される', async () => {
    // ネットワークエラーをモック
    (api.plans.create as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    window.alert = jest.fn();
    render(<NewPlanPage />);

    // 入力フォームへの値入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'Test Plan' } });
    
    // 送信
    fireEvent.click(screen.getByRole('button', { name: /作成/i }));
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('プランの作成に失敗しました');
    });
    
    // コンソールエラーが出力されていることを確認
    expect(console.error).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it('保存中はボタンが無効化され、テキストが「作成中...」に変わる', async () => {
    // 保存処理が完了しない Promise を返す
    (api.plans.create as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
    
    render(<NewPlanPage />);
    
    // 入力フォームへの値入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'Test Plan' } });
    
    // 送信
    fireEvent.click(screen.getByRole('button', { name: /作成/i }));
    
    // ボタンが無効化され、テキストが変わることを確認
    const saveButton = screen.getByRole('button', { name: /作成中/i });
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveTextContent('作成中...');
  });

  it('日付がnullの場合、正しく送信される', async () => {
    // 成功時：エラーがなく空のレスポンスを返す
    (api.plans.create as jest.Mock).mockResolvedValueOnce({});
    render(<NewPlanPage />);
    
    // 日付以外の入力フォームへの値入力
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'Test Plan' } });
    fireEvent.change(screen.getByLabelText('予算'), { target: { value: '1000' } });
    
    // 送信
    fireEvent.click(screen.getByRole('button', { name: /作成/i }));

    await waitFor(() => {
      expect(api.plans.create).toHaveBeenCalledWith('token123', expect.objectContaining({
        title: 'Test Plan',
        date: null,
        budget: 1000,
        isPublic: false,
      }));
    });
  });
});