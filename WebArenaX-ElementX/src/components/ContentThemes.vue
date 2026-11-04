<template>
  <div class="p"><div class="ph"><h1 class="pt">Themes</h1></div>
    <div class="tc"><span class="rc">{{ t }} records found</span><div class="right"><el-select v-model="pg.pageSize" style="width:80px" size="small" @change="onPs"><el-option v-for="s in [20,50,100,200]" :key="s" :label="s" :value="s"/></el-select><span class="rc" style="margin-left:8px">per page</span><el-pagination v-model:current-page="pg.current" :total="t" :page-size="pg.pageSize" layout="prev,pager,next" small @current-change="onP"/></div></div>
    <div class="tcard">
      <el-table :data="d" v-loading="l" border stripe @row-click="onRow" style="cursor:pointer">
        <el-table-column prop="theme_id" label="ID" width="80" sortable/>
        <el-table-column prop="theme_title" label="Theme Title" sortable/>
        <el-table-column prop="theme_path" label="Path" sortable/>
        <el-table-column prop="parent_id" label="Parent ID" width="80"/>
        <el-table-column label="Action" width="80" fixed="right"><template #default="{row}"><a href="#" @click.prevent.stop="onView(row)">View</a></template></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
const emit=defineEmits(['navigate']);const props=defineProps({initialFilters:{type:Object,default:()=>({})}})
const l=ref(false),d=ref([]),t=ref(0)
const pg=reactive({current:1,pageSize:20})
const onP=(p)=>{pg.current=p;fetchData()};const onPs=()=>{pg.current=1;fetchData()}
const onRow=(r)=>{onView(r)}
const onView=(r)=>{emit('navigate','content_theme_view',{id:r.theme_id,savedState:{page:pg.current,pageSize:pg.pageSize}})}
const fetchData=async()=>{l.value=true;try{const p=new URLSearchParams({page:pg.current,pageSize:pg.pageSize});const r=await fetch(`/api/content/themes?${p}`);const j=await r.json();d.value=j.items||[];t.value=j.total||0}catch(e){console.error(e)}finally{l.value=false}}
onMounted(()=>{if(props.initialFilters){const{page,pageSize}=props.initialFilters;if(page)pg.current=page;if(pageSize)pg.pageSize=pageSize};fetchData()})
</script>
<style scoped>.p{padding:0}.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.pt{font-size:28px;font-weight:300;margin:0;color:#262626}.tc{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.rc{color:#666;font-size:13px}.right{display:flex;align-items:center;gap:0}.tcard{background:#fff;padding:16px;border:1px solid #e3e3e3;border-radius:4px}</style>
