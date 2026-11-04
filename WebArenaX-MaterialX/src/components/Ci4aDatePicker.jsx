import { useState, useRef, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';

export default function Ci4aDatePicker({
  label = 'Date',
  value: externalValue,
  onChange,
  size = 'small',
  sx = {},
}) {
  const [value, setValue] = useState(externalValue || null);
  const boxRef = useRef(null);
  const [apiAttrs, setApiAttrs] = useState({});
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  valueRef.current = value;
  onChangeRef.current = onChange;

  useEffect(() => {
    setValue(externalValue || null);
  }, [externalValue]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__ci4a__) {
      const attrs = window.__ci4a__.register('datepicker', {
        getDateStatus: {
          handler: () => {
            const v = valueRef.current;
            return {
              data: {
                value: v ? v.format('YYYY-MM-DD') : null,
                hasValue: v !== null,
                format: 'YYYY-MM-DD',
              },
            };
          },
          description: 'Get current date value.',
          params: [],
        },
        setDateValue: {
          handler: (dateStr) => {
            if (!dateStr) {
              return { error: { code: 'INVALID_INPUT', message: 'Date string required' } };
            }
            const parsed = dayjs(dateStr, 'YYYY-MM-DD');
            if (!parsed.isValid()) {
              return { error: { code: 'INVALID_INPUT', message: `Invalid date: ${dateStr}` } };
            }
            setValue(parsed);
            onChangeRef.current?.(parsed);
            return { data: { value: parsed.format('YYYY-MM-DD') } };
          },
          description: 'Set date. Use YYYY-MM-DD format.',
          params: [{ name: 'date', type: 'string', required: true }],
        },
      });
      setApiAttrs(attrs);
      return () => { if (window.__ci4a__) window.__ci4a__.unregister(attrs['data-cid']); };
    }
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box ref={boxRef} {...apiAttrs} sx={{ display: 'inline-block', ...sx }}>
        <DatePicker
          label={label}
          value={value}
          onChange={(v) => { setValue(v); onChange?.(v); }}
          format="MM/DD/YYYY"
          slotProps={{ textField: { size, sx: { minWidth: 140 } } }}
        />
      </Box>
    </LocalizationProvider>
  );
}
