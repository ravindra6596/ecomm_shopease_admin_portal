import api from './api';

interface NotificationResponse {
  status: boolean;
  statusCode: number;
  error: string | null;
  message: string;
  data: {};
}

export async function sendNotification(
  title: string,
  body: string,
  notification_type: string,
  user_ids?: number[]
): Promise<NotificationResponse> {
  const payload: {
    title: string;
    body: string;
    notification_type: string;
    user_ids?: number[];
  } = {
    title,
    body,
    notification_type
  };

  if (user_ids && user_ids.length > 0) {
    payload.user_ids = user_ids;
    const response = await api.post<NotificationResponse>('/notifications/selected-users', payload);
    return response.data;
  }

  const response = await api.post<NotificationResponse>('/notifications', payload);
  return response.data;
}