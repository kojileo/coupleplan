/**
 * バリデーションユーティリティ
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 名前のバリデーション
 */
export function validateName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: '名前を入力してください' };
  }

  if (name.length > 50) {
    return { valid: false, error: '名前は50文字以内で入力してください' };
  }

  return { valid: true };
}

/**
 * メールアドレスのバリデーション
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'メールアドレスを入力してください' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: '有効なメールアドレスを入力してください' };
  }

  return { valid: true };
}

/**
 * パスワードのバリデーション
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { valid: false, error: 'パスワードを入力してください' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'パスワードは8文字以上で入力してください' };
  }

  if (password.length > 100) {
    return { valid: false, error: 'パスワードは100文字以内で入力してください' };
  }

  // 英数字を含む
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, error: 'パスワードは英字と数字を含む必要があります' };
  }

  return { valid: true };
}

/**
 * 自己紹介のバリデーション
 */
export function validateBio(bio: string): ValidationResult {
  if (bio && bio.length > 500) {
    return { valid: false, error: '自己紹介は500文字以内で入力してください' };
  }

  return { valid: true };
}

/**
 * 居住地のバリデーション
 */
export function validateLocation(location: string): ValidationResult {
  if (location && location.length > 100) {
    return { valid: false, error: '居住地は100文字以内で入力してください' };
  }

  return { valid: true };
}

/**
 * 日付のバリデーション
 */
export function validateDate(date: string): ValidationResult {
  if (!date) {
    return { valid: true }; // 日付は任意
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return { valid: false, error: '有効な日付形式で入力してください（YYYY-MM-DD）' };
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return { valid: false, error: '有効な日付を入力してください' };
  }

  return { valid: true };
}

/**
 * プロフィールフォーム全体のバリデーション
 */
export interface ProfileFormData {
  name: string;
  email: string;
  location?: string;
  birthday?: string;
  anniversary?: string;
}

export interface ProfileValidationResult {
  valid: boolean;
  errors: {
    name?: string;
    email?: string;
    location?: string;
    birthday?: string;
    anniversary?: string;
  };
}

export function validateProfileForm(data: ProfileFormData): ProfileValidationResult {
  const errors: ProfileValidationResult['errors'] = {};
  let valid = true;

  // 名前のバリデーション
  const nameValidation = validateName(data.name);
  if (!nameValidation.valid) {
    errors.name = nameValidation.error;
    valid = false;
  }

  // メールアドレスのバリデーション
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
    valid = false;
  }

  // 居住地のバリデーション
  if (data.location) {
    const locationValidation = validateLocation(data.location);
    if (!locationValidation.valid) {
      errors.location = locationValidation.error;
      valid = false;
    }
  }

  // 誕生日のバリデーション
  if (data.birthday) {
    const birthdayValidation = validateDate(data.birthday);
    if (!birthdayValidation.valid) {
      errors.birthday = birthdayValidation.error;
      valid = false;
    }
  }

  // 記念日のバリデーション
  if (data.anniversary) {
    const anniversaryValidation = validateDate(data.anniversary);
    if (!anniversaryValidation.valid) {
      errors.anniversary = anniversaryValidation.error;
      valid = false;
    }
  }

  return { valid, errors };
}
