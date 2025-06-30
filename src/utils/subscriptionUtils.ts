
import { v4 as uuidv4 } from 'uuid';

export const getRandomColor = () => {
  const colors = [
    '#E50914', // Netflix red
    '#1DB954', // Spotify green
    '#FF9900', // Amazon orange
    '#00AEEF', // Telegram blue
    '#FF0000', // YouTube red
    '#00B2FF', // PayPal blue
    '#A2AAAD', // Apple gray
    '#F56040', // Instagram gradient
    '#7289DA', // Discord purple
    '#00B2FF', // PayPal blue
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const createDefaultNotifications = () => [
  {
    id: uuidv4(),
    type: 'payment-upcoming' as const,
    enabled: true,
    daysInAdvance: 3,
  }
];
