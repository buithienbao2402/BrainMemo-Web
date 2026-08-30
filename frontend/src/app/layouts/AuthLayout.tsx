import type { ReactNode } from 'react';
import classes from './AuthLayout.module.css';
// Import file ảnh logo từ thư mục assets
import logoImg from '../../assets/brainmemo-logo-black.png';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Layout 2 cột dùng chung cho Login/Register, tách ra khỏi login gốc để
 * dùng lại panel bên trái (logo + tagline) mà không lặp code.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={classes.wrapper}>
      <div className={classes.card}>
        <div className={classes.leftPanel}>
          <div className={classes.logo}>
            
            {/* Đã thay placeholder bằng thẻ img */}
            <img src={logoImg} alt="BrainMemo Logo" className={classes.logoImage} />
            
          </div>

          <div className={classes.leftContent}>
            <h2 className={classes.leftTitle}>Bắt đầu hành trình học tập của bạn</h2>
            <p className={classes.leftSubtitle}>
              Tham gia nền tảng học tập tôn vinh nghệ thuật truyền đạt và sức mạnh của ngôn từ.
            </p>
          </div>
        </div>

        <div className={classes.rightPanel}>{children}</div>
      </div>
    </div>
  );
}