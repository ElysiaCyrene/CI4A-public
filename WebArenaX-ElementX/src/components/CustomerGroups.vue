<template>
  <div class="p">
    <div class="ph"><h1 class="pt">Customer Groups</h1></div>
    <div class="bar"><div class="tools">
      <el-button @click="sf=!sf"><el-icon><Filter /></el-icon> Filters</el-button>
    </div></div>
    <div v-if="sf" class="fsec">
      <el-row :gutter="16">
        <el-col :span="8"><div class="fl">ID</div><div style="display:flex;gap:8px"><el-input v-model="f.customer_group_id_from" placeholder="from" size="small"/><el-input v-model="f.customer_group_id_to" placeholder="to" size="small"/></div></el-col>
        <el-col :span="8"><div class="fl">Group</div><el-input v-model="f.customer_group_code" size="small"/></el-col>
        <el-col :span="8"><div class="fl">Tax Class</div><el-input v-model="f.tax_class_id" placeholder="Tax Class ID" size="small"/></el-col>
      </el-row>
      <div class="fa"><el-button @click="reset">Cancel</el-button><el-button type="primary" @click="apply">Apply Filters</el-button></div>
    </div>
    <div class="tc"><span class="rc">{{ t }} records found</span>
      <div class="right"><el-select v-model="pg.pageSize" style="width:80px" size="small" @change="onPs"><el-option v-for="s in [20,50,100]" :key="s" :label="s" :value="s"/></el-select><span class="rc" style="margin-left:8px">per page</span><el-pagination v-model:current-page="pg.current" :total="t" :page-size="pg.pageSize" layout="prev,pager,next" small @current-change="onP"/></div>
    </div>
    <div class="tcard">
      <el-table :data="d" v-loading="l" border stripe>
        <el-table-column prop="customer_group_id" label="ID" width="80" sortable/>
        <el-table-column prop="customer_group_code" label="Group" sortable/>
        <el-table-column prop="tax_class_id" label="Tax Class" sortable/>
        <el-table-column label="Action" width="80"><template #default><a href="#">Edit</a></template></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'; import { Filter } from '@element-plus/icons-vue'
const l=ref(false),d=ref([]),sf=ref(true),t=ref(0)
const f=reactive({customer_group_id_from:'',customer_group_id_to:'',customer_group_code:'',tax_class_id:''})
const pg=reactive({current:1,pageSize:20})
const apply=()=>{pg.current=1;fetchData()}
const reset=()=>{f.customer_group_id_from='';f.customer_group_id_to='';f.customer_group_code='';f.tax_class_id='';sf.value=false;fetchData()}
const onP=(p)=>{pg.current=p;fetchData()};const onPs=()=>{pg.current=1;fetchData()}
const fetchData=async()=>{l.value=true;try{const p=new URLSearchParams({page:pg.current,pageSize:pg.pageSize});Object.entries(f).forEach(([k,v])=>{if(v!=null&&v!=='')p.append(k,v)});const r=await fetch(`/api/customer-groups?${p}`);const j=await r.json();d.value=j.items||[];t.value=j.total||0}catch(e){console.error(e)}finally{l.value=false}}
onMounted(()=>fetchData())
</script>
<style scoped>.p{padding:0}.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.pt{font-size:28px;font-weight:300;margin:0;color:#262626}.bar{display:flex;align-items:center;margin-bottom:16px;background:#f5f5f5;padding:12px;border:1px solid #e3e3e3;border-radius:4px;justify-content:flex-end}.tools{display:flex;gap:8px}.fsec{background:#f5f5f5;padding:16px;margin-bottom:16px;border:1px solid #e3e3e3;border-radius:4px}.fl{font-weight:600;font-size:12px;margin-bottom:6px;color:#333}.fa{display:flex;justify-content:flex-end;margin-top:12px;gap:8px}.tc{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.rc{color:#666;font-size:13px}.right{display:flex;align-items:center;gap:0}.tcard{background:#fff;padding:16px;border:1px solid #e3e3e3;border-radius:4px}</style>
