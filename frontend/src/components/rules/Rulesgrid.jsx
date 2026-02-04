import RuleCard from './RuleCard.jsx';

const RulesGrid = ({ rules, onToggle, togglingId }) => {
  return (
    <div className="rules-grid">
      {rules.map((rule) => (
        <RuleCard
          key={rule.Id}
          rule={rule}
          onToggle={onToggle}
          isToggling={togglingId === rule.Id}
        />
      ))}
    </div>
  );
};

export default RulesGrid;