<template>
  <div class="p">
    <div class="ph"><h1 class="pt">Customers</h1></div>
    <div class="bar"><div class="tools">
      <el-button @click="sf=!sf"><el-icon><Filter /></el-icon> Filters</el-button>
      <el-popover trigger="click" placement="bottom-end" :width="220">
        <template #reference><el-button><el-icon><Setting /></el-icon> Columns <el-icon><ArrowDown /></el-icon></el-button></template>
        <el-checkbox-group v-model="vis" style="display:flex;flex-direction:column">
          <el-checkbox v-for="c in allColumns" :key="c.key" :value="c.key" style="margin-bottom:8px">{{ c.title }}</el-checkbox>
        </el-checkbox-group>
      </el-popover>
    </div></div>
    <div v-if="sf" class="fsec">
      <el-row :gutter="16">
        <el-col :span="6"><div class="fl">Account Created</div><div style="display:flex;gap:8px"><el-date-picker v-model="f.created_at_from" type="date" placeholder="from" value-format="YYYY-MM-DD" size="small" style="width:100%"/><el-date-picker v-model="f.created_at_to" type="date" placeholder="to" value-format="YYYY-MM-DD" size="small" style="width:100%"/></div></el-col>
        <el-col :span="6"><div class="fl">Name</div><el-input v-model="f.name" size="small"/></el-col>
        <el-col :span="6"><div class="fl">Email</div><el-input v-model="f.email" size="small"/></el-col>
        <el-col :span="6"><div class="fl">Group</div><el-input v-model="f.group_id" placeholder="Group ID" size="small"/></el-col>
      </el-row>
      <el-row :gutter="16" style="margin-top:12px">
        <el-col :span="6"><div class="fl">Phone</div><el-input v-model="f.billing_telephone" size="small"/></el-col>
        <el-col :span="6"><div class="fl">ZIP</div><el-input v-model="f.billing_postcode" size="small"/></el-col>
        <el-col :span="6"><div class="fl">Country</div><el-input v-model="f.billing_country_id" size="small"/></el-col>
        <el-col :span="6"><div class="fl">State/Province</div><el-input v-model="f.billing_region" size="small"/></el-col>
      </el-row>
      <div class="fa"><el-button @click="reset">Cancel</el-button><el-button type="primary" @click="apply">Apply Filters</el-button></div>
    </div>
    <div class="tc"><span class="rc">{{ t }} records found</span>
      <div class="right"><el-select v-model="pg.pageSize" style="width:80px" size="small" @change="onPs"><el-option v-for="s in [20,50,100]" :key="s" :label="s" :value="s"/></el-select><span class="rc" style="margin-left:8px">per page</span><el-pagination v-model:current-page="pg.current" :total="t" :page-size="pg.pageSize" layout="prev,pager,next" small @current-change="onP"/></div>
    </div>
    <div class="tcard">
      <el-table :data="d" v-loading="l" border stripe>
        <el-table-column v-if="vis.includes('name')" prop="name" label="Name" sortable/>
        <el-table-column v-if="vis.includes('email')" prop="email" label="Email" sortable/>
        <el-table-column v-if="vis.includes('group')" label="Group" sortable><template #default="{row}">{{row.customer_group_code||row.group_id}}</template></el-table-column>
        <el-table-column v-if="vis.includes('billing_telephone')" prop="billing_telephone" label="Phone"/>
        <el-table-column v-if="vis.includes('billing_postcode')" prop="billing_postcode" label="ZIP"/>
        <el-table-column v-if="vis.includes('billing_country_id')" prop="billing_country_id" label="Country"/>
        <el-table-column v-if="vis.includes('billing_region')" prop="billing_region" label="State/Province"/>
        <el-table-column v-if="vis.includes('created_at')" prop="created_at" label="Customer Since" sortable><template #default="{row}">{{fd(row.created_at)}}</template></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'; import { Filter, Setting, ArrowDown } from '@element-plus/icons-vue'; import dayjs from 'dayjs'
const allColumns=[{title:'Name',key:'name'},{title:'Email',key:'email'},{title:'Group',key:'group'},{title:'Phone',key:'billing_telephone'},{title:'ZIP',key:'billing_postcode'},{title:'Country',key:'billing_country_id'},{title:'State/Province',key:'billing_region'},{title:'Customer Since',key:'created_at'}]
const vis=ref(allColumns.map(c=>c.key)),l=ref(false),d=ref([]),sf=ref(true),t=ref(0)
const f=reactive({created_at_from:null,created_at_to:null,name:'',email:'',group_id:'',billing_telephone:'',billing_postcode:'',billing_country_id:'',billing_region:''})
const pg=reactive({current:1,pageSize:20})
const fd=v=>v?dayjs(v).format('MMM D, YYYY h:mm:ss A'):''
const apply=()=>{pg.current=1;fetchData()}
const reset=()=>{Object.keys(f).forEach(k=>f[k]=k.includes('_at_')?null:'');sf.value=false;fetchData()}
const onP=(p)=>{pg.current=p;fetchData()};const onPs=()=>{pg.current=1;fetchData()}
const fetchData=async()=>{l.value=true;try{const p=new URLSearchParams({page:pg.current,pageSize:pg.pageSize});Object.entries(f).forEach(([k,v])=>{if(v!=null&&v!=='')p.append(k,v)});const r=await fetch(`/api/customers?${p}`);const j=await r.json();d.value=j.items||[];t.value=j.total||0}catch(e){console.error(e)}finally{l.value=false}}
onMounted(()=>fetchData())
</script>
<style scoped>.p{padding:0}.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.pt{font-size:28px;font-weight:300;margin:0;color:#262626}.bar{display:flex;align-items:center;margin-bottom:16px;background:#f5f5f5;padding:12px;border:1px solid #e3e3e3;border-radius:4px;justify-content:flex-end}.tools{display:flex;gap:8px}.fsec{background:#f5f5f5;padding:16px;margin-bottom:16px;border:1px solid #e3e3e3;border-radius:4px}.fl{font-weight:600;font-size:12px;margin-bottom:6px;color:#333}.fa{display:flex;justify-content:flex-end;margin-top:12px;gap:8px}.tc{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.rc{color:#666;font-size:13px}.right{display:flex;align-items:center;gap:0}.tcard{background:#fff;padding:16px;border:1px solid #e3e3e3;border-radius:4px}</style>
