<template>
  <div class="p"><div class="ph"><h1 class="pt">Pages</h1><el-button type="primary" class="ob" @click="addNew">Add New Page</el-button></div>
    <div class="bar"><div class="tools"><el-button @click="sf=!sf"><el-icon><Filter /></el-icon> Filters</el-button></div></div>
    <div v-if="sf" class="fsec">
      <el-row :gutter="16">
        <el-col :span="8"><div class="fl">Title</div><el-input v-model="f.title" size="small"/></el-col>
        <el-col :span="8"><div class="fl">URL Key</div><el-input v-model="f.identifier" size="small"/></el-col>
        <el-col :span="8"><div class="fl">Status</div><el-select v-model="f.is_active" clearable size="small" style="width:100%"><el-option label="Enabled" :value="1"/><el-option label="Disabled" :value="0"/></el-select></el-col>
      </el-row>
      <div class="fa"><el-button @click="reset">Cancel</el-button><el-button type="primary" @click="apply">Apply Filters</el-button></div>
    </div>
    <div class="tc"><span class="rc">{{ t }} records found</span><div class="right"><el-select v-model="pg.pageSize" style="width:80px" size="small" @change="onPs"><el-option v-for="s in [20,50,100,200]" :key="s" :label="s" :value="s"/></el-select><span class="rc" style="margin-left:8px">per page</span><el-pagination v-model:current-page="pg.current" :total="t" :page-size="pg.pageSize" layout="prev,pager,next" small @current-change="onP"/></div></div>
    <div class="tcard">
      <el-table :data="d" v-loading="l" border stripe @row-click="onRow" style="cursor:pointer">
        <el-table-column prop="page_id" label="ID" width="80" sortable/>
        <el-table-column prop="title" label="Title" sortable/>
        <el-table-column prop="identifier" label="URL Key" sortable/>
        <el-table-column prop="is_active" label="Status" width="100" sortable><template #default="{row}">{{row.is_active==1?'Enabled':'Disabled'}}</template></el-table-column>
        <el-table-column prop="creation_time" label="Created" width="160"><template #default="{row}">{{fd(row.creation_time)}}</template></el-table-column>
        <el-table-column prop="update_time" label="Modified" width="160"><template #default="{row}">{{fd(row.update_time)}}</template></el-table-column>
        <el-table-column label="Action" width="120" fixed="right"><template #default="{row}"><a href="#" @click.prevent.stop="onEdit(row)">Edit</a>&nbsp;<a href="#" @click.prevent.stop="onView(row)">View</a></template></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'; import { Filter } from '@element-plus/icons-vue'; import dayjs from 'dayjs'
const emit=defineEmits(['navigate']);const props=defineProps({initialFilters:{type:Object,default:()=>({})}})
const l=ref(false),d=ref([]),sf=ref(true),t=ref(0)
const f=reactive({title:'',identifier:'',is_active:undefined})
const pg=reactive({current:1,pageSize:20});const fd=v=>v?dayjs(v).format('MMM D, YYYY h:mm:ss A'):''
const addNew=()=>emit('navigate','content_page_edit',{id:'new'})
const apply=()=>{pg.current=1;fetchData()};const reset=()=>{f.title='';f.identifier='';f.is_active=undefined;sf.value=false;fetchData()}
const onP=(p)=>{pg.current=p;fetchData()};const onPs=()=>{pg.current=1;fetchData()}
const onRow=(r)=>{onEdit(r)}
const onEdit=(r)=>{emit('navigate','content_page_edit',{id:r.page_id,savedState:{...f,page:pg.current,pageSize:pg.pageSize}})}
const onView=(r)=>{emit('navigate','content_page_view',{id:r.page_id,savedState:{...f,page:pg.current,pageSize:pg.pageSize}})}
const fetchData=async()=>{l.value=true;try{const p=new URLSearchParams({page:pg.current,pageSize:pg.pageSize});Object.entries(f).forEach(([k,v])=>{if(v!=null&&v!=='')p.append(k,v)});const r=await fetch(`/api/content/pages?${p}`);const j=await r.json();d.value=j.items||[];t.value=j.total||0;
  if(props.initialFilters?.tempUpdate){const tu=props.initialFilters.tempUpdate;const idx=d.value.findIndex(x=>x.page_id==tu.page_id);if(idx!==-1)d.value[idx]={...d.value[idx],...tu};else d.value.unshift(tu)}
  if(props.initialFilters?.newPage)fetchData()
}catch(e){console.error(e)}finally{l.value=false}}
onMounted(()=>{if(props.initialFilters){const{page,pageSize,...rest}=props.initialFilters;Object.assign(f,rest);if(page)pg.current=page;if(pageSize)pg.pageSize=pageSize};fetchData()})
</script>
<style scoped>.p{padding:0}.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.pt{font-size:28px;font-weight:300;margin:0;color:#262626}.ob{background-color:#eb5202;border-color:#eb5202}.bar{display:flex;align-items:center;margin-bottom:16px;background:#f5f5f5;padding:12px;border:1px solid #e3e3e3;border-radius:4px;justify-content:flex-end}.tools{display:flex;gap:8px}.fsec{background:#f5f5f5;padding:16px;margin-bottom:16px;border:1px solid #e3e3e3;border-radius:4px}.fl{font-weight:600;font-size:12px;margin-bottom:6px;color:#333}.fa{display:flex;justify-content:flex-end;margin-top:12px;gap:8px}.tc{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.rc{color:#666;font-size:13px}.right{display:flex;align-items:center;gap:0}.tcard{background:#fff;padding:16px;border:1px solid #e3e3e3;border-radius:4px}</style>
