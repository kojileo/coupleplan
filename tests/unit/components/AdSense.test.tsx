import { render } from '@testing-library/react';

import { AdSense, BannerAd, SquareAd, ResponsiveAd } from '@/components/AdSense';

// グローバルのwindowオブジェクトをモック
const mockPush = jest.fn();
Object.defineProperty(window, 'adsbygoogle', {
  value: mockPush,
  writable: true,
});

// 環境変数をモック
const mockEnv = {
  NEXT_PUBLIC_ADSENSE_CLIENT_ID: 'ca-pub-1234567890123456',
};

// 元の環境変数を保存
const originalEnv = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

describe('AdSense Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 環境変数をモック
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = mockEnv.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
    // windowオブジェクトのリセット
    (window as any).adsbygoogle = [];
  });

  afterAll(() => {
    // 環境変数を復元
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = originalEnv;
  });

  describe('AdSense', () => {
    it('基本的なAdSense要素をレンダリングする', () => {
      const { container } = render(<AdSense adSlot="1234567890" />);

      const insElement = container.querySelector('ins.adsbygoogle');
      expect(insElement).toBeInTheDocument();
      expect(insElement).toHaveAttribute('data-ad-client', mockEnv.NEXT_PUBLIC_ADSENSE_CLIENT_ID);
      expect(insElement).toHaveAttribute('data-ad-slot', '1234567890');
      expect(insElement).toHaveAttribute('data-ad-format', 'auto');
      expect(insElement).toHaveAttribute('data-full-width-responsive', 'true');
    });

    it('カスタムプロパティを正しく設定する', () => {
      const customStyle = { display: 'block', width: '200px' };
      const customClass = 'custom-ad-class';

      const { container } = render(
        <AdSense
          adSlot="9876543210"
          adFormat="rectangle"
          fullWidthResponsive={false}
          style={customStyle}
          className={customClass}
        />
      );

      const insElement = container.querySelector('ins.adsbygoogle');
      expect(insElement).toHaveClass('adsbygoogle', customClass);
      expect(insElement).toHaveAttribute('data-ad-format', 'rectangle');
      expect(insElement).toHaveAttribute('data-full-width-responsive', 'false');
      expect(insElement).toHaveStyle(customStyle);
    });

    it('adsbygoogleが存在する場合にpushを呼び出す', () => {
      const mockAdsbygoogle = jest.fn();
      (window as any).adsbygoogle = { push: mockAdsbygoogle };

      render(<AdSense adSlot="1234567890" />);

      // useEffectの実行を待つ
      expect(mockAdsbygoogle).toHaveBeenCalledWith({});
    });

    it('adsbygoogleでエラーが発生してもクラッシュしない', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // adsbygoogleのpushでエラーを発生させる
      (window as any).adsbygoogle = {
        push: jest.fn(() => {
          throw new Error('AdSense error');
        }),
      };

      expect(() => {
        render(<AdSense adSlot="1234567890" />);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('AdSense error:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('BannerAd', () => {
    it('バナー広告用の設定でレンダリングする', () => {
      const { container } = render(<BannerAd adSlot="banner123" className="banner-class" />);

      const insElement = container.querySelector('ins.adsbygoogle');
      expect(insElement).toBeInTheDocument();
      expect(insElement).toHaveClass('banner-class');
      expect(insElement).toHaveAttribute('data-ad-slot', 'banner123');
      expect(insElement).toHaveStyle({
        display: 'block',
        width: '100%',
        height: '90px',
      });
    });
  });

  describe('SquareAd', () => {
    it('正方形広告用の設定でレンダリングする', () => {
      const { container } = render(<SquareAd adSlot="square456" className="square-class" />);

      const insElement = container.querySelector('ins.adsbygoogle');
      expect(insElement).toBeInTheDocument();
      expect(insElement).toHaveClass('square-class');
      expect(insElement).toHaveAttribute('data-ad-slot', 'square456');
      expect(insElement).toHaveStyle({
        display: 'block',
        width: '300px',
        height: '250px',
      });
    });
  });

  describe('ResponsiveAd', () => {
    it('レスポンシブ広告用の設定でレンダリングする', () => {
      const { container } = render(
        <ResponsiveAd adSlot="responsive789" className="responsive-class" />
      );

      const insElement = container.querySelector('ins.adsbygoogle');
      expect(insElement).toBeInTheDocument();
      expect(insElement).toHaveClass('responsive-class');
      expect(insElement).toHaveAttribute('data-ad-slot', 'responsive789');
      expect(insElement).toHaveAttribute('data-full-width-responsive', 'true');
      expect(insElement).toHaveStyle({ display: 'block' });
    });
  });
});
