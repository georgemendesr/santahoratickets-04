
import { useState, useEffect } from 'react';
import { TestCase, TestProgress, TestStatus } from '@/types/testing.types';
import { testCategories } from '@/data/testCases';

export function useTestProgress() {
  const [tests, setTests] = useState<TestCase[]>([]);
  const [progress, setProgress] = useState<TestProgress>({
    total: 0,
    tested: 0,
    success: 0,
    errors: 0,
    notTested: 0
  });

  useEffect(() => {
    // Carregar todos os testes das categorias
    const allTests = testCategories.flatMap(category => category.tests);
    
    // Carregar status salvos do localStorage
    const savedTests = localStorage.getItem('testResults');
    if (savedTests) {
      const parsed = JSON.parse(savedTests);
      const updatedTests = allTests.map(test => ({
        ...test,
        ...parsed[test.id]
      }));
      setTests(updatedTests);
    } else {
      setTests(allTests);
    }
  }, []);

  useEffect(() => {
    // Calcular progresso
    const total = tests.length;
    const success = tests.filter(t => t.status === 'success').length;
    const errors = tests.filter(t => t.status === 'error').length;
    const notTested = tests.filter(t => t.status === 'not_tested').length;
    const tested = total - notTested;

    setProgress({
      total,
      tested,
      success,
      errors,
      notTested
    });
  }, [tests]);

  const updateTestStatus = (testId: string, status: TestStatus, comments?: string) => {
    const updatedTests = tests.map(test => 
      test.id === testId 
        ? { 
            ...test, 
            status, 
            comments,
            tested_at: new Date().toISOString(),
            tested_by: 'user'
          }
        : test
    );
    
    setTests(updatedTests);
    
    // Salvar no localStorage
    const testResults = updatedTests.reduce((acc, test) => {
      acc[test.id] = {
        status: test.status,
        comments: test.comments,
        tested_at: test.tested_at,
        tested_by: test.tested_by
      };
      return acc;
    }, {} as Record<string, any>);
    
    localStorage.setItem('testResults', JSON.stringify(testResults));
  };

  const getTestsByCategory = (categoryId: string) => {
    return tests.filter(test => test.category === categoryId);
  };

  const exportResults = () => {
    const results = {
      date: new Date().toISOString(),
      progress,
      tests: tests.map(test => ({
        categoria: testCategories.find(c => c.id === test.category)?.name,
        funcionalidade: test.title,
        status: test.status,
        comentarios: test.comments || '',
        testado_em: test.tested_at || ''
      }))
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teste-funcionalidades-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    tests,
    progress,
    updateTestStatus,
    getTestsByCategory,
    exportResults
  };
}
