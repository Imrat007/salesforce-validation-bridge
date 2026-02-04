import { useState, useCallback, useMemo } from 'react';
import { fetchRules, toggleRule } from '../services/api';

export const useRules = (loggedIn) => {
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const fetchValidationRules = useCallback(async () => {
    if (!loggedIn) return;
    
    setRulesLoading(true);
    try {
      const data = await fetchRules();
      setRules(data.records || []);
      return { 
        success: true, 
        message: data.records && data.records.length > 0 
          ? `Successfully loaded ${data.records.length} validation rule${data.records.length === 1 ? '' : 's'}`
          : 'No validation rules found in this Salesforce org'
      };
    } catch (error) {
      console.error('Failed to fetch rules:', error);
      setRules([]);
      return { success: false, message: 'Failed to fetch validation rules. Please check your connection.' };
    } finally {
      setRulesLoading(false);
    }
  }, [loggedIn]);

  const handleToggle = useCallback(async (rule, showToast) => {
    const ruleId = rule.Id;
    const newActive = !rule.Active;

    setTogglingId(ruleId);
    try {
      await toggleRule(ruleId, newActive);
      
      setRules((prev) =>
        prev.map((r) => (r.Id === ruleId ? { ...r, Active: newActive } : r))
      );

      if (showToast) {
        showToast(
          `Validation rule "${rule.ValidationName}" has been ${newActive ? 'enabled' : 'disabled'}`,
          'success'
        );
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      if (showToast) {
        showToast('Failed to update validation rule. Please try again.', 'error');
      }
      return { success: false };
    } finally {
      setTogglingId(null);
    }
  }, []);

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch = rule.ValidationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rule.EntityName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterActive === 'all' ||
                           (filterActive === 'active' && rule.Active) ||
                           (filterActive === 'inactive' && !rule.Active);

      return matchesSearch && matchesFilter;
    });
  }, [rules, searchTerm, filterActive]);

  return {
    rules,
    rulesLoading,
    togglingId,
    searchTerm,
    filterActive,
    setSearchTerm,
    setFilterActive,
    fetchValidationRules,
    handleToggle,
    filteredRules,
  };
};