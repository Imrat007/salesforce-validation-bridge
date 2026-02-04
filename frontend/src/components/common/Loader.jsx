const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="app">
      <div className="loader-container">
        <div className="spinner"></div>
        <p className="loading-text">{text}</p>
      </div>
    </div>
  );
};

export default Loader;