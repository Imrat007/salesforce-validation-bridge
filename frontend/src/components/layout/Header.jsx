import Button from '../common/Button';

const Header = ({ loggedIn, userInfo, onLogout, onRefresh, rulesLoading }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="sf-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#00A1E0"/>
              <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm0 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" fill="#fff"/>
              <path d="M20 14a6 6 0 100 12 6 6 0 000-12zm0 9a3 3 0 110-6 3 3 0 010 6z" fill="#fff"/>
            </svg>
          </div>
          <div>
            <h1 className="title">Validation Rules Bridge</h1>
            <p className="subtitle">Manage Salesforce validation rules with ease</p>
          </div>
        </div>

        {loggedIn && userInfo && (
          <div className="user-info">
            <div className="user-details">
              <div className="user-name">{userInfo.username}</div>
              <div className="user-meta">
                <span className="user-type">{userInfo.userType}</span>
                {userInfo.email && <span className="user-email">{userInfo.email}</span>}
              </div>
            </div>
            <div className="user-actions">
              <Button
                variant="primary"
                onClick={onRefresh}
                disabled={rulesLoading}
                icon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                  </svg>
                }
              >
                {rulesLoading ? 'Loading...' : 'Refresh Rules'}
              </Button>
              <Button
                variant="secondary"
                onClick={onLogout}
                icon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                  </svg>
                }
              >
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;