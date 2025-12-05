export function formatMealStatusText(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'Scheduled';
    case 'preparing':
      return 'Preparing';
    case 'ready':
      return 'Ready for Pickup';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export function getMealStatusColor(status: string): string {
  switch (status) {
    case 'scheduled':
      return '#FF9B42';
    case 'preparing':
      return '#1E88E5';
    case 'ready':
      return '#8E24AA';
    case 'delivered':
      return '#4CB944';
    case 'cancelled':
      return '#E53935';
    default:
      return '#FF9B42';
  }
}

export function getMealTypeIcon(type: string): string {
  switch (type) {
    case 'breakfast':
      return 'coffee';
    case 'lunch':
      return 'utensils';
    case 'dinner':
      return 'utensils';
    case 'snack':
      return 'cookie';
    default:
      return 'utensils';
  }
}