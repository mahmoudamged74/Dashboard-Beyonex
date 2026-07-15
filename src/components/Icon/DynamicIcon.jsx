import React, { useEffect, useState } from 'react';
import { loadIconMap } from '../../utils/loadIconMap';

const DynamicIcon = ({
  name,
  size = 20,
  fallback: Fallback = null,
  className,
  ...rest
}) => {
  const [Icon, setIcon] = useState(null);

  useEffect(() => {
    let active = true;

    if (!name) {
      setIcon(null);
      return undefined;
    }

    loadIconMap().then((mod) => {
      if (!active) return;
      const resolved = mod.resolveIconName(name);
      const Loaded = resolved ? mod.iconMap[resolved] : null;
      setIcon(() => Loaded);
    });

    return () => {
      active = false;
    };
  }, [name]);

  if (Icon) {
    return <Icon size={size} className={className} {...rest} />;
  }

  if (Fallback) {
    return <Fallback size={size} className={className} {...rest} />;
  }

  return (
    <span
      className={className}
      style={{ display: 'inline-block', width: size, height: size }}
      aria-hidden="true"
    />
  );
};

export default DynamicIcon;
