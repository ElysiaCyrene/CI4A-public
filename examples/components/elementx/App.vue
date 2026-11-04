<script setup>
import { ref } from 'vue';
const name=ref(''), saved=ref(''), choice=ref('alpha'), checked=ref(false), enabled=ref(false), quantity=ref(1), level=ref(30), rating=ref(3), date=ref(null), time=ref(null), radio=ref('A'), page=ref(1), schema=ref('');
const options=[{label:'Alpha',value:'alpha'},{label:'Beta',value:'beta'}];
const rows=[{key:1,name:'Alpha',value:10},{key:2,name:'Beta',value:20}];
const columns=[{title:'Name',dataIndex:'name'},{title:'Value',dataIndex:'value'}];
function inspect(){schema.value=JSON.stringify(window.__ci4a__?.exportSchema(),null,2);}
</script>
<template><main><h1>CI4A elementx component playground</h1><p>Use the component interface to enter a name, then click Save. These are local test values.</p><section><el-input v-model="name" placeholder="Name" aria-label="Name" />
<el-select v-model="choice" style="width:180px"><el-option v-for="o in options" :key="o.value" :label="o.label" :value="o.value" /></el-select>
<el-checkbox v-model="checked">Enabled</el-checkbox><el-switch v-model="enabled" />
<el-input-number v-model="quantity" :min="0" :max="100" />
<el-slider v-model="level" style="width:200px" /><el-rate v-model="rating" />
<el-date-picker v-model="date" /><el-time-picker v-model="time" />
<el-radio-group v-model="radio"><el-radio value="A">A</el-radio><el-radio value="B">B</el-radio></el-radio-group>
<el-button type="primary" @click="saved = name">Save</el-button><el-button disabled>Disabled</el-button>
<el-table :data="rows"><el-table-column prop="name" label="Name"/><el-table-column prop="value" label="Value"/></el-table>
<el-pagination v-model:current-page="page" :total="50" /></section><p data-testid="saved">Saved: {{saved}}</p><button @click="inspect">Inspect CI4A registry</button><pre>{{schema}}</pre></main></template>
<style>body{font-family:system-ui;margin:32px;color:#172033}main{max-width:1100px;margin:auto}section{display:flex;flex-wrap:wrap;gap:20px;align-items:center}section>div{max-width:100%}pre{white-space:pre-wrap;max-height:400px;overflow:auto}h1{font-size:28px}</style>
