import { DOMAIN_TYPES } from "../../utils/constants";

const DomainSelector = ({ domainType, customDomain, onDomainTypeChange, onCustomDomainChange }) => {
  const domains = [
    {
      value: DOMAIN_TYPES.PRODUCTION,
      title: 'Production',
      description: 'login.salesforce.com',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
      ),
    },
    // {
    //   value: DOMAIN_TYPES.SANDBOX,
    //   title: 'Sandbox',
    //   description: 'test.salesforce.com',
    //   icon: (
    //     <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    //       <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
    //       <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
    //     </svg>
    //   ),
    // },
    {
      value: DOMAIN_TYPES.CUSTOM,
      title: 'Custom Domain',
      description: 'Your My Domain URL',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
        </svg>
      ),
    },
    
  ];

  return (
    <div className="form-group">
      <label className="form-label">Environment Type</label>
      <div className="radio-group">
        {domains.map((domain) => (
          <label
            key={domain.value}
            className={`radio-label ${domainType === domain.value ? 'radio-selected' : ''}`}
          >
            <input
              type="radio"
              name="domain"
              value={domain.value}
              checked={domainType === domain.value}
              onChange={(e) => onDomainTypeChange(e.target.value)}
            />
            <div className="radio-content">
              <div className="radio-title">
                <span className="radio-icon">{domain.icon}</span>
                {domain.title}
              </div>
              <div className="radio-desc">{domain.description}</div>
            </div>
          </label>
        ))}
      </div>

      {domainType === DOMAIN_TYPES.CUSTOM && (
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label" htmlFor="customDomain">
            Custom Domain URL
          </label>
          <input
            id="customDomain"
            type="text"
            className="form-input"
            placeholder="https://yourdomain.my.salesforce.com"
            value={customDomain}
            onChange={(e) => onCustomDomainChange(e.target.value)}
          />
          <p className="form-hint">
            Enter your complete My Domain URL (must start with https:// and end with .salesforce.com)
          </p>
        </div>
      )}
    </div>
  );
};

export default DomainSelector;