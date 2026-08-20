import Button from '../common/Button';

const RuleCard = ({ rule, onToggle, isToggling, variant = 0 }) => {
  const styles = ['rule-style-blue', 'rule-style-cyan', 'rule-style-purple', 'rule-style-indigo', 'rule-style-sky', 'rule-style-electric'];
  const styleClass = styles[variant % styles.length];

  return (
    <article className={`rule-card ${styleClass}`}>
      <div className="rule-card-top">
        <span className="rule-index">RULE {String(variant + 1).padStart(2, '0')}</span>
        <span className={`status-badge ${rule.Active ? 'status-enabled' : 'status-disabled'}`}>{rule.Active ? 'Enabled' : 'Disabled'}</span>
      </div>
      <div className="rule-symbol">{(rule.EntityName || 'VR').slice(0, 2).toUpperCase()}</div>
      <div className="rule-card-content">
        <span className="rule-entity">{rule.EntityName}</span>
        <h3 className="rule-name">{rule.ValidationName}</h3>
        <p className="rule-id">{rule.Id}</p>
      </div>
      <div className="rule-card-footer">
        <span className="rule-state">{rule.Active ? 'Rule is enforcing validation' : 'Rule is currently bypassed'}</span>
        <Button variant={rule.Active ? 'danger' : 'success'} onClick={() => onToggle(rule)} disabled={isToggling}>
          {isToggling ? 'Updating' : rule.Active ? 'Disable' : 'Enable'}
        </Button>
      </div>
    </article>
  );
};

export default RuleCard;
