const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          © 2026 Salesforce Validation Rules Bridge · Built with React & Express
        </p>
        <div className="footer-links">
          <a href="https://developer.salesforce.com" target="_blank" rel="noopener noreferrer" className="footer-link">
            Salesforce Docs
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;