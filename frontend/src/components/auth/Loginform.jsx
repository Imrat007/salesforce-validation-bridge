import { useState } from 'react';
import DomainSelector from './Domainselector';
import Button from '../common/Button';
import { buildLoginUrl, validateCustomDomain } from '../../services/authService';
import { DOMAIN_TYPES } from '../../utils/constants';

const LoginForm = ({ onShowToast }) => {
  const [domainType, setDomainType] = useState(DOMAIN_TYPES.PRODUCTION);
  const [customDomain, setCustomDomain] = useState('');

  const handleLogin = () => {
    if (domainType === DOMAIN_TYPES.CUSTOM) {
      const error = validateCustomDomain(customDomain);
      if (error) {
        onShowToast(error, 'error');
        return;
      }
    }
    window.location.href = buildLoginUrl(domainType, customDomain);
  };

  return (
    <section className="login-page" id="login">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />
      <div className="login-card">
        <div className="login-brand"><span>SF</span></div>
        <span className="eyebrow">SECURE SALESFORCE ACCESS</span>
        <h1>Connect your Salesforce org</h1>
        <p className="login-subtitle">Authorize the application with Salesforce OAuth 2.0. Your Salesforce password is never entered into this application.</p>
        <DomainSelector
          domainType={domainType}
          customDomain={customDomain}
          onDomainTypeChange={setDomainType}
          onCustomDomainChange={setCustomDomain}
        />
        <Button variant="primary" size="large" onClick={handleLogin} fullWidth>Continue with Salesforce</Button>
        <div className="login-security"><span className="security-dot" /> OAuth 2.0 · PKCE · Backend session</div>
      </div>
    </section>
  );
};

export default LoginForm;
