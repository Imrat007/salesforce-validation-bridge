const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  icon,
  fullWidth = false,
  type = 'button',
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'large' ? 'btn-large' : '';
  const widthClass = fullWidth ? 'btn-full-width' : '';

  const className = [baseClass, variantClass, sizeClass, widthClass]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {disabled && variant === 'primary' ? (
        <>
          <span className="btn-spinner"></span>
          {children}
        </>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;