import { DOMAIN_TYPES } from '../../utils/constants';

const DomainSelector = ({ domainType, customDomain, onDomainTypeChange, onCustomDomainChange }) => {
  const domains = [
    { value: DOMAIN_TYPES.PRODUCTION, title: 'Production', description: 'login.salesforce.com' },
    { value: DOMAIN_TYPES.CUSTOM, title: 'Custom Domain', description: 'Use your Salesforce My Domain' },
  ];

  return (
    <div className="domain-selector">
      <label className="form-label">Salesforce environment</label>
      <div className="domain-options">
        {domains.map((domain) => (
          <label key={domain.value} className={`domain-option ${domainType === domain.value ? 'selected' : ''}`}>
            <input type="radio" name="domain" value={domain.value} checked={domainType === domain.value} onChange={(event) => onDomainTypeChange(event.target.value)} />
            <span className="domain-radio" />
            <span className="domain-copy"><strong>{domain.title}</strong><small>{domain.description}</small></span>
          </label>
        ))}
      </div>
      {domainType === DOMAIN_TYPES.CUSTOM && (
        <div className="custom-domain-wrap">
          <input
            className="form-input"
            type="url"
            value={customDomain}
            onChange={(event) => onCustomDomainChange(event.target.value)}
            placeholder="https://yourdomain.my.salesforce.com"
          />
          <p className="form-hint">Enter the complete My Domain URL.</p>
        </div>
      )}
    </div>
  );
};

export default DomainSelector;
