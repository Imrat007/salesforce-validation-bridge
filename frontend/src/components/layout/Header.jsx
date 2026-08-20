import Button from '../common/Button';

const Header = ({ loggedIn, onLogout, onLogin, onHome }) => {
  return (
    <header className="header">
      <div className="header-content">
        <button className="brand-button" onClick={onHome} aria-label="Open home page">
          <span className="brand-mark">SF</span>
          <span className="brand-copy"><strong>Validation</strong><small>Rule Bridge</small></span>
        </button>
        <div className="header-actions">
          {loggedIn && <span className="connection-indicator"><i /> Salesforce connected</span>}
          <Button variant="nav" onClick={loggedIn ? onLogout : onLogin}>
            {loggedIn ? 'Logout' : 'Login'}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
