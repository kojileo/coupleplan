'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent, ReactElement } from 'react';
import { useState, useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export default function ProfilePage(): ReactElement {
  const router = useRouter();
  const { session } = useAuth();
  const { profile, isLoading, error, updateProfile, deleteAccount } = useProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // プロフィール情報が取得されたら、フォームに値をセット
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setUpdateMessage('');

    try {
      const result = await updateProfile(name, email);
      if (result) {
        setUpdateMessage('プロフィールが更新されました');
      }
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      setUpdateMessage('プロフィールの更新に失敗しました');
    }
  };

  const handleDeleteAccount = async (): Promise<void> => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      console.log('アカウント削除処理を開始します');
      const success = await deleteAccount();

      if (success) {
        console.log('アカウント削除に成功しました。ログインページにリダイレクトします');
        // 削除成功後、ログインページにリダイレクト
        void router.push('/login');
      } else {
        console.error('アカウント削除に失敗しました（成功フラグがfalse）');
        setDeleteError('アカウントの削除に失敗しました');
      }
    } catch (error) {
      console.error('アカウント削除エラー:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'アカウントの削除に失敗しました';
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = (): void => {
    setShowConfirmDelete(false);
    setDeleteError('');
  };

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;
  if (!session) return <div>ログインが必要です</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">プロフィール設定</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">プロフィール情報</h2>

        {updateMessage && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {updateMessage}
          </div>
        )}

        <form
          onSubmit={(e): void => {
            void handleUpdateProfile(e);
          }}
        >
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">
              名前
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <button
            type="submit"
            className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            更新する
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">アカウント削除</h2>
        <p className="text-gray-600 mb-4">
          アカウントを削除すると、すべてのデータが完全に削除され、復元できなくなります。
        </p>

        {deleteError && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {deleteError}
          </div>
        )}

        {showConfirmDelete ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
            <p className="font-bold text-red-700 mb-2">本当にアカウントを削除しますか？</p>
            <p className="text-red-600 mb-4">この操作は取り消せません。</p>
            <div className="flex space-x-4">
              <button
                onClick={(): void => {
                  void handleDeleteAccount();
                }}
                disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {isDeleting ? '削除中...' : '削除する'}
              </button>
              <button
                onClick={handleCancelDelete}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={(): void => {
              void handleDeleteAccount();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            アカウントを削除
          </button>
        )}
      </div>
    </div>
  );
}
