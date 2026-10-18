import type { TemplateRef } from '@angular/core';
import type { TpToastNotificationType } from './toast-notification';

export interface TpToastNotificationItem {
  id: number | string;
  type: TpToastNotificationType;
  content: string | TemplateRef<unknown>;
  context?: Record<string, unknown>;
  duration?: number;
}
