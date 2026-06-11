const LoadingScreen = ({ message = 'Loading...' }) => (
  <div className="loading-screen">
    <div className="spinner" />
    <p>{message}</p>
  </div>
);

export default LoadingScreen;
