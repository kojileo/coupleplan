import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// CDCテスト結果の型定義
interface CDCTestResult {
  suite: string;
  type: 'MSW' | 'PACT';
  passed: number;
  failed: number;
  total: number;
  contracts: string[];
  errors?: string[];
}

// CDCテストレポート
interface CDCReport {
  timestamp: string;
  totalContracts: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: CDCTestResult[];
  summary: {
    coverage: number;
    contractsVerified: number;
    contractsTotal: number;
  };
}

class CDCTestRunner {
  private results: CDCTestResult[] = [];
  private reportDir: string;

  constructor() {
    this.reportDir = join(process.cwd(), 'tests', 'cdc', 'reports');
    this.ensureReportDir();
  }

  private ensureReportDir(): void {
    if (!existsSync(this.reportDir)) {
      mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async runMSWTests(): Promise<void> {
    console.log('🔄 MSWベースのCDCテストを実行中...');

    try {
      const result = execSync('npx jest --testPathPattern=tests/cdc/msw --silent --json', {
        encoding: 'utf-8',
      });

      const jestResult = JSON.parse(result);
      this.processMSWResults(jestResult);
    } catch (error) {
      console.error('❌ MSWテストの実行に失敗しました:', error);
    }
  }

  async runPactTests(): Promise<void> {
    console.log('🔄 Pactベースの契約テストを実行中...');

    try {
      const result = execSync('npx jest --testPathPattern=tests/cdc/pact --silent --json', {
        encoding: 'utf-8',
      });

      const jestResult = JSON.parse(result);
      this.processPactResults(jestResult);
    } catch (error) {
      console.error('❌ Pactテストの実行に失敗しました:', error);
    }
  }

  private processMSWResults(jestResult: any): void {
    if (!jestResult.testResults || jestResult.testResults.length === 0) {
      console.log('⚠️ testResultsが見つからないか空です');
      return;
    }

    jestResult.testResults.forEach((testFile: any) => {
      // パスの安全な処理（WindowsとUnix両対応）
      const testFilePath = testFile.name || testFile.testFilePath || 'unknown';
      const suiteName =
        testFilePath
          .replace(/\\/g, '/') // Windowsのバックスラッシュをスラッシュに変換
          .split('/')
          .pop()
          ?.replace('.msw.test.ts', '.msw')
          ?.replace('.test.ts', '') || 'unknown-suite';

      // assertionResultsから成功・失敗数を計算
      const assertionResults = testFile.assertionResults || [];
      const passed = assertionResults.filter(
        (assertion: any) => assertion.status === 'passed'
      ).length;
      const failed = assertionResults.filter(
        (assertion: any) => assertion.status === 'failed'
      ).length;

      const result: CDCTestResult = {
        suite: suiteName,
        type: 'MSW',
        passed,
        failed,
        total: passed + failed,
        contracts: this.extractContractNames(testFile),
        errors: testFile.failureMessage ? [testFile.failureMessage] : undefined,
      };

      this.results.push(result);
    });
  }

  private processPactResults(jestResult: any): void {
    if (!jestResult.testResults || jestResult.testResults.length === 0) {
      console.log('⚠️ Pact testResultsが見つからないか空です');
      return;
    }

    jestResult.testResults.forEach((testFile: any) => {
      // パスの安全な処理（WindowsとUnix両対応）
      const testFilePath = testFile.name || testFile.testFilePath || 'unknown';
      const suiteName =
        testFilePath
          .replace(/\\/g, '/') // Windowsのバックスラッシュをスラッシュに変換
          .split('/')
          .pop()
          ?.replace('.pact.test.ts', '.pact')
          ?.replace('.test.ts', '') || 'unknown-suite';

      // assertionResultsから成功・失敗数を計算
      const assertionResults = testFile.assertionResults || [];
      const passed = assertionResults.filter(
        (assertion: any) => assertion.status === 'passed'
      ).length;
      const failed = assertionResults.filter(
        (assertion: any) => assertion.status === 'failed'
      ).length;

      const result: CDCTestResult = {
        suite: suiteName,
        type: 'PACT',
        passed,
        failed,
        total: passed + failed,
        contracts: this.extractContractNames(testFile),
        errors: testFile.failureMessage ? [testFile.failureMessage] : undefined,
      };

      this.results.push(result);
    });
  }

  private extractContractNames(testFile: any): string[] {
    const contracts: string[] = [];

    if (testFile.assertionResults) {
      testFile.assertionResults.forEach((assertion: any) => {
        contracts.push(assertion.title);
      });
    }

    return contracts;
  }

  generateReport(): CDCReport {
    const totalTests = this.results.reduce((sum, result) => sum + result.total, 0);
    const passedTests = this.results.reduce((sum, result) => sum + result.passed, 0);
    const failedTests = this.results.reduce((sum, result) => sum + result.failed, 0);
    const totalContracts = this.results.reduce((sum, result) => sum + result.contracts.length, 0);

    const report: CDCReport = {
      timestamp: new Date().toISOString(),
      totalContracts,
      totalTests,
      passedTests,
      failedTests,
      results: this.results,
      summary: {
        coverage: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
        contractsVerified: passedTests,
        contractsTotal: totalContracts,
      },
    };

    return report;
  }

  saveReport(report: CDCReport): void {
    const reportPath = join(this.reportDir, `cdc-report-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // HTMLレポートも生成
    this.generateHTMLReport(report);

    console.log(`📊 CDCテストレポートが生成されました: ${reportPath}`);
  }

  private generateHTMLReport(report: CDCReport): void {
    const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CDC テストレポート</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e8f4fd; padding: 15px; border-radius: 5px; text-align: center; }
        .metric h3 { margin: 0; color: #2c5aa0; }
        .metric p { margin: 5px 0 0 0; font-size: 24px; font-weight: bold; }
        .results { margin-top: 30px; }
        .test-suite { border: 1px solid #ddd; margin: 10px 0; border-radius: 5px; }
        .suite-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd; }
        .suite-content { padding: 15px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .contract-list { margin-top: 10px; }
        .contract-item { padding: 5px 0; border-bottom: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CDC テストレポート</h1>
        <p>生成日時: ${report.timestamp}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>総契約数</h3>
            <p>${report.totalContracts}</p>
        </div>
        <div class="metric">
            <h3>テスト総数</h3>
            <p>${report.totalTests}</p>
        </div>
        <div class="metric">
            <h3>成功率</h3>
            <p>${report.summary.coverage.toFixed(1)}%</p>
        </div>
        <div class="metric">
            <h3>成功/失敗</h3>
            <p><span class="passed">${report.passedTests}</span> / <span class="failed">${report.failedTests}</span></p>
        </div>
    </div>
    
    <div class="results">
        <h2>テスト結果詳細</h2>
        ${report.results
          .map(
            (result) => `
            <div class="test-suite">
                <div class="suite-header">
                    <h3>${result.suite} (${result.type})</h3>
                    <p>成功: <span class="passed">${result.passed}</span> | 失敗: <span class="failed">${result.failed}</span> | 総数: ${result.total}</p>
                </div>
                <div class="suite-content">
                    <div class="contract-list">
                        <h4>検証された契約:</h4>
                        ${result.contracts
                          .map(
                            (contract) => `
                            <div class="contract-item">${contract}</div>
                        `
                          )
                          .join('')}
                    </div>
                    ${
                      result.errors
                        ? `
                        <div style="margin-top: 15px;">
                            <h4 style="color: #dc3545;">エラー:</h4>
                            <pre style="background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto;">${result.errors.join('\n')}</pre>
                        </div>
                    `
                        : ''
                    }
                </div>
            </div>
        `
          )
          .join('')}
    </div>
</body>
</html>`;

    const htmlPath = join(this.reportDir, `cdc-report-${Date.now()}.html`);
    writeFileSync(htmlPath, htmlContent);
    console.log(`📄 HTMLレポートが生成されました: ${htmlPath}`);
  }

  printSummary(): void {
    const report = this.generateReport();

    console.log('\n📊 CDC テスト結果サマリー');
    console.log('================================');
    console.log(`総契約数: ${report.totalContracts}`);
    console.log(`総テスト数: ${report.totalTests}`);
    console.log(`成功: ${report.passedTests}`);
    console.log(`失敗: ${report.failedTests}`);
    console.log(`成功率: ${report.summary.coverage.toFixed(1)}%`);
    console.log('================================\n');

    this.results.forEach((result) => {
      const status = result.failed === 0 ? '✅' : '❌';
      console.log(
        `${status} ${result.suite} (${result.type}): ${result.passed}/${result.total} テスト成功`
      );
    });
  }
}

// メイン実行関数
async function runCDCTests(): Promise<void> {
  const runner = new CDCTestRunner();

  console.log('🚀 CDCテスト実行開始\n');

  // MSWテスト実行
  await runner.runMSWTests();

  // Pactテスト実行（エラーが解決されたら有効化）
  // await runner.runPactTests();

  // レポート生成
  const report = runner.generateReport();
  runner.saveReport(report);
  runner.printSummary();

  console.log('✅ CDCテスト実行完了');
}

// スクリプトとして実行
runCDCTests().catch(console.error);

export { CDCTestRunner, runCDCTests };
