import { FILTER_OPTIONS } from '../../utils/constants';

const Filtergroup = ({ activeFilter, onChange }) => {
  const filters = [
    { value: FILTER_OPTIONS.ALL, label: 'All' },
    { value: FILTER_OPTIONS.ACTIVE, label: 'Enabled' },
    { value: FILTER_OPTIONS.INACTIVE, label: 'Disabled' },
  ];

  return (
    <div className="filter-group">
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={`filter-btn ${activeFilter === filter.value ? 'filter-active' : ''}`}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default Filtergroup;