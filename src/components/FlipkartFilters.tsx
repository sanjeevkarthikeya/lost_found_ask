import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ItemCategory, CampusLocation, ItemStatus } from '../types';
import {
  Search,
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Tag,
  MapPin,
  Clock,
  CheckSquare,
  Square,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

export interface FilterState {
  searchQuery: string;
  selectedCategories: ItemCategory[];
  selectedLocations: CampusLocation[];
  selectedStatus: ItemStatus[];
  hasImageOnly: boolean;
  sortBy: 'newest' | 'oldest' | 'views';
}

interface FlipkartFiltersProps {
  filters?: FilterState;
  setFilters?: React.Dispatch<React.SetStateAction<FilterState>>;
  itemCounts?: {
    byCategory: Record<string, number>;
    byLocation: Record<string, number>;
    byStatus: Record<string, number>;
    total: number;
  };
  isMobileDrawerOpen?: boolean;
  setIsMobileDrawerOpen?: (open: boolean) => void;
  onResetAll?: () => void;
}

const ALL_CATEGORIES: ItemCategory[] = [
  'Electronics & Gadgets',
  'ID Cards & Documents',
  'Keys & Access Cards',
  'Bags & Luggage',
  'Books & Stationery',
  'Clothing & Accessories',
  'Wallets & Money',
  'Bottles & Containers',
  'Medical & Lab Equipment',
  'Sports Equipment',
  'Other Items',
];

const ALL_LOCATIONS: CampusLocation[] = [
  'YU Central Library',
  'Yenepoya Medical College & Hospital',
  'Yenepoya Dental College',
  'YIT Campus (Engineering)',
  'Indoor Sports Complex & Gym',
  'Food Court & Cafeteria',
  'Pharmacy & Allied Sciences Lab',
  'Central Bus Bay & Transport',
  'Girls Hostel Complex',
  'Boys Hostel Complex',
  'Administrative Block',
  'YU Auditorium & Greens',
];

export const FlipkartFilters: React.FC<FlipkartFiltersProps> = ({
  filters: propFilters,
  setFilters: propSetFilters,
  itemCounts: propItemCounts,
  isMobileDrawerOpen,
  setIsMobileDrawerOpen,
  onResetAll,
}) => {
  const {
    items,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedLocation,
    setSelectedLocation,
    selectedItemType,
    setSelectedItemType,
  } = useApp();

  const [localFilters, setLocalFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategories: [],
    selectedLocations: [],
    selectedStatus: [],
    hasImageOnly: false,
    sortBy: 'newest',
  });

  const isControlled = !!propFilters && !!propSetFilters;

  // Active filters object
  const filters: FilterState = useMemo(() => {
    if (isControlled && propFilters) return propFilters;
    return {
      searchQuery: searchQuery || localFilters.searchQuery,
      selectedCategories: selectedCategory ? [selectedCategory] : localFilters.selectedCategories,
      selectedLocations: selectedLocation ? [selectedLocation] : localFilters.selectedLocations,
      selectedStatus: localFilters.selectedStatus,
      hasImageOnly: localFilters.hasImageOnly,
      sortBy: localFilters.sortBy,
    };
  }, [isControlled, propFilters, searchQuery, localFilters, selectedCategory, selectedLocation]);

  const setFilters: React.Dispatch<React.SetStateAction<FilterState>> = (action) => {
    if (isControlled && propSetFilters) {
      propSetFilters(action);
      return;
    }

    setLocalFilters((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      if (next.searchQuery !== searchQuery) setSearchQuery(next.searchQuery);
      if (next.selectedCategories.length === 1 && next.selectedCategories[0] !== selectedCategory) {
        setSelectedCategory(next.selectedCategories[0]);
      } else if (next.selectedCategories.length === 0 && selectedCategory !== null) {
        setSelectedCategory(null);
      }
      if (next.selectedLocations.length === 1 && next.selectedLocations[0] !== selectedLocation) {
        setSelectedLocation(next.selectedLocations[0]);
      } else if (next.selectedLocations.length === 0 && selectedLocation !== null) {
        setSelectedLocation(null);
      }
      return next;
    });
  };

  // Compute item counts if not passed
  const itemCounts = useMemo(() => {
    if (propItemCounts) return propItemCounts;
    const byCat: Record<string, number> = {};
    const byLoc: Record<string, number> = {};
    const byStat: Record<string, number> = { open: 0, matched: 0, resolved: 0 };

    items.forEach((item) => {
      byCat[item.category] = (byCat[item.category] || 0) + 1;
      byLoc[item.location] = (byLoc[item.location] || 0) + 1;
      if (byStat[item.status] !== undefined) {
        byStat[item.status] = byStat[item.status] + 1;
      }
    });

    return {
      byCategory: byCat,
      byLocation: byLoc,
      byStatus: byStat,
      total: items.length,
    };
  }, [propItemCounts, items]);

  const [openSections, setOpenSections] = useState({
    categories: true,
    locations: true,
    status: true,
    sort: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryToggle = (cat: ItemCategory) => {
    setFilters((prev) => {
      const exists = prev.selectedCategories.includes(cat);
      const updated = exists
        ? prev.selectedCategories.filter((c) => c !== cat)
        : [...prev.selectedCategories, cat];
      if (!isControlled) {
        setSelectedCategory(updated.length === 1 ? updated[0] : null);
      }
      return {
        ...prev,
        selectedCategories: updated,
      };
    });
  };

  const handleLocationToggle = (loc: CampusLocation) => {
    setFilters((prev) => {
      const exists = prev.selectedLocations.includes(loc);
      const updated = exists
        ? prev.selectedLocations.filter((l) => l !== loc)
        : [...prev.selectedLocations, loc];
      if (!isControlled) {
        setSelectedLocation(updated.length === 1 ? updated[0] : null);
      }
      return {
        ...prev,
        selectedLocations: updated,
      };
    });
  };

  const handleStatusToggle = (status: ItemStatus) => {
    setFilters((prev) => {
      const exists = prev.selectedStatus.includes(status);
      return {
        ...prev,
        selectedStatus: exists
          ? prev.selectedStatus.filter((s) => s !== status)
          : [...prev.selectedStatus, status],
      };
    });
  };

  const handleClearAll = () => {
    if (!isControlled) {
      setSelectedCategory(null);
      setSelectedLocation(null);
      setSearchQuery('');
    }
    if (onResetAll) onResetAll();
    setFilters({
      searchQuery: '',
      selectedCategories: [],
      selectedLocations: [],
      selectedStatus: [],
      hasImageOnly: false,
      sortBy: 'newest',
    });
  };

  const activeFilterCount =
    (filters.searchQuery ? 1 : 0) +
    filters.selectedCategories.length +
    filters.selectedLocations.length +
    filters.selectedStatus.length +
    (filters.hasImageOnly ? 1 : 0);

  const filterContent = (
    <div className="space-y-4 text-slate-800">
      {/* Header with Title and Clear All */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-red-900" />
          <span className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </span>
        </div>
        {activeFilterCount > 0 && (
          <button
            id="btn-clear-all-filters"
            onClick={handleClearAll}
            className="flex items-center gap-1 text-xs font-bold text-red-800 hover:text-red-950 uppercase tracking-wider transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Instant Search Bar */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
          Keyword Search
        </label>
        <div className="relative">
          <input
            id="filter-search-input"
            type="text"
            placeholder="Search items, brands, serials..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 bg-white"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Has Photo Quick Toggle */}
      <div className="pt-2 border-t border-slate-100">
        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors border border-slate-200">
          <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Show Items with Photo</span>
          </span>
          <input
            id="filter-has-photo"
            type="checkbox"
            checked={filters.hasImageOnly}
            onChange={(e) => setFilters((prev) => ({ ...prev, hasImageOnly: e.target.checked }))}
            className="rounded border-slate-300 text-red-800 focus:ring-red-800 w-4 h-4 cursor-pointer"
          />
        </label>
      </div>

      {/* Sort Option */}
      <div className="border-t border-slate-200 pt-3">
        <button
          onClick={() => toggleSection('sort')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-2"
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Sort Order</span>
          </span>
          {openSections.sort ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSections.sort && (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              id="sort-newest"
              onClick={() => setFilters((prev) => ({ ...prev, sortBy: 'newest' }))}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold text-left transition-all ${
                filters.sortBy === 'newest'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Newest First
            </button>
            <button
              id="sort-oldest"
              onClick={() => setFilters((prev) => ({ ...prev, sortBy: 'oldest' }))}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold text-left transition-all ${
                filters.sortBy === 'oldest'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Oldest First
            </button>
          </div>
        )}
      </div>

      {/* Category Facet */}
      <div className="border-t border-slate-200 pt-3">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-2"
        >
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span>Categories</span>
          </span>
          {openSections.categories ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {openSections.categories && (
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1 text-xs">
            {ALL_CATEGORIES.map((cat) => {
              const count = itemCounts.byCategory[cat] || 0;
              const isChecked = filters.selectedCategories.includes(cat);
              return (
                <label
                  key={cat}
                  className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-red-800 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={`truncate ${isChecked ? 'font-bold text-red-900' : 'font-normal'}`}>
                      {cat}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium ml-1 shrink-0">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Campus Location Facet */}
      <div className="border-t border-slate-200 pt-3">
        <button
          onClick={() => toggleSection('locations')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-2"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Campus Location</span>
          </span>
          {openSections.locations ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {openSections.locations && (
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1 text-xs">
            {ALL_LOCATIONS.map((loc) => {
              const count = itemCounts.byLocation[loc] || 0;
              const isChecked = filters.selectedLocations.includes(loc);
              return (
                <label
                  key={loc}
                  className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-red-800 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={`truncate ${isChecked ? 'font-bold text-red-900' : 'font-normal'}`}>
                      {loc}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium ml-1 shrink-0">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Facet */}
      <div className="border-t border-slate-200 pt-3">
        <button
          onClick={() => toggleSection('status')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-2"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Listing Status</span>
          </span>
          {openSections.status ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSections.status && (
          <div className="space-y-1 text-xs">
            {[
              { id: 'open' as ItemStatus, label: 'Open (Active Listings)' },
              { id: 'matched' as ItemStatus, label: 'Matched (In Verification)' },
              { id: 'resolved' as ItemStatus, label: 'Resolved (Reunited)' },
            ].map((st) => {
              const count = itemCounts.byStatus[st.id] || 0;
              const isChecked = filters.selectedStatus.includes(st.id);
              return (
                <label
                  key={st.id}
                  className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-red-800 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={isChecked ? 'font-bold text-red-900' : 'font-normal'}>
                      {st.label}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium ml-1">{count}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        id="desktop-filters-sidebar"
        className="hidden md:block w-72 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs self-start sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto"
      >
        {filterContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen && setIsMobileDrawerOpen(false)}
          />
          <div className="relative ml-auto w-4/5 max-w-sm h-full bg-white shadow-2xl p-5 overflow-y-auto z-10 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-4">
              <span className="font-extrabold text-base text-slate-900">Filters</span>
              <button
                onClick={() => setIsMobileDrawerOpen && setIsMobileDrawerOpen(false)}
                className="text-slate-500 font-bold px-2 py-1 bg-slate-100 rounded-lg text-sm"
              >
                Done
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
};
