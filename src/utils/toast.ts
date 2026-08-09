import toast from 'react-hot-toast';

export const featureNotImplemented = () => {
  toast.loading('Tính năng này đang được phát triển');
  setTimeout(() => {
    toast.dismiss();
  }, 3000);
};
