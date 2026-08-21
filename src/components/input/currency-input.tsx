import React from 'react';
import { Input, InputProps } from './input';

export interface CurrencyInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  value?: string | number;
  onChange?: (value: number) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, error, fullWidth = false, value, onChange, placeholder, ...props }, ref) => {
    // Định dạng số hiển thị ban đầu thành phân tách phần nghìn bằng dấu chấm (ví dụ: 1.150.000)
    const formatValue = (val: string | number | undefined): string => {
      if (val === undefined || val === '') return '';
      const clean = String(val).replace(/\D/g, '');
      if (clean === '') return '';
      return new Intl.NumberFormat('vi-VN').format(Number(clean));
    };

    const [displayVal, setDisplayVal] = React.useState<string>(formatValue(value));

    React.useEffect(() => {
      setDisplayVal(formatValue(value));
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanValue = e.target.value.replace(/\D/g, '');
      
      if (cleanValue === '') {
        setDisplayVal('');
        if (onChange) onChange(0);
        return;
      }
      
      const numValue = Number(cleanValue);
      setDisplayVal(new Intl.NumberFormat('vi-VN').format(numValue));
      if (onChange) {
        onChange(numValue);
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        label={label}
        error={error}
        fullWidth={fullWidth}
        value={displayVal}
        onChange={handleInputChange}
        placeholder={placeholder}
        {...props}
      />
    );
  },
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
