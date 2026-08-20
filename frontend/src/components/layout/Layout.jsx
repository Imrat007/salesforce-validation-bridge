import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, loggedIn, onLogout, onLogin, onHome }) => {
  return (
    <div className="app-shell">
      <Header loggedIn={loggedIn} onLogout={onLogout} onLogin={onLogin} onHome={onHome} />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
