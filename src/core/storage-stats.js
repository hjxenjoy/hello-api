// navigator.storage.estimate() wrapper

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value % 1 === 0 ? value : value.toFixed(1)} ${units[i]}`;
}

export async function getStorageStats() {
  if (!navigator.storage?.estimate) {
    return {
      usage: 0,
      quota: 0,
      percent: 0,
      usageFormatted: 'N/A',
      quotaFormatted: 'N/A',
    };
  }

  const { usage = 0, quota = 0 } = await navigator.storage.estimate();
  const percent = quota > 0 ? Math.round((usage / quota) * 100) : 0;

  return {
    usage,
    quota,
    percent,
    usageFormatted: formatBytes(usage),
    quotaFormatted: formatBytes(quota),
  };
}
