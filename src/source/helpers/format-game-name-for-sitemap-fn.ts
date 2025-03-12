export const formatGameNameForSitemapFn = (value: string): string => {
  let newValue = value.toLowerCase().trim();
  newValue = newValue.replace(/ /gi, '-');
  newValue = newValue.replace(/([-_][a-z])/g, (group) => group.toUpperCase());

  return newValue[0].toUpperCase() + newValue.slice(1);
};
