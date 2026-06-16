export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    // notation: 'compact',
    maximumFractionDigits: 0
  }).format(value);
}

export function shortDate(dateString?: string | null) {
  if (!dateString) return '-';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function shortDateTime(dateString?: string | null) {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
