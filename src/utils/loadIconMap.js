let iconMapModule = null;

export function loadIconMap() {
  if (!iconMapModule) {
    iconMapModule = import('./iconMap.js');
  }
  return iconMapModule;
}
