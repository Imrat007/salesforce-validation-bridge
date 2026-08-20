import Button from '../common/Button';

const EmptyState = ({ title, message, onAction, actionText, loading, showAction = true }) => {
  return (
    <div className="empty-state">
      <div className={showAction ? 'empty-icon-large' : 'empty-icon'}>
        <svg className="empty-state-svg" viewBox="0 0 120 120" fill="none">
          <circle className="empty-icon-ring" cx="60" cy="60" r="56" />
          <circle className="empty-icon-bg" cx="60" cy="60" r="43" />
          <path
            className="empty-icon-document"
            d="M47 35h20l14 14v36H47a6 6 0 0 1-6-6V41a6 6 0 0 1 6-6Z"
          />
          <path
            className="empty-icon-fold"
            d="M67 35v14h14"
          />
          <path
            className="empty-icon-plus"
            d="M60 64v24M48 76h24"
          />
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
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
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
