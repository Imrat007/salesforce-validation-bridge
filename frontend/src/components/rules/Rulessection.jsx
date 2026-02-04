import RulesHeader from './Rulesheader .jsx';
import RulesGrid from './Rulesgrid.jsx';
import EmptyState from './Emptystate .jsx';

const RulesSection = ({
  rules,
  searchTerm,
  filterActive,
  onSearchChange,
  onFilterChange,
  onToggle,
  togglingId,
}) => {
  return (
    <div className="rules-section">
      <RulesHeader
        totalCount={rules.length}
        searchTerm={searchTerm}
        filterActive={filterActive}
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
      />

      {rules.length === 0 ? (
        <EmptyState
          title="No Rules Found"
          message="No validation rules match your search criteria"
          showAction={false}
        />
      ) : (
        <RulesGrid rules={rules} onToggle={onToggle} togglingId={togglingId} />
      )}
    </div>
  );
};

export default RulesSection;