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

    const loginUrl = buildLoginUrl(domainType, customDomain);
    window.location.href = loginUrl;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="#E6F4FF"/>
            <path d="M32 16C23.163 16 16 23.163 16 32s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zm0 28c-6.627 0-12-5.373-12-12s5.373-12 12-12 12 5.373 12 12-5.373 12-12 12z" fill="#00A1E0"/>
            <path d="M32 24a8 8 0 100 16 8 8 0 000-16zm0 12a4 4 0 110-8 4 4 0 010 8z" fill="#00A1E0"/>
          </svg>
        </div>

        <h2 className="login-title">Connect to Salesforce</h2>
        <p className="login-subtitle">
          Select your Salesforce environment to manage validation rules
        </p>

        <DomainSelector
          domainType={domainType}
          customDomain={customDomain}
          onDomainTypeChange={setDomainType}
          onCustomDomainChange={setCustomDomain}
        />

        <Button
          variant="primary"
          size="large"
          onClick={handleLogin}
          fullWidth
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          }
        >
          Login with Salesforce
        </Button>

        <div className="login-footer">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
          </svg>
          Secure OAuth 2.0 authentication
        </div>
      </div>
    </div>
  );
};

export default LoginForm;