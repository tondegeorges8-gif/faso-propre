import React from 'react';
import { useSignedUrl } from '@/hooks/useSignedUrl';

interface SignedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  bucket: string;
  path: string | null | undefined;
}

/**
 * Image component that resolves storage paths to short-lived signed URLs.
 * Supports both legacy full URLs and plain storage paths.
 */
const SignedImage: React.FC<SignedImageProps> = ({ bucket, path, alt, ...props }) => {
  const url = useSignedUrl(bucket, path);

  if (!url) return null;

  return <img src={url} alt={alt} {...props} />;
};

export default SignedImage;
