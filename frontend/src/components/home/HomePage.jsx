import Button from '../common/Button';

const HomePage = ({ loggedIn, onOpenRules, onOpenProfile, onOpenLogin }) => {
  return (
    <div className="home-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">SALESFORCE VALIDATION MANAGEMENT</span>
          <h1>Control your Salesforce validation rules from one clean workspace.</h1>
          <p>
            This project connects a React interface with Salesforce through secure OAuth 2.0 and the Tooling API. It lets authorized users fetch validation rules, search them, filter their status, and enable or disable rules without leaving the application.
          </p>
          <div className="hero-actions">
            {loggedIn ? (
              <>
                <Button variant="primary" size="large" onClick={onOpenRules}>Manage Validation Rules</Button>
                <Button variant="outline" size="large" onClick={onOpenProfile}>View Salesforce Profile</Button>
              </>
            ) : (
              <button className="hero-link" onClick={onOpenLogin}>Connect Salesforce to get started</button>
            )}
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-core"><span>SF</span></div>
        </div>
      </section>

      <section className="project-intro">
        <div>
          <span className="section-kicker">WHY THIS PROJECT</span>
          <h2>From Salesforce setup to everyday rule management.</h2>
        </div>
        <p>
          Salesforce validation rules are important because they stop invalid records from being saved. Managing many rules directly inside Salesforce can become repetitive when you only need to check status or switch a rule on or off. This application provides a focused interface for that workflow while keeping authentication and Salesforce API communication on the backend.
        </p>
      </section>

      <section className="benefit-grid">
        <article className="benefit-card benefit-card-blue">
          <span className="card-number">01</span>
          <h3>Secure connection</h3>
          <p>OAuth 2.0 with PKCE keeps Salesforce credentials and client secrets on the backend instead of exposing them in the browser.</p>
        </article>
        <article className="benefit-card benefit-card-cyan">
          <span className="card-number">02</span>
          <h3>Live rule visibility</h3>
          <p>Fetch validation rules from the connected Salesforce org and see their entity, name, ID, and current status in one place.</p>
        </article>
        <article className="benefit-card benefit-card-purple">
          <span className="card-number">03</span>
          <h3>Fast status control</h3>
          <p>Enable or disable a rule from the interface and receive immediate feedback when Salesforce accepts the update.</p>
        </article>
      </section>

      <section className="workflow-panel">
        <div className="workflow-heading">
          <span className="section-kicker">HOW IT WORKS</span>
          <h2>Simple flow, real Salesforce actions.</h2>
        </div>
        <div className="workflow-grid">
          <div className="workflow-step"><span>01</span><div><h3>Connect</h3><p>Choose your Salesforce environment and complete OAuth authorization.</p></div></div>
          <div className="workflow-step"><span>02</span><div><h3>Fetch</h3><p>The backend uses the authenticated session to query validation rules.</p></div></div>
          <div className="workflow-step"><span>03</span><div><h3>Review</h3><p>Search rules or filter the list by enabled and disabled status.</p></div></div>
          <div className="workflow-step"><span>04</span><div><h3>Update</h3><p>Toggle a rule and send the change back to Salesforce through the Tooling API.</p></div></div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
