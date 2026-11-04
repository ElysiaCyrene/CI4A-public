import * as React from 'react'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Checkbox from '@mui/material/Checkbox'
import Switch from '@mui/material/Switch'
import Rating from '@mui/material/Rating'
import Slider from '@mui/material/Slider'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Autocomplete from '@mui/material/Autocomplete'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Pagination from '@mui/material/Pagination'
import Menu from '@mui/material/Menu'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Chip from '@mui/material/Chip'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Ci4aDatePicker from '../src/components/Ci4aDatePicker'

// Helper to find component ID by type and index (client only)
function useCid(type: string, idx: number): string | null {
  const [cid, setCid] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__ci4a__) {
      const all = (window as any).__ci4a__.exportSchema()
      const matches = all.filter((x: any) => x.componentType === type)
      setCid(matches[idx]?.componentId || null)
    }
  }, [type, idx])
  return cid
}

// Copy text to clipboard (client only)
function copyText(text: string) {
  if (typeof navigator !== 'undefined') {
    navigator.clipboard.writeText(text)
  }
}

type CmdProps = { type: string; idx: number; action: string; params?: string; desc: string }
function CmdBlock({ type, idx, action, params, desc }: CmdProps) {
  const cid = useCid(type, idx)
  const [copied, setCopied] = React.useState(false)
  const cmd = cid ? `window.__ci4a__.call("${cid}","${action}"${params ? ',' + params : ''})` : '(loading...)'

  return (
    <Box sx={{ mb: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#555', minWidth: 60, fontSize: 10 }}>
          {desc}:
        </Typography>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, color: '#1565c0', bgcolor: '#e3f2fd', px: 1, py: 0.3, borderRadius: 0.5, flex: 1 }}>
          {cmd}
        </Typography>
        <Chip
          label={copied ? '✓' : 'Copy'}
          size="small"
          variant="outlined"
          onClick={() => { copyText(cmd); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
          sx={{ height: 20, fontSize: 10, cursor: 'pointer', minWidth: 44 }}
        />
      </Box>
    </Box>
  )
}

type SectionProps = { title: string; color: string; children: React.ReactNode }
function Section({ title, color, children }: SectionProps) {
  return (
    <Paper sx={{ mb: 3, overflow: 'hidden', border: `2px solid ${color}`, borderRadius: 2 }}>
      <Box sx={{ bgcolor: color, color: 'white', px: 2, py: 1 }}>
        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 700 }}>{title}</Typography>
      </Box>
      <Box sx={{ p: 2.5, bgcolor: '#fafafa' }}>{children}</Box>
    </Paper>
  )
}

export default function Ci4aDemo() {
  const [counts, setCounts] = React.useState({ btn1: 0, btn2: 0 })
  const [checked, setChecked] = React.useState({ a: true, b: false })
  const [switched, setSwitched] = React.useState(true)
  const [ratingVal, setRatingVal] = React.useState(3)
  const [sliderVal, setSliderVal] = React.useState(33)
  const [textVal, setTextVal] = React.useState('Hello CI4A')
  const [selectVal, setSelectVal] = React.useState('option1')
  const [autoVal, setAutoVal] = React.useState<any>({ label: 'Option A', value: 'a' })
  const [pageVal, setPageVal] = React.useState(1)
  const [radioVal, setRadioVal] = React.useState('female')
  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [schema, setSchema] = React.useState<any[]>([])
  const [result, setResult] = React.useState('')

  React.useEffect(() => {
    const t = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).__ci4a__) {
        setSchema((window as any).__ci4a__.exportSchema())
      }
    }, 1000)
    return () => clearInterval(t)
  }, [])

  async function callAction(type: string, action: string, params?: any) {
    if (!(window as any).__ci4a__) { setResult('__ci4a__ not found'); return }
    const s = (window as any).__ci4a__.exportSchema()
    const c = s.find((x: any) => x.componentType === type)
    if (!c) { setResult(`No ${type} registered`); return }
    try {
      const r = await (window as any).__ci4a__.call(c.componentId, action, params)
      setResult(JSON.stringify(r, null, 2))
    } catch (e: any) {
      setResult('Error: ' + e.message)
    }
  }

  const autocompleteOptions = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' },
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 3, fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e' }}>🧪 CI4A Debug Panel</Typography>
          <Chip label={`${schema.length} components registered`} color="primary" size="small" />
        </Box>

        {/* ====== BUTTON ====== */}
        <Section title="1. Button" color="#1565c0">
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}>
            <Button variant="contained" color="primary" onClick={() => setCounts(c => ({ ...c, btn1: c.btn1 + 1 }))}>
              Counter: {counts.btn1} clicks
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setCounts(c => ({ ...c, btn2: c.btn2 + 1 }))}>
              Counter: {counts.btn2} clicks
            </Button>
          </Box>
          <Typography variant="body2" sx={{ color: '#555', mb: 0.5, fontStyle: 'italic', fontSize: 13 }}>
            ↑ Click counter should increment when CI4A clickButton is called
          </Typography>
          <CmdBlock type="button" idx={0} action="clickButton" desc="Click #1" />
          <CmdBlock type="button" idx={0} action="getButtonStatus" desc="Status #1" />
        </Section>

        {/* ====== INPUT ====== */}
        <Section title="2. Input (TextField)" color="#00838f">
          <TextField label="Text Input" value={textVal} onChange={e => setTextVal(e.target.value)} size="small" sx={{ mb: 1.5, minWidth: 260 }} />
          <CmdBlock type="input" idx={0} action="getInputStatus" desc="Status" />
          <CmdBlock type="input" idx={0} action="setValue" params='{"value":"Agent was here!"}' desc="Set value" />
        </Section>

        {/* ====== SELECT ====== */}
        <Section title="3. Select" color="#2e7d32">
          <Select value={selectVal} onChange={e => setSelectVal(e.target.value as string)} size="small" sx={{ mb: 1.5, minWidth: 180 }}>
            <MenuItem value="option1">Option 1</MenuItem>
            <MenuItem value="option2">Option 2</MenuItem>
            <MenuItem value="option3">Option 3</MenuItem>
          </Select>
          <CmdBlock type="select" idx={0} action="getSelectStatus" desc="Status" />
          <CmdBlock type="select" idx={0} action="setValue" params='{"value":"option3"}' desc="Set option3" />
        </Section>

        {/* ====== AUTOCOMPLETE ====== */}
        <Section title="4. Autocomplete" color="#6a1b9a">
          <Autocomplete value={autoVal} onChange={(e, v) => setAutoVal(v)} options={autocompleteOptions}
            renderInput={(p: any) => <TextField {...p} label="Autocomplete" size="small" />} sx={{ mb: 1.5, minWidth: 260 }} />
          <CmdBlock type="autocomplete" idx={0} action="getAutocompleteStatus" desc="Status" />
          <CmdBlock type="autocomplete" idx={0} action="setValue" params='{"value":{"label":"Option B","value":"b"}}' desc="Set Option B" />
        </Section>

        {/* ====== CHECKBOX ====== */}
        <Section title="5. Checkbox" color="#e65100">
          <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
            <FormControlLabel control={<Checkbox checked={checked.a} onChange={e => setChecked(c => ({ ...c, a: e.target.checked }))} />} label={`Check A: ${checked.a ? '✓' : '✗'}`} />
            <FormControlLabel control={<Checkbox checked={checked.b} onChange={e => setChecked(c => ({ ...c, b: e.target.checked }))} />} label={`Check B: ${checked.b ? '✓' : '✗'}`} />
          </Box>
          <CmdBlock type="checkbox" idx={0} action="getCheckboxStatus" desc="Status #1" />
          <CmdBlock type="checkbox" idx={0} action="setValue" params='{"checked":false}' desc="Uncheck #1" />
        </Section>

        {/* ====== SWITCH ====== */}
        <Section title="6. Switch" color="#d84315">
          <FormControlLabel control={<Switch checked={switched} onChange={e => setSwitched(e.target.checked)} />}
            label={`Switch: ${switched ? 'ON' : 'OFF'}`} sx={{ mb: 0.5 }} />
          <CmdBlock type="switch" idx={0} action="getSwitchStatus" desc="Status" />
          <CmdBlock type="switch" idx={0} action="setValue" params='{"checked":false}' desc="Turn off" />
        </Section>

        {/* ====== RADIO GROUP + RADIO ====== */}
        <Section title="7. RadioGroup + Radio" color="#ad1457">
          <FormControl sx={{ mb: 0.5 }}>
            <FormLabel>Gender</FormLabel>
            <RadioGroup row value={radioVal} onChange={(e, v) => setRadioVal(v)}>
              <FormControlLabel value="female" control={<Radio />} label="Female" />
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>
          </FormControl>
          <Typography variant="body2" sx={{ color: '#555', mb: 0.5, fontStyle: 'italic', fontSize: 13 }}>
            Current: {radioVal}
          </Typography>
          <CmdBlock type="radiogroup" idx={0} action="getRadioGroupStatus" desc="Group status" />
          <CmdBlock type="radiogroup" idx={0} action="setValue" params='{"value":"male"}' desc="Set male" />
          <CmdBlock type="radio" idx={0} action="getRadioStatus" desc="Radio#1 status" />
          <CmdBlock type="radio" idx={0} action="setValue" desc="Select Radio#1" />
        </Section>

        {/* ====== RATING ====== */}
        <Section title="8. Rating" color="#f9a825">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Rating value={ratingVal} onChange={(e, v) => setRatingVal(v || 0)} />
            <Typography variant="body2">{ratingVal} / 5</Typography>
          </Box>
          <CmdBlock type="rating" idx={0} action="getRatingStatus" desc="Status" />
          {/* Note: Rating setValue may need onChange callback — adjust based on actual handler */}
        </Section>

        {/* ====== SLIDER ====== */}
        <Section title="9. Slider" color="#c62828">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Slider value={sliderVal} onChange={(e, v) => setSliderVal(v as number)} size="small" sx={{ width: 200 }} />
            <Chip label={String(sliderVal)} color="error" size="small" />
          </Box>
          <CmdBlock type="slider" idx={0} action="getSliderStatus" desc="Status" />
        </Section>

        {/* ====== BREADCRUMBS ====== */}
        <Section title="10. Breadcrumbs" color="#37474f">
          <Breadcrumbs sx={{ mb: 0.5 }}>
            <Link underline="hover" color="inherit" href="#">Home</Link>
            <Link underline="hover" color="inherit" href="#">Products</Link>
            <Typography>Item 42</Typography>
          </Breadcrumbs>
          <CmdBlock type="breadcrumb" idx={0} action="getBreadcrumbStatus" desc="Get items+keys" />
          <CmdBlock type="breadcrumb" idx={0} action="navigateTo" params='{"key":"0"}' desc="Go to key=0" />
        </Section>

        {/* ====== PAGINATION ====== */}
        <Section title="11. Pagination" color="#4527a0">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Pagination count={10} page={pageVal} onChange={(e, p) => setPageVal(p)} size="small" />
            <Chip label={`Page ${pageVal}`} color="secondary" size="small" />
          </Box>
          <CmdBlock type="pagination" idx={0} action="getPaginationStatus" desc="Get page" />
          <CmdBlock type="pagination" idx={0} action="goToPage" params='{"page":7}' desc="Go to 7" />
        </Section>

        {/* ====== MENU ====== */}
        <Section title="12. Menu" color="#0d47a1">
          <Box sx={{ mb: 0.5 }}>
            <Button data-ci4a-trigger variant="outlined" size="small" onClick={e => { setMenuAnchor(e.currentTarget); setMenuOpen(true); }}>Open Menu ▼</Button>
            <Menu anchorEl={menuAnchor} open={menuOpen} onClose={() => setMenuOpen(false)}>
              <MenuItem onClick={() => { setMenuOpen(false); setResult('Clicked: Profile') }}>👤 Profile</MenuItem>
              <MenuItem onClick={() => { setMenuOpen(false); setResult('Clicked: Settings') }}>⚙️ Settings</MenuItem>
              <MenuItem onClick={() => { setMenuOpen(false); setResult('Clicked: Logout') }}>🚪 Logout</MenuItem>
            </Menu>
          </Box>
          <CmdBlock type="menu" idx={0} action="getMenuStatus" desc="Get items+keys" />
          <CmdBlock type="menu" idx={0} action="navigateTo" params='{"key":"0"}' desc="Click key=0" />
          <CmdBlock type="menu" idx={0} action="navigateTo" params='{"key":"1"}' desc="Click key=1" />
        </Section>

        {/* ====== TABLE ====== */}
        <Section title="13. Table" color="#1b5e20">
          <Table size="small" sx={{ maxWidth: 500, mb: 0.5 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow><TableCell padding="checkbox"><Checkbox /></TableCell><TableCell>Alice</TableCell><TableCell>Admin</TableCell><TableCell>Active</TableCell></TableRow>
              <TableRow><TableCell padding="checkbox"><Checkbox /></TableCell><TableCell>Bob</TableCell><TableCell>Editor</TableCell><TableCell>Inactive</TableCell></TableRow>
            </TableBody>
          </Table>
          <CmdBlock type="table" idx={0} action="getTableStatus" desc="Get table" />
          <CmdBlock type="table" idx={0} action="selectRow" params='{"key":"0"}' desc="Toggle row 0" />
          <CmdBlock type="table" idx={0} action="selectAllRows" desc="Toggle all" />
        </Section>

        {/* ====== DATEPICKER ====== */}
        <Section title="14. DatePicker (@mui/x)" color="#00695c">
          <Box sx={{ mb: 1 }}>
            <Ci4aDatePicker label="Pick a date" />
          </Box>
          <CmdBlock type="datepicker" idx={0} action="getDateStatus" desc="Get date" />
          <CmdBlock type="datepicker" idx={0} action="setDateValue" params='{"date":"2026-12-25"}' desc="Set 2026-12-25" />
        </Section>

        {/* ====== RESULT ====== */}
        <Paper sx={{ bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#1a237e' }}>
            📋 Last Action Result
          </Typography>
          <Box sx={{ bgcolor: '#263238', color: '#80cbc4', p: 2, borderRadius: 1, minHeight: 40, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>
            {result || 'Click a test command below each component'}
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
