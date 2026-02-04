import { useState, useEffect, useCallback } from 'react';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import RulesSection from './components/rules/Rulessection';
import Alert from './components/common/Alert';
import Loader from './components/common/Loader';
import EmptyState from './components/rules/EmptyState';
import { useAuth } from './hooks/useAuth';
import { useRules } from './hooks/useRules';
import { useToast } from './hooks/useToast';
import './index.css';

function App() {
  const { 
    loggedIn, 
    userInfo, 
    loading, 
    checkAuth, 
    handleLogout 
  } = useAuth();
  
  const {
    rules,
    rulesLoading,
    togglingId,
    searchTerm,
    filterActive,
    setSearchTerm,
    setFilterActive,
    fetchValidationRules,
    handleToggle,
    filteredRules
  } = useRules(loggedIn);

  const { toast, showToast, clearToast } = useToast();

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const successParam = params.get('success');
    const errorParam = params.get('error');

    if (successParam === '1') {
      showToast('Successfully logged in to Salesforce!', 'success');
      checkAuth();
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (errorParam) {
      showToast(decodeURIComponent(errorParam), 'error');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkAuth, showToast]);

  if (loading) {
    return <Loader text="Checking authentication..." />;
  }

  return (
    <Layout 
      loggedIn={loggedIn} 
      userInfo={userInfo}
      onLogout={handleLogout}
      onRefresh={fetchValidationRules}
      rulesLoading={rulesLoading}
    >
      {toast && (
        <Alert 
          type={toast.type} 
          message={toast.message} 
          onClose={clearToast} 
        />
      )}

      {!loggedIn ? (
        <LoginForm onShowToast={showToast} />
      ) : (
        <>
          {rules.length > 0 ? (
            <RulesSection
              rules={filteredRules}
              searchTerm={searchTerm}
              filterActive={filterActive}
              onSearchChange={setSearchTerm}
              onFilterChange={setFilterActive}
              onToggle={(rule) => handleToggle(rule, showToast)}
              togglingId={togglingId}
            />
          ) : (
            !rulesLoading && (
              <EmptyState
                title="No Validation Rules Yet"
                message="Click the 'Refresh Rules' button above to load validation rules from your Salesforce org."
                onAction={fetchValidationRules}
                actionText="Load Validation Rules"
                loading={rulesLoading}
              />
            )
          )}
        </>
      )}
    </Layout>
  );
}

export default App;