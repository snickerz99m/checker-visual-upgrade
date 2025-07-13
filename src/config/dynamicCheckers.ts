// Dynamic checker configuration that updates when custom checkers are added
import { CheckerConfig, CHECKER_CONFIGS, getGroupedCheckers } from './checkers';

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