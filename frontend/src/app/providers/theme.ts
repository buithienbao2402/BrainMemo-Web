import { createTheme } from '@mantine/core';

/**
 * Theme dùng chung toàn app. Primary color đặt theo mã FF7A18 (index 5 trong
 * dải màu bên dưới) -> mọi Button/Anchor variant="filled" mặc định sẽ theo
 * đúng màu này, không cần override --button-bg thủ công ở từng CSS module
 * như 2 form Register/OTP đang làm tạm.
 */
export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: 5,
  colors: {
    brand: [
      '#fff4e8',
      '#ffe3c7',
      '#ffc78d',
      '#ffa94f',
      '#ff9a44',
      '#ff7a18', // 5 - shade chính, khớp mã FF7A18 trong brief
      '#e86a0c',
      '#c25708',
      '#9c4606',
      '#7a3705',
    ],
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: {
    fontFamily: 'Georgia, "Times New Roman", serif',
  },
  defaultRadius: 'md',
});