// CouplePlan 共通JavaScript

// DOM読み込み完了後の初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// アプリケーション初期化
function initializeApp() {
    // ナビゲーションの初期化
    initializeNavigation();
    
    // フォームの初期化
    initializeForms();
    
    // モーダルの初期化
    initializeModals();
    
    // トースト通知の初期化
    initializeToasts();
    
    // アコーディオンの初期化
    initializeAccordions();
    
    // タブの初期化
    initializeTabs();
    
    // ドロップダウンの初期化
    initializeDropdowns();
    
    // プログレスバーの初期化
    initializeProgressBars();
    
    // ステッパーの初期化
    initializeSteppers();
    
    // アクセシビリティの初期化
    initializeAccessibility();
}

// ナビゲーション初期化
function initializeNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // メニュー外クリックで閉じる
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
}

// フォーム初期化
function initializeForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // バリデーション
        form.addEventListener('submit', function(event) {
            if (!validateForm(form)) {
                event.preventDefault();
            }
        });
        
        // リアルタイムバリデーション
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(input);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(input);
            });
        });
    });
}

// フォームバリデーション
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// フィールドバリデーション
function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    let isValid = true;
    let errorMessage = '';
    
    // 必須チェック
    if (required && !value) {
        isValid = false;
        errorMessage = 'この項目は必須です';
    }
    
    // タイプ別バリデーション
    if (value && type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = '有効なメールアドレスを入力してください';
        }
    }
    
    if (value && type === 'tel') {
        const telRegex = /^[0-9-+()\s]+$/;
        if (!telRegex.test(value)) {
            isValid = false;
            errorMessage = '有効な電話番号を入力してください';
        }
    }
    
    if (value && type === 'password') {
        if (value.length < 8) {
            isValid = false;
            errorMessage = 'パスワードは8文字以上で入力してください';
        }
    }
    
    // エラー表示
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

// フィールドエラー表示
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#ef4444';
}

// フィールドエラー削除
function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.style.borderColor = '';
}

// モーダル初期化
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal;
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                closeModal(modal);
            });
        }
        
        overlay.addEventListener('click', function(event) {
            if (event.target === overlay) {
                closeModal(modal);
            }
        });
    });
}

// モーダル表示
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// モーダル非表示
function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// トースト通知初期化
function initializeToasts() {
    // トースト通知のスタイルを動的に追加
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            top: 1rem;
            right: 1rem;
            background-color: var(--white);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            padding: 1rem;
            max-width: 400px;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        .toast.show {
            transform: translateX(0);
        }
    `;
    document.head.appendChild(style);
}

// トースト通知表示
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-title">${getToastTitle(type)}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    // 表示アニメーション
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // 自動削除
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

// トーストタイトル取得
function getToastTitle(type) {
    const titles = {
        success: '成功',
        error: 'エラー',
        warning: '警告',
        info: '情報'
    };
    return titles[type] || '通知';
}

// アコーディオン初期化
function initializeAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isActive = this.classList.contains('active');
            
            // 他のアコーディオンを閉じる
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== this) {
                    otherHeader.classList.remove('active');
                    otherHeader.nextElementSibling.classList.remove('active');
                }
            });
            
            // 現在のアコーディオンを切り替え
            if (isActive) {
                this.classList.remove('active');
                content.classList.remove('active');
            } else {
                this.classList.add('active');
                content.classList.add('active');
            }
        });
    });
}

// タブ初期化
function initializeTabs() {
    const tabLinks = document.querySelectorAll('.tab-link');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            const tabId = this.getAttribute('href').substring(1);
            const tabContent = document.getElementById(tabId);
            
            if (tabContent) {
                // 他のタブを非アクティブ
                document.querySelectorAll('.tab-link').forEach(otherLink => {
                    otherLink.classList.remove('active');
                });
                document.querySelectorAll('.tab-content').forEach(otherContent => {
                    otherContent.classList.remove('active');
                });
                
                // 現在のタブをアクティブ
                this.classList.add('active');
                tabContent.classList.add('active');
            }
        });
    });
}

// ドロップダウン初期化
function initializeDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', function(event) {
                event.stopPropagation();
                menu.classList.toggle('active');
            });
        }
    });
    
    // ドロップダウン外クリックで閉じる
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('active');
        });
    });
}

// プログレスバー初期化
function initializeProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    progressBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress') || 0;
        bar.style.width = progress + '%';
    });
}

// プログレスバー更新
function updateProgress(barId, progress) {
    const bar = document.getElementById(barId);
    if (bar) {
        bar.style.width = progress + '%';
        bar.setAttribute('data-progress', progress);
    }
}

// ステッパー初期化
function initializeSteppers() {
    const stepperItems = document.querySelectorAll('.stepper-item');
    
    stepperItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            // ステッパーの状態更新
            updateStepper(index);
        });
    });
}

// ステッパー更新
function updateStepper(currentStep) {
    const stepperItems = document.querySelectorAll('.stepper-item');
    
    stepperItems.forEach((item, index) => {
        if (index < currentStep) {
            item.classList.add('completed');
            item.classList.remove('active');
        } else if (index === currentStep) {
            item.classList.add('active');
            item.classList.remove('completed');
        } else {
            item.classList.remove('active', 'completed');
        }
    });
}

// アクセシビリティ初期化
function initializeAccessibility() {
    // キーボードナビゲーション
    document.addEventListener('keydown', function(event) {
        // ESCキーでモーダルを閉じる
        if (event.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
        
        // Tabキーでフォーカス管理
        if (event.key === 'Tab') {
            const focusableElements = document.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    });
    
    // フォーカス表示の強化
    document.addEventListener('focusin', function(event) {
        event.target.style.outline = '3px solid var(--primary-color)';
        event.target.style.outlineOffset = '2px';
    });
    
    document.addEventListener('focusout', function(event) {
        event.target.style.outline = '';
        event.target.style.outlineOffset = '';
    });
}

// ユーティリティ関数

// デバウンス関数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// スロットル関数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ローカルストレージ管理
const storage = {
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('ローカルストレージへの保存に失敗しました:', e);
        }
    },
    
    get: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('ローカルストレージからの読み込みに失敗しました:', e);
            return null;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('ローカルストレージからの削除に失敗しました:', e);
        }
    }
};

// 日付フォーマット
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day);
}

// 数値フォーマット
function formatNumber(num, decimals = 0) {
    return new Intl.NumberFormat('ja-JP', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

// 通貨フォーマット
function formatCurrency(amount, currency = 'JPY') {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// ページ遷移
function navigateTo(url) {
    window.location.href = url;
}

// 戻るボタン
function goBack() {
    window.history.back();
}

// ローディング表示
function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="spinner"></div>';
    }
}

// ローディング非表示
function hideLoading(element, content) {
    if (element) {
        element.innerHTML = content;
    }
}

// エラーハンドリング
function handleError(error, context = '') {
    console.error(`エラーが発生しました (${context}):`, error);
    showToast('エラーが発生しました。しばらく時間をおいてから再度お試しください。', 'error');
}

// 成功メッセージ
function showSuccess(message) {
    showToast(message, 'success');
}

// 警告メッセージ
function showWarning(message) {
    showToast(message, 'warning');
}

// 情報メッセージ
function showInfo(message) {
    showToast(message, 'info');
}

// 確認ダイアログ
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// 非同期処理のラッパー
async function safeAsync(fn, errorMessage = '処理中にエラーが発生しました') {
    try {
        return await fn();
    } catch (error) {
        handleError(error);
        throw new Error(errorMessage);
    }
}

// グローバル関数のエクスポート
window.CouplePlan = {
    showModal,
    closeModal,
    showToast,
    showSuccess,
    showWarning,
    showInfo,
    confirmAction,
    navigateTo,
    goBack,
    showLoading,
    hideLoading,
    updateProgress,
    updateStepper,
    storage,
    formatDate,
    formatNumber,
    formatCurrency,
    debounce,
    throttle,
    safeAsync
};
