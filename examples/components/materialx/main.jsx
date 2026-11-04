import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Button, TextField, Select, MenuItem, Checkbox, Switch, Slider, Rating, Radio, RadioGroup, FormControlLabel, Autocomplete, Table, TableHead, TableBody, TableRow, TableCell, Pagination, Stack} from '@mui/material';
function App(){
const [name,setName]=useState(''),[saved,setSaved]=useState(''),[choice,setChoice]=useState('alpha'),[checked,setChecked]=useState(false),[enabled,setEnabled]=useState(false),[level,setLevel]=useState(30),[rating,setRating]=useState(3),[radio,setRadio]=useState('A'),[auto,setAuto]=useState(null),[page,setPage]=useState(1),[schema,setSchema]=useState('');
return <main style={{fontFamily:'system-ui',maxWidth:1100,margin:'32px auto'}}><h1>CI4A MaterialX component playground</h1><p>Use the component interface to enter a name, then click Save. These are local test values.</p>
<Stack spacing={3}>
<TextField label="Name" value={name} onChange={e=>setName(e.target.value)} />
<Select value={choice} onChange={e=>setChoice(e.target.value)}><MenuItem value="alpha">Alpha</MenuItem><MenuItem value="beta">Beta</MenuItem></Select>
<FormControlLabel label="Enabled" control={<Checkbox checked={checked} onChange={e=>setChecked(e.target.checked)} />} />
<Switch checked={enabled} onChange={e=>setEnabled(e.target.checked)} />
<Slider value={level} onChange={(_,v)=>setLevel(v)} /><Rating value={rating} onChange={(_,v)=>setRating(v)} />
<RadioGroup value={radio} onChange={e=>setRadio(e.target.value)}><FormControlLabel value="A" label="A" control={<Radio/>}/><FormControlLabel value="B" label="B" control={<Radio/>}/></RadioGroup>
<Autocomplete options={['Alpha','Beta','Gamma']} value={auto} onChange={(_,v)=>setAuto(v)} renderInput={params=><TextField {...params} label="Autocomplete"/>}/>
<Button variant="contained" onClick={()=>setSaved(name)}>Save</Button><Button disabled>Disabled</Button>
<Table><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Value</TableCell></TableRow></TableHead><TableBody><TableRow><TableCell>Alpha</TableCell><TableCell>10</TableCell></TableRow><TableRow><TableCell>Beta</TableCell><TableCell>20</TableCell></TableRow></TableBody></Table>
<Pagination page={page} onChange={(_,v)=>setPage(v)} count={5}/></Stack>
<p data-testid="saved">Saved: {saved}</p><button onClick={()=>setSchema(JSON.stringify(window.__ci4a__?.exportSchema(),null,2))}>Inspect CI4A registry</button><pre style={{whiteSpace:'pre-wrap'}}>{schema}</pre></main>;
}
createRoot(document.getElementById('app')).render(<App/>);
