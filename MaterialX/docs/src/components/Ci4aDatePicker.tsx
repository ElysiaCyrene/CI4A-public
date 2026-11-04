'use client'
import * as React from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { type Dayjs } from 'dayjs'
import Box from '@mui/material/Box'

export interface Ci4aDatePickerProps {
  label?: string
  initialValue?: Dayjs | null
  onChange?: (value: Dayjs | null) => void
}

export default function Ci4aDatePicker({
  label = 'CI4A DatePicker',
  initialValue = null,
  onChange,
}: Ci4aDatePickerProps) {
  const [value, setValue] = React.useState<Dayjs | null>(initialValue)
  const boxRef = React.useRef<HTMLDivElement>(null)
  const [apiAttrs, setApiAttrs] = React.useState<Record<string, any>>({})
  const valueRef = React.useRef(value)
  valueRef.current = value

  // CI4A registration
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__ci4a__) {
      const registry = (window as any).__ci4a__

      const attrs = registry.register('datepicker', {
        getDateStatus: {
          handler: () => {
            const v = valueRef.current
            return {
              data: {
                value: v ? v.format('YYYY-MM-DD') : null,
                hasValue: v !== null,
                label,
                format: 'YYYY-MM-DD',
              },
            }
          },
          description: 'Get the current date value, format, and status.',
          params: [],
        },
        setDateValue: {
          handler: (dateStr: string) => {
            if (!dateStr) {
              return { error: { code: 'INVALID_INPUT', message: 'Date string is required' } }
            }
            const parsed = dayjs(dateStr, 'YYYY-MM-DD')
            if (!parsed.isValid()) {
              return { error: { code: 'INVALID_INPUT', message: `Invalid date: ${dateStr}. Use YYYY-MM-DD format.` } }
            }
            setValue(parsed)
            onChange?.(parsed)
            return { data: { value: parsed.format('YYYY-MM-DD') } }
          },
          description: 'Set the date value. Use YYYY-MM-DD format.',
          params: [
            { name: 'date', type: 'string', required: true, description: 'Date in YYYY-MM-DD format' },
          ],
        },
      })

      setApiAttrs(attrs)
      return () => {
        registry.unregister(attrs['data-cid'])
      }
    }
  }, []) // intentionally empty — register once

  const handleChange = (newValue: Dayjs | null) => {
    setValue(newValue)
    onChange?.(newValue)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box ref={boxRef} {...apiAttrs} sx={{ display: 'inline-block' }}>
        <DatePicker
          label={label}
          value={value}
          onChange={handleChange}
          slotProps={{
            textField: {
              size: 'small',
              sx: { minWidth: 220 },
            } as any,
          }}
        />
      </Box>
    </LocalizationProvider>
  )
}
