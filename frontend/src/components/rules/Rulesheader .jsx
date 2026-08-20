import SearchBox from '../common/Searchbox';
import FilterGroup from '../common/Filtergroup';
import Button from '../common/Button';

const RulesHeader = ({ totalCount, searchTerm, filterActive, onSearchChange, onFilterChange, onRefresh, rulesLoading }) => (
  <div className="rules-header">
    <div>
      <span className="section-kicker">LIVE SALESFORCE DATA</span>
      <h1>Validation Rules <span className="rules-count">{totalCount}</span></h1>
      <p>Search, filter, and update validation rules from your connected Salesforce org.</p>
    </div>
    <div className="rules-controls">
      <SearchBox value={searchTerm} onChange={onSearchChange} />
      <FilterGroup activeFilter={filterActive} onChange={onFilterChange} />
      <Button variant="outline" onClick={onRefresh} disabled={rulesLoading}>{rulesLoading ? 'Refreshing' : 'Refresh'}</Button>
    </div>
  </div>
);

export default RulesHeader;
