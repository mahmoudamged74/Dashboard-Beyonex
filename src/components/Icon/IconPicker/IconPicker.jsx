import React, { useEffect, useMemo, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { loadIconMap } from '../../../utils/loadIconMap';
import DynamicIcon from '../DynamicIcon';
import styles from './IconPicker.module.css';

const IconPicker = ({
  value,
  onChange,
  search,
  onSearchChange,
  searchPlaceholder,
  selectedLabel,
  className = '',
}) => {
  const [iconNames, setIconNames] = useState([]);

  useEffect(() => {
    loadIconMap().then((mod) => setIconNames(mod.iconNames));
  }, []);

  const filtered = useMemo(
    () =>
      iconNames.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
      ),
    [iconNames, search]
  );

  return (
    <div className={`${styles.picker} ${className}`.trim()}>
      <div className={styles.searchBox}>
        <MdSearch size={18} />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.iconGrid}>
        {filtered.map((iconName) => (
          <button
            key={iconName}
            type="button"
            className={`${styles.iconItem} ${
              value === iconName ? styles.iconItemSelected : ''
            }`}
            onClick={() => onChange(iconName)}
            title={iconName}
          >
            <DynamicIcon name={iconName} size={18} />
          </button>
        ))}
      </div>
      <p className={styles.selectedIconName}>
        {selectedLabel}: <strong>{value}</strong>
      </p>
    </div>
  );
};

export default IconPicker;
