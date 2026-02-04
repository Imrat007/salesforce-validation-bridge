import Button from '../common/Button';

const RuleCard = ({ rule, onToggle, isToggling }) => {
  return (
    <div className="rule-card">
      <div className="rule-card-header">
        <div className="rule-info">
          <h3 className="rule-name">{rule.ValidationName}</h3>
          <p className="rule-entity">{rule.EntityName}</p>
        </div>
        <span className={`status-badge ${rule.Active ? 'status-enabled' : 'status-disabled'}`}>
          {rule.Active ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <circle cx="6" cy="6" r="6"/>
              </svg>
              Enabled
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <circle cx="6" cy="6" r="6"/>
              </svg>
              Disabled
            </>
          )}
        </span>
      </div>

      <div className="rule-card-body">
        <p className="rule-id">ID: {rule.Id}</p>
      </div>

      <div className="rule-card-footer">
        <Button
          variant={rule.Active ? 'danger' : 'success'}
          onClick={() => onToggle(rule)}
          disabled={isToggling}
          icon={
            rule.Active ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zM5 7a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm1-11a1 1 0 1 0-2 0v3H4a1 1 0 1 0 0 2h3v3a1 1 0 1 0 2 0V9h3a1 1 0 1 0 0-2H9V4z"/>
              </svg>
            )
          }
        >
          {isToggling ? 'Updating...' : (rule.Active ? 'Disable' : 'Enable')}
        </Button>
      </div>
    </div>
  );
};

export default RuleCard;