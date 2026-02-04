import SearchBox from '../common/Searchbox';
import FilterGroup from '../common/Filtergroup';

const RulesHeader = ({
  totalCount,
  searchTerm,
  filterActive,
  onSearchChange,
  onFilterChange,
}) => {
  return (
    <div className="rules-header">
      <div>
        <h2 className="rules-title">
          Validation Rules
          <span className="rules-count">({totalCount})</span>
        </h2>
        <p className="rules-subtitle">
          Manage validation rules across your Salesforce org
        </p>
      </div>

      <div className="rules-controls">
        <SearchBox value={searchTerm} onChange={onSearchChange} />
        <FilterGroup activeFilter={filterActive} onChange={onFilterChange} />
      </div>
    </div>
  );
};

export default RulesHeader;