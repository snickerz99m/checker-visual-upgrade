// Dynamic checker configuration that updates when custom checkers are added
import { CheckerConfig, CHECKER_CONFIGS, CHECKER_CATEGORIES, getGroupedCheckers } from './checkers';

// Load custom checkers from localStorage
export const getCustomCheckers = (): CheckerConfig[] => {
  try {
    const savedCheckers = localStorage.getItem('customCheckers');
    return savedCheckers ? JSON.parse(savedCheckers) : [];
  } catch (error) {
    console.error('Error loading custom checkers:', error);
    return [];
  }
};

// Get all checkers (built-in + custom)
export const getAllCheckers = (): CheckerConfig[] => {
  return [...CHECKER_CONFIGS, ...getCustomCheckers()];
};

// Get grouped checkers including custom ones
export const getDynamicGroupedCheckers = () => {
  const allCheckers = getAllCheckers();
  const grouped: Record<string, CheckerConfig[]> = {};
  
  allCheckers.forEach(checker => {
    if (!grouped[checker.category]) {
      grouped[checker.category] = [];
    }
    grouped[checker.category].push(checker);
  });
  
  return grouped;
};

// Get all checker file names for API endpoints (including custom)
export const getAllDynamicCheckerFiles = () => {
  return getAllCheckers().map(checker => checker.value);
};

// Save custom checker to localStorage
export const saveCustomChecker = (checker: CheckerConfig) => {
  const customCheckers = getCustomCheckers();
  const updatedCheckers = [...customCheckers, checker];
  localStorage.setItem('customCheckers', JSON.stringify(updatedCheckers));
  
  // Trigger a custom event to notify other components
  window.dispatchEvent(new CustomEvent('checkersUpdated'));
};

// Remove custom checker from localStorage
export const removeCustomChecker = (checkerValue: string) => {
  const customCheckers = getCustomCheckers();
  const updatedCheckers = customCheckers.filter(c => c.value !== checkerValue);
  localStorage.setItem('customCheckers', JSON.stringify(updatedCheckers));
  
// Trigger a custom event to notify other components
  window.dispatchEvent(new CustomEvent('checkersUpdated'));
};

// Get all categories (built-in + custom)
export const getAllCategories = (): string[] => {
  const savedCategories = localStorage.getItem('customCategories');
  const customCategories = savedCategories ? JSON.parse(savedCategories) : [];
  return [...Object.values(CHECKER_CATEGORIES), ...customCategories];
};

// Save custom category
export const saveCustomCategory = (category: string) => {
  const categories = localStorage.getItem('customCategories');
  const existing = categories ? JSON.parse(categories) : [];
  if (!existing.includes(category)) {
    const updated = [...existing, category];
    localStorage.setItem('customCategories', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('categoriesUpdated'));
  }
};

// Create PHP file in the public/php directory
export const createPHPFile = async (filename: string, content: string) => {
  // Since we can't directly write to filesystem, we'll store in localStorage
  // and provide download functionality
  const phpFiles = localStorage.getItem('phpFiles');
  const existing = phpFiles ? JSON.parse(phpFiles) : [];
  
  const fileData = {
    filename,
    content,
    lastModified: new Date().toISOString()
  };
  
  const updated = existing.filter((f: any) => f.filename !== filename);
  updated.push(fileData);
  
  localStorage.setItem('phpFiles', JSON.stringify(updated));
  
  // Trigger download for user to save to their php folder
  const blob = new Blob([content], { type: 'text/php' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  
  return fileData;
};