import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

// 상대 시간 (예: "3시간 전")
export const formatRelativeTime = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: ko,
  });
};

// 절대 시간 (예: "2025-10-22 14:30")
export const formatAbsoluteTime = (
  dateString: string,
  formatStr = 'yyyy-MM-dd HH:mm',
): string => {
  return format(new Date(dateString), formatStr, { locale: ko });
};
