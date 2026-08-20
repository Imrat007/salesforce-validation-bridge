import { useEffect, useState } from 'react';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/Loginform';
import HomePage from './components/home/HomePage';
import ProfilePage from './components/profile/ProfilePage';
import RulesSection from './components/rules/Rulessection';
import Alert from './components/common/Alert';
import Loader from './components/common/Loader';
import EmptyState from './components/rules/Emptystate .jsx';
import { useAuth } from './hooks/useAuth';
import { useRules } from './hooks/useRules';
import { useToast } from './hooks/useToast';
import './index.css';

function App() {
  const { loggedIn, userInfo, loading, checkAuth, handleLogout } = useAuth();
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
    filteredRules,
  } = useRules(loggedIn);
  const { toast, showToast, clearToast } = useToast();
  const [view, setView] = useState('home');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const successParam = params.get('success') || params.get('login');
    const errorParam = params.get('error');

    if (successParam === '1' || successParam === 'success') {
      showToast('Successfully connected to Salesforce.', 'success');
      checkAuth();
      setView('home');
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (errorParam) {
      showToast(decodeURIComponent(errorParam), 'error');
      setView('login');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkAuth, showToast]);

  useEffect(() => {
    if (loggedIn && view === 'rules' && rules.length === 0 && !rulesLoading) {
      fetchValidationRules();
    }
  }, [loggedIn, view, rules.length, rulesLoading, fetchValidationRules]);

  const openRules = () => setView('rules');
  const openProfile = () => setView('profile');
  const openLogin = () => setView('login');

  const logout = async () => {
    const result = await handleLogout();
    if (result.success) {
      setView('home');
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  if (loading) {
    return <Loader text="Checking Salesforce session..." />;
  }

  const content = view === 'login' && !loggedIn ? (
    <LoginForm onShowToast={showToast} />
  ) : view === 'profile' && loggedIn ? (
    <ProfilePage userInfo={userInfo} onOpenRules={openRules} onLogout={logout} />
  ) : view === 'rules' && loggedIn ? (
    rules.length > 0 ? (
      <RulesSection
        rules={filteredRules}
        searchTerm={searchTerm}
        filterActive={filterActive}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterActive}
        onToggle={(rule) => handleToggle(rule, showToast)}
        togglingId={togglingId}
        onRefresh={fetchValidationRules}
        rulesLoading={rulesLoading}
      />
    ) : (
      !rulesLoading && (
        <EmptyState
          title="No Validation Rules Yet"
          message="No rules were returned from the connected Salesforce org. Refresh the connection to try again."
          onAction={fetchValidationRules}
          actionText="Refresh Rules"
          loading={rulesLoading}
        />
      )
    )
  ) : (
    <HomePage loggedIn={loggedIn} onOpenRules={openRules} onOpenProfile={openProfile} onOpenLogin={openLogin} />
  );

  return (
    <Layout
      loggedIn={loggedIn}
      onLogout={logout}
      onLogin={openLogin}
      onHome={() => setView('home')}
    >
      {toast && <Alert type={toast.type} message={toast.message} onClose={clearToast} />}
      {content}
    </Layout>
  );
}

export default App;
