export function buildFilters(filters: {
  country?: string;
  platform?: string;
  installDateStart?: string;
  installDateEnd?: string;
}) {
  const { country, platform, installDateStart, installDateEnd } = filters;

  let filterExpression = "";
  if (country) {
    filterExpression += `AND WHERE u."country" = '${country}'`;
  }
  if (platform) {
    filterExpression += `AND WHERE u."platform" = '${platform}'`;
  }
  if (installDateStart) {
    filterExpression += `AND WHERE u."install_date" >= '${installDateStart}'`;
  }
  if (installDateEnd) {
    filterExpression += `AND WHERE u."install_date" <= '${installDateEnd}'`;
  }
  if (filterExpression.startsWith("AND ")) {
    filterExpression = filterExpression.slice(4);
  }
  return filterExpression;
}

export function buildRetentionFilters(filters: {
  country?: string;
  platform?: string;
  installDateStart?: string;
  installDateEnd?: string;
}) {
  const { country, platform, installDateStart, installDateEnd } = filters;
  let filterExpression = "";
  if (country) {
    filterExpression += ` AND u."country" = '${country}'`;
  }

  if (platform) {
    filterExpression += ` AND u."platform" = '${platform}'`;
  }
  if (installDateStart) {
    filterExpression += `AND u."install_date" >= '${installDateStart}'`;
  }
  if (installDateEnd) {
    filterExpression += `AND u."install_date" <= '${installDateEnd}'`;
  }

  return filterExpression;
}
