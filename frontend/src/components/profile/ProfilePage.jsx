import Button from '../common/Button';

const ProfilePage = ({ userInfo, onOpenRules, onLogout }) => {
  if (!userInfo) {
    return (
      <section className="profile-page">
        <div className="profile-empty glass-panel">
          <span className="section-kicker">SALESFORCE PROFILE</span>
          <h1>No Salesforce session</h1>
          <p>Connect your Salesforce org from the login panel to view the authenticated profile.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-hero glass-panel">
        <div className="profile-avatar">{(userInfo.username || 'U').slice(0, 1).toUpperCase()}</div>
        <div>
          <span className="section-kicker">CONNECTED PROFILE</span>
          <h1>{userInfo.username}</h1>
          <p>{userInfo.email || 'Salesforce authenticated user'}</p>
        </div>
        <span className="profile-status">Connected</span>
      </div>

      <div className="profile-grid">
        <div className="profile-detail-card profile-detail-blue"><span>USERNAME</span><strong>{userInfo.username || 'Not available'}</strong></div>
        <div className="profile-detail-card profile-detail-cyan"><span>EMAIL</span><strong>{userInfo.email || 'Not available'}</strong></div>
        <div className="profile-detail-card profile-detail-purple"><span>USER TYPE</span><strong>{userInfo.userType || 'Standard'}</strong></div>
        <div className="profile-detail-card profile-detail-green"><span>ENVIRONMENT</span><strong>{userInfo.domainType || 'Production'}</strong></div>
      </div>

      <div className="profile-instance glass-panel">
        <div><span className="section-kicker">SALESFORCE INSTANCE</span><h2>Connected organization</h2><p>{userInfo.instanceUrl || 'Instance URL unavailable'}</p></div>
        <div className="profile-actions"><Button variant="primary" onClick={onOpenRules}>Open Validation Rules</Button><Button variant="danger" onClick={onLogout}>Logout</Button></div>
      </div>
    </section>
  );
};

export default ProfilePage;
