import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, loggedIn, userInfo, onLogout, onRefresh, rulesLoading }) => {
  return (
    <div className="app">
      <Header 
        loggedIn={loggedIn}
        userInfo={userInfo}
        onLogout={onLogout}
        onRefresh={onRefresh}
        rulesLoading={rulesLoading}
      />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;