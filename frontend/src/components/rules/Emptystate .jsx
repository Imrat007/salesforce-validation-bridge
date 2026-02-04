import Button from '../common/Button';

const EmptyState = ({ title, message, onAction, actionText, loading, showAction = true }) => {
  return (
    <div className="empty-state">
      <div className={showAction ? 'empty-icon-large' : 'empty-icon'}>
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="60" fill="#E6F4FF"/>
          <path d="M60 30v60M30 60h60" stroke="#00A1E0" strokeWidth="6" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-text">{message}</p>
      {showAction && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          disabled={loading}
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
          }
        >
          {actionText || 'Load Rules'}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;