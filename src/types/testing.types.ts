
export type TestStatus = 'not_tested' | 'success' | 'error' | 'in_progress';

export interface TestCase {
  id: string;
  category: string;
  title: string;
  description: string;
  steps: string[];
  status: TestStatus;
  comments?: string;
  tested_at?: string;
  tested_by?: string;
}

export interface TestCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  tests: TestCase[];
}

export interface TestProgress {
  total: number;
  tested: number;
  success: number;
  errors: number;
  notTested: number;
}
