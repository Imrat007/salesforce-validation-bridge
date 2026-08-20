const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="loader-box">
      <div className="loader-box">
        <div className="loader-spinner"></div>
        <p className="loading-text">{text}</p>
      </div>
    </div>
  );
};

export default Loader;
