import logoFooterUrl from '@/assets/brainmemo-logo-orange.png';
import classes from './Footer.module.css';

export function Footer() {
  return (
    <footer className={classes.footer}>
      <div className={classes.footerInner}>
        <div className={classes.footerLeft}>
          <img src={logoFooterUrl} alt="BrainMemo" className={classes.footerLogo} />
          <span>•</span>
          <span>Khám phá tri thức, mở mang tầm mắt</span>
          <span>•</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        <div className={classes.footerRight}>
          <span className={classes.liveDot} />
          {/* Chưa có API đếm số người đang đọc trong api_contract.md -> tạm để tĩnh */}
          Đang có 0 người đọc
        </div>
      </div>
    </footer>
  );
}