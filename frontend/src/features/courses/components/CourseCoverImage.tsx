import { Badge } from '@mantine/core';
import classes from './CourseCoverImage.module.css';

interface CourseCoverImageProps {
  imageUrl: string;
  eyebrow: string;
  title: string;
}

export function CourseCoverImage({ imageUrl, eyebrow, title }: CourseCoverImageProps) {
  return (
    <div className={classes.wrapper}>
      <img src={imageUrl} alt={title} className={classes.image} />
      <div className={classes.overlay} />
      <div className={classes.content}>
        <Badge className={classes.eyebrow} variant="light" size="sm" radius="sm">
          {eyebrow}
        </Badge>
        <h3 className={classes.title}>{title}</h3>
      </div>
    </div>
  );
}
