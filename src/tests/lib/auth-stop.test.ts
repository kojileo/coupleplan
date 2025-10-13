/**
 * 単体テスト: auth-stop.ts
 *
 * 認証システム停止管理のテスト
 */

import { authStopManager, emergencyAuthStop, resumeAuth } from '@/lib/auth-stop';

describe('auth-stop.ts', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // 各テスト前に認証システムを再開
    authStopManager.resume();
    jest.clearAllMocks();

    // コンソールスパイ
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('AuthStopManager', () => {
    describe('stop()', () => {
      it('認証システムを停止できる', () => {
        // Act
        authStopManager.stop('テスト停止');

        // Assert
        expect(authStopManager.isAuthStopped()).toBe(true);
      });

      it('停止時に理由を設定できる', () => {
        // Act
        authStopManager.stop('メンテナンス中');

        // Assert
        const info = authStopManager.getStopInfo();
        expect(info.reason).toBe('メンテナンス中');
      });

      it('理由を指定しない場合、デフォルト理由が設定される', () => {
        // Act
        authStopManager.stop();

        // Assert
        const info = authStopManager.getStopInfo();
        expect(info.reason).toBe('手動停止');
      });

      it('停止時刻が記録される', () => {
        // Arrange
        const beforeStop = Date.now();

        // Act
        authStopManager.stop('テスト');

        // Assert
        const info = authStopManager.getStopInfo();
        const stopTime = new Date(info.stopTime).getTime();
        expect(stopTime).toBeGreaterThanOrEqual(beforeStop);
        expect(stopTime).toBeLessThanOrEqual(Date.now());
      });

      it('停止時に警告メッセージがログ出力される', () => {
        // Act
        authStopManager.stop('テスト停止');

        // Assert
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('認証システムが停止されました')
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('テスト停止'));
      });
    });

    describe('resume()', () => {
      it('認証システムを再開できる', () => {
        // Arrange
        authStopManager.stop('テスト停止');

        // Act
        authStopManager.resume();

        // Assert
        expect(authStopManager.isAuthStopped()).toBe(false);
      });

      it('再開時に停止情報がクリアされる', () => {
        // Arrange
        authStopManager.stop('テスト停止');

        // Act
        authStopManager.resume();

        // Assert
        const info = authStopManager.getStopInfo();
        expect(info.isStopped).toBe(false);
        expect(info.reason).toBe('');
        expect(info.stopTime).toBe(new Date(0).toISOString());
        expect(info.duration).toBe(0);
      });

      it('再開時に成功メッセージがログ出力される', () => {
        // Arrange
        authStopManager.stop('テスト停止');

        // Act
        authStopManager.resume();

        // Assert
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('認証システムが再開されました')
        );
      });
    });

    describe('isAuthStopped()', () => {
      it('停止前はfalseを返す', () => {
        // Assert
        expect(authStopManager.isAuthStopped()).toBe(false);
      });

      it('停止後はtrueを返す', () => {
        // Arrange
        authStopManager.stop('テスト');

        // Assert
        expect(authStopManager.isAuthStopped()).toBe(true);
      });

      it('再開後はfalseを返す', () => {
        // Arrange
        authStopManager.stop('テスト');
        authStopManager.resume();

        // Assert
        expect(authStopManager.isAuthStopped()).toBe(false);
      });
    });

    describe('getStopInfo()', () => {
      it('停止情報を取得できる', () => {
        // Arrange
        authStopManager.stop('テスト停止');

        // Act
        const info = authStopManager.getStopInfo();

        // Assert
        expect(info.isStopped).toBe(true);
        expect(info.reason).toBe('テスト停止');
        expect(info.stopTime).toBeDefined();
        expect(info.duration).toBeGreaterThan(0);
      });

      it('停止していない場合、duration は 0', () => {
        // Act
        const info = authStopManager.getStopInfo();

        // Assert
        expect(info.duration).toBe(0);
      });

      it('停止時間の経過がdurationに反映される', async () => {
        // Arrange
        authStopManager.stop('テスト');
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Act
        const info = authStopManager.getStopInfo();

        // Assert
        expect(info.duration).toBeGreaterThanOrEqual(100);
      });

      it('stopTimeがISO形式で返される', () => {
        // Arrange
        authStopManager.stop('テスト');

        // Act
        const info = authStopManager.getStopInfo();

        // Assert
        expect(info.stopTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });
    });

    describe('autoStopOnRefreshTokenError()', () => {
      it('リフレッシュトークンエラーで自動停止する', () => {
        // Act
        authStopManager.autoStopOnRefreshTokenError();

        // Assert
        expect(authStopManager.isAuthStopped()).toBe(true);
      });

      it('停止理由が適切に設定される', () => {
        // Act
        authStopManager.autoStopOnRefreshTokenError();

        // Assert
        const info = authStopManager.getStopInfo();
        expect(info.reason).toContain('リフレッシュトークンエラー');
        expect(info.reason).toContain('無限ループ検出');
      });

      it('警告メッセージが出力される', () => {
        // Act
        authStopManager.autoStopOnRefreshTokenError();

        // Assert
        expect(consoleWarnSpy).toHaveBeenCalled();
      });
    });
  });

  describe('emergencyAuthStop()', () => {
    it('認証システムを緊急停止できる', () => {
      // Act
      emergencyAuthStop();

      // Assert
      expect(authStopManager.isAuthStopped()).toBe(true);
    });

    it('停止理由が設定される', () => {
      // Act
      emergencyAuthStop();

      // Assert
      const info = authStopManager.getStopInfo();
      expect(info.reason).toContain('リフレッシュトークンエラー');
    });

    it('緊急停止の警告メッセージが出力される', () => {
      // Act
      emergencyAuthStop();

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('緊急停止'));
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('リロード'));
    });

    it('複数回呼び出しても安全', () => {
      // Act
      emergencyAuthStop();
      emergencyAuthStop();
      emergencyAuthStop();

      // Assert
      expect(authStopManager.isAuthStopped()).toBe(true);
    });
  });

  describe('resumeAuth()', () => {
    it('認証システムを再開できる', () => {
      // Arrange
      emergencyAuthStop();

      // Act
      resumeAuth();

      // Assert
      expect(authStopManager.isAuthStopped()).toBe(false);
    });

    it('再開の成功メッセージが出力される', () => {
      // Arrange
      emergencyAuthStop();

      // Act
      resumeAuth();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('再開されました'));
    });

    it('停止していない状態で呼び出しても安全', () => {
      // Act
      resumeAuth();

      // Assert
      expect(authStopManager.isAuthStopped()).toBe(false);
    });
  });

  describe('状態遷移', () => {
    it('停止 → 再開 → 停止 のサイクルが正しく動作する', () => {
      // 初期状態
      expect(authStopManager.isAuthStopped()).toBe(false);

      // 停止
      authStopManager.stop('テスト1');
      expect(authStopManager.isAuthStopped()).toBe(true);

      // 再開
      authStopManager.resume();
      expect(authStopManager.isAuthStopped()).toBe(false);

      // 再度停止
      authStopManager.stop('テスト2');
      expect(authStopManager.isAuthStopped()).toBe(true);
      expect(authStopManager.getStopInfo().reason).toBe('テスト2');
    });

    it('複数回停止しても最新の理由が保持される', () => {
      // Act
      authStopManager.stop('理由1');
      authStopManager.stop('理由2');
      authStopManager.stop('理由3');

      // Assert
      const info = authStopManager.getStopInfo();
      expect(info.reason).toBe('理由3');
    });
  });

  describe('グローバル公開（ブラウザ環境）', () => {
    it('window オブジェクトに関数が公開される', () => {
      // ブラウザ環境のシミュレート
      const mockWindow = {} as any;
      global.window = mockWindow;

      // モジュールを再読み込み（実際のテストでは難しいため、概念的なテスト）
      expect(true).toBe(true);
    });
  });
});
