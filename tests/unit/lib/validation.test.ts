import {
  sanitizeHtml,
  validateInput,
  validateEmail,
  validatePassword,
  validateUrl,
  validateStringLength,
  escapeHtml,
} from '@/lib/validation';

describe('validation', () => {
  describe('sanitizeHtml', () => {
    it('HTMLタグを除去する', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const result = sanitizeHtml(maliciousInput);
      expect(result).toBe('Hello World');
    });

    it('属性も除去する', () => {
      const input = '<div onclick="alert()">Content</div>';
      const result = sanitizeHtml(input);
      expect(result).toBe('Content');
    });
  });

  describe('validateInput', () => {
    it('SQLインジェクション攻撃を検出する', () => {
      expect(validateInput("'; DROP TABLE users; --")).toBe(false);
      expect(validateInput('SELECT * FROM users')).toBe(false);
      expect(validateInput('UNION SELECT password')).toBe(false);
    });

    it('正常な入力を許可する', () => {
      expect(validateInput('Hello World')).toBe(true);
      expect(validateInput('ユーザー名123')).toBe(true);
    });
  });

  describe('validateEmail', () => {
    it('有効なメールアドレスを認識する', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.jp')).toBe(true);
    });

    it('無効なメールアドレスを拒否する', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });

    it('長すぎるメールアドレスを拒否する', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(validateEmail(longEmail)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('強いパスワードを承認する', () => {
      const result = validatePassword('MyStr0ng!Pass');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('弱いパスワードを拒否し、適切なエラーメッセージを返す', () => {
      const result = validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('パスワードは8文字以上である必要があります');
      expect(result.errors).toContain('パスワードには大文字を含める必要があります');
      expect(result.errors).toContain('パスワードには数字を含める必要があります');
      expect(result.errors).toContain('パスワードには特殊文字を含める必要があります');
    });
  });

  describe('validateUrl', () => {
    it('有効なURLを認識する', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
    });

    it('無効なURLを拒否する', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('ftp://example.com')).toBe(false);
    });
  });

  describe('validateStringLength', () => {
    it('長さ制限内の文字列を承認する', () => {
      expect(validateStringLength('Hello', 10)).toBe(true);
      expect(validateStringLength('Hello', 10, 3)).toBe(true);
    });

    it('長すぎる文字列を拒否する', () => {
      expect(validateStringLength('Very long string', 5)).toBe(false);
    });

    it('短すぎる文字列を拒否する', () => {
      expect(validateStringLength('Hi', 10, 5)).toBe(false);
    });
  });

  describe('escapeHtml', () => {
    it('HTMLエスケープを正しく行う', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(escapeHtml('A & B')).toBe('A &amp; B');
      expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
    });
  });
});
