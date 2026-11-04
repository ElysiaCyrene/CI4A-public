<template>
  <div class="p">
    <div class="ph"><h1 class="pt">Reviews</h1><el-button type="primary" style="background:#eb5202;border-color:#eb5202">New Review</el-button></div>
    <div class="fcard"><h3>Filter</h3>
      <el-row :gutter="16">
        <el-col :span="4"><div class="fl">ID</div><el-input v-model="f.id" size="small"/></el-col>
        <el-col :span="4"><div class="fl">Status</div><el-select v-model="f.status" clearable size="small" style="width:100%"><el-option label="Approved" value="Approved"/><el-option label="Pending" value="Pending"/><el-option label="Not Approved" value="Not Approved"/></el-select></el-col>
        <el-col :span="4"><div class="fl">Created From</div><el-date-picker v-model="f.created_from" type="date" value-format="YYYY-MM-DD" size="small" style="width:100%"/></el-col>
        <el-col :span="4"><div class="fl">Created To</div><el-date-picker v-model="f.created_to" type="date" value-format="YYYY-MM-DD" size="small" style="width:100%"/></el-col>
        <el-col :span="4"><div class="fl">Title</div><el-input v-model="f.title" size="small"/></el-col>
        <el-col :span="4"><div class="fl">Nickname</div><el-input v-model="f.nickname" size="small"/></el-col>
      </el-row>
      <el-row :gutter="16" style="margin-top:12px">
        <el-col :span="4"><div class="fl">Type</div><el-select v-model="f.type" clearable size="small" style="width:100%"><el-option label="Customer" value="Customer"/><el-option label="Guest" value="Guest"/></el-select></el-col>
        <el-col :span="4"><div class="fl">Product</div><el-input v-model="f.product" placeholder="Product Name" size="small"/></el-col>
        <el-col :span="4"><div class="fl">SKU</div><el-input v-model="f.sku" size="small"/></el-col>
        <el-col :span="4"><div class="fl">Review</div><el-input v-model="f.review" size="small"/></el-col>
        <el-col :span="4"><div class="fl">Visibility</div><el-select v-model="f.visibility" clearable size="small" style="width:100%"><el-option v-for="s in stores" :key="s.name" :label="s.name" :value="s.name"/></el-select></el-col>
        <el-col :span="4" style="display:flex;align-items:flex-end"><div><el-button type="primary" @click="search">Search</el-button><el-button @click="reset">Reset Filter</el-button></div></el-col>
      </el-row>
    </div>
    <div class="tc"><div class="left"><el-select v-model="ba" placeholder="Actions" style="width:200px" size="small"><el-option label="Delete" value="delete"/><el-option label="Update Status" value="update_status"/></el-select><el-select v-if="ba==='update_status'" v-model="ts" placeholder="Select Status" style="width:200px;margin-left:8px" size="small"><el-option label="Approved" value="Approved"/><el-option label="Pending" value="Pending"/><el-option label="Not Approved" value="Not Approved"/></el-select><el-button @click="handleBulk" size="small" style="margin-left:8px">Submit</el-button><el-popover trigger="click" placement="bottom-end" :width="220"><template #reference><el-button size="small" style="margin-left:8px"><el-icon><Setting /></el-icon> Columns</el-button></template><el-checkbox-group v-model="vis" style="display:flex;flex-direction:column"><el-checkbox v-for="c in allCols" :key="c.k" :value="c.k" style="margin-bottom:8px">{{c.t}}</el-checkbox></el-checkbox-group></el-popover></div><div class="right"><span class="rc">{{ t }} records found</span><el-select v-model="pg.pageSize" style="width:80px;margin-left:16px" size="small" @change="onPs"><el-option v-for="s in [20,50,100,200]" :key="s" :label="s" :value="s"/></el-select><span class="rc" style="margin-left:8px">per page</span><el-pagination v-model:current-page="pg.current" :total="t" :page-size="pg.pageSize" layout="prev,pager,next" small @current-change="onP"/></div></div>
    <div class="tcard">
      <el-table :data="d" v-loading="l" border stripe @row-click="onRow" @selection-change="onSel" style="cursor:pointer">
        <el-table-column type="selection" width="45"/>
        <el-table-column v-if="vis.includes('review_id')" prop="review_id" label="ID" width="80"/>
        <el-table-column v-if="vis.includes('created_at')" prop="created_at" label="Created" width="160"><template #default="{row}">{{fd(row.created_at)}}</template></el-table-column>
        <el-table-column v-if="vis.includes('status_name')" prop="status_name" label="Status" width="100"/>
        <el-table-column v-if="vis.includes('title')" prop="title" label="Title" show-overflow-tooltip/>
        <el-table-column v-if="vis.includes('nickname')" prop="nickname" label="Nickname" width="120"/>
        <el-table-column v-if="vis.includes('detail')" prop="detail" label="Review" show-overflow-tooltip/>
        <el-table-column v-if="vis.includes('store_names')" prop="store_names" label="Visibility" width="180"/>
        <el-table-column v-if="vis.includes('type')" prop="type" label="Type" width="100"/>
        <el-table-column v-if="vis.includes('product_name')" prop="product_name" label="Product" width="150"/>
        <el-table-column v-if="vis.includes('sku')" prop="sku" label="SKU" width="100"/>
        <el-table-column v-if="vis.includes('action')" label="Action" width="80" fixed="right"><template #default="{row}"><a href="#" @click.prevent.stop="onEdit(row)">Edit</a></template></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'; import { Setting } from '@element-plus/icons-vue'; import { ElMessage } from 'element-plus'; import dayjs from 'dayjs'
const emit=defineEmits(['navigate']);const props=defineProps({initialFilters:{type:Object,default:()=>({})}})
const l=ref(false),d=ref([]),t=ref(0),stores=ref([]),ba=ref(undefined),ts=ref(undefined),sk=ref([])
const allCols=[{t:'ID',k:'review_id'},{t:'Created',k:'created_at'},{t:'Status',k:'status_name'},{t:'Title',k:'title'},{t:'Nickname',k:'nickname'},{t:'Review',k:'detail'},{t:'Visibility',k:'store_names'},{t:'Type',k:'type'},{t:'Product',k:'product_name'},{t:'SKU',k:'sku'},{t:'Action',k:'action'}]
const vis=ref(allCols.map(c=>c.k))
const f=reactive({id:'',status:undefined,created_from:null,created_to:null,title:'',nickname:'',type:undefined,product:'',sku:'',review:'',visibility:undefined})
const pg=reactive({current:1,pageSize:20})
const fd=v=>v?dayjs(v).format('MMM D, YYYY h:mm:ss A'):''
const search=()=>{pg.current=1;fetchData()}
const reset=()=>{Object.keys(f).forEach(k=>f[k]=null);f.id='';f.title='';f.nickname='';f.product='';f.sku='';f.review='';f.status=undefined;f.type=undefined;f.visibility=undefined;fetchData()}
const onP=(p)=>{pg.current=p;fetchData()};const onPs=()=>{pg.current=1;fetchData()}
const onSel=(rows)=>{sk.value=rows.map(r=>r.review_id)}
const onRow=(r)=>{onEdit(r)}
const onEdit=(r)=>{emit('navigate','marketing_review_edit',{id:r.review_id,sourcePage:'marketing_all_reviews',savedState:{...f,page:pg.current,pageSize:pg.pageSize}})}
const handleBulk=()=>{if(!ba.value)return ElMessage.warning('Select an action');if(sk.value.length===0)return ElMessage.warning('Select items');if(ba.value==='delete'){d.value=d.value.filter(x=>!sk.value.includes(x.review_id));sk.value=[];ElMessage.success('Deleted (mock).')}else if(ba.value==='update_status'){if(!ts.value)return ElMessage.warning('Select status');const sm={Approved:1,Pending:2,'Not Approved':3};d.value=d.value.map(x=>sk.value.includes(x.review_id)?{...x,status_id:sm[ts.value],status_name:ts.value}:x);sk.value=[];ts.value=undefined;ba.value=undefined;ElMessage.success('Status updated (mock).')}}
const fetchData=async()=>{l.value=true;try{const p=new URLSearchParams({page:pg.current,pageSize:pg.pageSize});Object.entries(f).forEach(([k,v])=>{if(v!=null&&v!=='')p.append(k,v)});const r=await fetch(`/api/reviews?${p}`);const j=await r.json();d.value=j.items||[];t.value=j.total||0;
  // Apply persistent edits from window.__edits__ (never cleared, survives page transitions)
  const edits=window.__edits__||{};for(const[k,v]of Object.entries(edits)){if(v._deleted){d.value=d.value.filter(x=>x.review_id!=parseInt(k.replace('review_','')))}else{const idx=d.value.findIndex(x=>x.review_id==v.review_id);if(idx!==-1)d.value[idx]={...d.value[idx],...v};else d.value.unshift(v)}}
  if(props.initialFilters?.tempUpdate){const tu=props.initialFilters.tempUpdate;const idx=d.value.findIndex(x=>x.review_id==tu.review_id);if(idx!==-1)d.value[idx]={...d.value[idx],...tu};else d.value.unshift(tu)}
  if(props.initialFilters?.deletedIds){d.value=d.value.filter(x=>!props.initialFilters.deletedIds.includes(x.review_id))}
}catch(e){console.error(e)}finally{l.value=false}}
onMounted(async()=>{try{const r=await fetch('/api/stores');stores.value=await r.json()}catch(e){};if(props.initialFilters){const{page,pageSize,tempUpdate,tempUpdates,deletedIds,sourcePage,savedState,...rest}=props.initialFilters;Object.assign(f,rest);if(page)pg.current=page;if(pageSize)pg.pageSize=pageSize};fetchData()})
</script>
<style scoped>.p{padding:0}.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.pt{font-size:28px;font-weight:300;margin:0;color:#262626}.fcard{background:#fff;padding:16px;margin-bottom:16px;border:1px solid #e3e3e3;border-radius:4px}.fcard h3{margin:0 0 16px 0;font-size:16px;font-weight:600}.fl{font-weight:600;font-size:12px;margin-bottom:6px;color:#333}.tc{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.rc{color:#666;font-size:13px}.right{display:flex;align-items:center;gap:0}.tcard{background:#fff;padding:16px;border:1px solid #e3e3e3;border-radius:4px}</style>
