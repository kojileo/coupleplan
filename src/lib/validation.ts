import DOMPurify from 'isomorphic-dompurify';

// HTMLサニタイゼーション
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

// SQLインジェクション対策（基本的な検証）
export function validateInput(input: string): boolean {
  const sqlInjectionPattern =
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i;
  return !sqlInjectionPattern.test(input);
}

// メールアドレス検証強化
export function validateEmail(email: string): boolean {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}

// パスワード強度検証
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('パスワードは8文字以上である必要があります');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('パスワードには大文字を含める必要があります');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('パスワードには小文字を含める必要があります');
  }

  if (!/\d/.test(password)) {
    errors.push('パスワードには数字を含める必要があります');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('パスワードには特殊文字を含める必要があります');
  }

  return { valid: errors.length === 0, errors };
}

// URLバリデーション
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// 文字列長制限
export function validateStringLength(str: string, maxLength: number, minLength = 0): boolean {
  return str.length >= minLength && str.length <= maxLength;
}

// XSS対策のための文字列エスケープ
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}
