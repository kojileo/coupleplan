/**
 * バリデーション関数 テスト
 *
 * テスト対象: src/lib/validation.ts
 * テスト計画: Docs/tests/TEST_STRATEGY.md § バリデーションテスト
 * 目標カバレッジ: 90%以上
 */

import {
  validateName,
  validateEmail,
  validatePassword,
  validateBio,
  validateLocation,
  validateDate,
  validateProfileForm,
  type ProfileFormData,
} from '@/lib/validation';

describe('validation', () => {
  /**
   * TC-VALID-001: 名前のバリデーション
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-VALID-001: validateName', () => {
    it('有効な名前の場合、validがtrueになる', () => {
      const result = validateName('山田太郎');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('空の名前の場合、エラーを返す', () => {
      const result = validateName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('名前を入力してください');
    });

    it('スペースのみの名前の場合、エラーを返す', () => {
      const result = validateName('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('名前を入力してください');
    });

    it('51文字以上の名前の場合、エラーを返す', () => {
      const longName = 'あ'.repeat(51);
      const result = validateName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('名前は50文字以内で入力してください');
    });

    it('50文字の名前は有効', () => {
      const exactName = 'あ'.repeat(50);
      const result = validateName(exactName);
      expect(result.valid).toBe(true);
    });

    it('1文字の名前は有効', () => {
      const result = validateName('山');
      expect(result.valid).toBe(true);
    });
  });

  /**
   * TC-VALID-002: メールアドレスのバリデーション
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-VALID-002: validateEmail', () => {
    it('有効なメールアドレスの場合、validがtrueになる', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.jp',
        'test+tag@example.com',
        'test_123@example.com',
      ];

      validEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('空のメールアドレスの場合、エラーを返す', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('メールアドレスを入力してください');
    });

    it('スペースのみの場合、エラーを返す', () => {
      const result = validateEmail('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('メールアドレスを入力してください');
    });

    it('@を含まないメールアドレスの場合、エラーを返す', () => {
      const result = validateEmail('invalidemail');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('有効なメールアドレスを入力してください');
    });

    it('ドメインがないメールアドレスの場合、エラーを返す', () => {
      const result = validateEmail('test@');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('有効なメールアドレスを入力してください');
    });

    it('ローカル部がないメールアドレスの場合、エラーを返す', () => {
      const result = validateEmail('@example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('有効なメールアドレスを入力してください');
    });
  });

  /**
   * TC-VALID-003: パスワードのバリデーション
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-VALID-003: validatePassword', () => {
    it('有効なパスワードの場合、validがtrueになる', () => {
      const validPasswords = ['Password123', 'Test1234!', 'MySecure99', 'Abc12345'];

      validPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('空のパスワードの場合、エラーを返す', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('パスワードを入力してください');
    });

    it('8文字未満のパスワードの場合、エラーを返す', () => {
      const result = validatePassword('Pass1');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('パスワードは8文字以上で入力してください');
    });

    it('101文字以上のパスワードの場合、エラーを返す', () => {
      const longPassword = 'P1' + 'a'.repeat(99);
      const result = validatePassword(longPassword);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('パスワードは100文字以内で入力してください');
    });

    it('英字を含まないパスワードの場合、エラーを返す', () => {
      const result = validatePassword('12345678');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('パスワードは英字と数字を含む必要があります');
    });

    it('数字を含まないパスワードの場合、エラーを返す', () => {
      const result = validatePassword('Password');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('パスワードは英字と数字を含む必要があります');
    });

    it('8文字のパスワードは有効', () => {
      const result = validatePassword('Pass1234');
      expect(result.valid).toBe(true);
    });

    it('100文字のパスワードは有効', () => {
      const exactPassword = 'P1' + 'a'.repeat(98);
      const result = validatePassword(exactPassword);
      expect(result.valid).toBe(true);
    });
  });

  /**
   * TC-VALID-004: 自己紹介のバリデーション
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-VALID-004: validateBio', () => {
    it('有効な自己紹介の場合、validがtrueになる', () => {
      const result = validateBio('こんにちは、よろしくお願いします。');
      expect(result.valid).toBe(true);
    });

    it('空の自己紹介は有効', () => {
      const result = validateBio('');
      expect(result.valid).toBe(true);
    });

    it('501文字以上の自己紹介の場合、エラーを返す', () => {
      const longBio = 'あ'.repeat(501);
      const result = validateBio(longBio);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('自己紹介は500文字以内で入力してください');
    });

    it('500文字の自己紹介は有効', () => {
      const exactBio = 'あ'.repeat(500);
      const result = validateBio(exactBio);
      expect(result.valid).toBe(true);
    });
  });

  /**
   * TC-VALID-005: 居住地のバリデーション
   * Priority: P2 (Medium)
   * Test Type: Unit
   */
  describe('TC-VALID-005: validateLocation', () => {
    it('有効な居住地の場合、validがtrueになる', () => {
      const result = validateLocation('東京都渋谷区');
      expect(result.valid).toBe(true);
    });

    it('空の居住地は有効', () => {
      const result = validateLocation('');
      expect(result.valid).toBe(true);
    });

    it('101文字以上の居住地の場合、エラーを返す', () => {
      const longLocation = 'あ'.repeat(101);
      const result = validateLocation(longLocation);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('居住地は100文字以内で入力してください');
    });

    it('100文字の居住地は有効', () => {
      const exactLocation = 'あ'.repeat(100);
      const result = validateLocation(exactLocation);
      expect(result.valid).toBe(true);
    });
  });

  /**
   * TC-VALID-006: 日付のバリデーション
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-VALID-006: validateDate', () => {
    it('有効な日付の場合、validがtrueになる', () => {
      const validDates = ['2024-01-01', '2024-12-31', '2000-06-15', '1990-03-20'];

      validDates.forEach((date) => {
        const result = validateDate(date);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('空の日付は有効（任意フィールド）', () => {
      const result = validateDate('');
      expect(result.valid).toBe(true);
    });

    it('無効な日付形式の場合、エラーを返す', () => {
      const invalidDates = ['2024/01/01', '01-01-2024', '2024-1-1', 'invalid'];

      invalidDates.forEach((date) => {
        const result = validateDate(date);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('日付形式');
      });
    });

    it('存在しない月の場合、エラーを返す', () => {
      const result = validateDate('2024-13-01');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('有効な日付を入力してください');
    });

    it('無効な日（32日）の場合、エラーを返す', () => {
      const result = validateDate('2024-01-32');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('有効な日付を入力してください');
    });
  });

  /**
   * TC-VALID-007: プロフィールフォームのバリデーション
   * Priority: P0 (Critical)
   * Test Type: Unit
   */
  describe('TC-VALID-007: validateProfileForm', () => {
    it('全てのフィールドが有効な場合、validがtrueになる', () => {
      const formData: ProfileFormData = {
        name: '山田太郎',
        email: 'test@example.com',
        location: '東京都',
        birthday: '1990-01-01',
        anniversary: '2020-06-15',
      };

      const result = validateProfileForm(formData);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('複数のフィールドにエラーがある場合、全てのエラーを返す', () => {
      const formData: ProfileFormData = {
        name: '',
        email: 'invalid-email',
        location: 'あ'.repeat(101),
        birthday: '2024/01/01',
      };

      const result = validateProfileForm(formData);
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.location).toBeDefined();
      expect(result.errors.birthday).toBeDefined();
    });

    it('必須フィールドのみでバリデーションが通る', () => {
      const formData: ProfileFormData = {
        name: '山田太郎',
        email: 'test@example.com',
      };

      const result = validateProfileForm(formData);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('オプショナルフィールドのエラーも検出する', () => {
      const formData: ProfileFormData = {
        name: '山田太郎',
        email: 'test@example.com',
        birthday: 'invalid-date',
      };

      const result = validateProfileForm(formData);
      expect(result.valid).toBe(false);
      expect(result.errors.birthday).toBeDefined();
      expect(result.errors.name).toBeUndefined();
      expect(result.errors.email).toBeUndefined();
    });
  });

  /**
   * TC-VALID-008: エッジケーステスト
   * Priority: P1 (High)
   * Test Type: Unit
   */
  describe('TC-VALID-008: エッジケース', () => {
    it('境界値テスト: 名前が正確に50文字', () => {
      const exactName = 'あ'.repeat(50);
      const result = validateName(exactName);
      expect(result.valid).toBe(true);
    });

    it('境界値テスト: パスワードが正確に8文字', () => {
      const result = validatePassword('Pass1234');
      expect(result.valid).toBe(true);
    });

    it('境界値テスト: パスワードが正確に100文字', () => {
      const exactPassword = 'P1' + 'a'.repeat(98);
      const result = validatePassword(exactPassword);
      expect(result.valid).toBe(true);
    });

    it('境界値テスト: 自己紹介が正確に500文字', () => {
      const exactBio = 'あ'.repeat(500);
      const result = validateBio(exactBio);
      expect(result.valid).toBe(true);
    });

    it('境界値テスト: 居住地が正確に100文字', () => {
      const exactLocation = 'あ'.repeat(100);
      const result = validateLocation(exactLocation);
      expect(result.valid).toBe(true);
    });

    it('特殊文字を含むメールアドレス', () => {
      const result = validateEmail('test+tag@example.com');
      expect(result.valid).toBe(true);
    });

    it('特殊文字を含むパスワード', () => {
      const result = validatePassword('Pass123!@#');
      expect(result.valid).toBe(true);
    });

    it('うるう年の日付', () => {
      const result = validateDate('2024-02-29');
      expect(result.valid).toBe(true);
    });

    it('月末の日付（31日がある月）', () => {
      const result = validateDate('2024-01-31');
      expect(result.valid).toBe(true);
    });

    it('月末の日付（30日がある月）', () => {
      const result = validateDate('2024-04-30');
      expect(result.valid).toBe(true);
    });
  });
});
