import RuleCard from './RuleCard.jsx';

const RulesGrid = ({ rules, onToggle, togglingId }) => (
  <div className="rules-grid">
    {rules.map((rule, index) => (
      <RuleCard key={rule.Id} rule={rule} onToggle={onToggle} isToggling={togglingId === rule.Id} variant={index} />
    ))}
  </div>
);

export default RulesGrid;
