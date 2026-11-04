<script setup>
import { ref } from 'vue';
const name=ref(''), saved=ref(''), choice=ref('alpha'), checked=ref(false), enabled=ref(false), quantity=ref(1), level=ref(30), rating=ref(3), date=ref(null), time=ref(null), radio=ref('A'), page=ref(1), schema=ref('');
const options=[{label:'Alpha',value:'alpha'},{label:'Beta',value:'beta'}];
const rows=[{key:1,name:'Alpha',value:10},{key:2,name:'Beta',value:20}];
const columns=[{title:'Name',dataIndex:'name'},{title:'Value',dataIndex:'value'}];
function inspect(){schema.value=JSON.stringify(window.__ci4a__?.exportSchema(),null,2);}
</script>
<template><main><h1>CI4A antdx component playground</h1><p>Use the component interface to enter a name, then click Save. These are local test values.</p><section><a-input v-model:value="name" placeholder="Name" aria-label="Name" />
<a-select v-model:value="choice" :options="options" style="width:180px" />
<a-checkbox v-model:checked="checked">Enabled</a-checkbox><a-switch v-model:checked="enabled" />
<a-input-number v-model:value="quantity" :min="0" :max="100" />
<a-slider v-model:value="level" style="width:200px" /><a-rate v-model:value="rating" />
<a-date-picker v-model:value="date" /><a-time-picker v-model:value="time" />
<a-radio-group v-model:value="radio"><a-radio value="A">A</a-radio><a-radio value="B">B</a-radio></a-radio-group>
<a-button type="primary" @click="saved = name">Save</a-button><a-button disabled>Disabled</a-button>
<a-table :columns="columns" :data-source="rows" :pagination="false" row-key="key" />
<a-pagination v-model:current="page" :total="50" /></section><p data-testid="saved">Saved: {{saved}}</p><button @click="inspect">Inspect CI4A registry</button><pre>{{schema}}</pre></main></template>
<style>body{font-family:system-ui;margin:32px;color:#172033}main{max-width:1100px;margin:auto}section{display:flex;flex-wrap:wrap;gap:20px;align-items:center}section>div{max-width:100%}pre{white-space:pre-wrap;max-height:400px;overflow:auto}h1{font-size:28px}</style>
