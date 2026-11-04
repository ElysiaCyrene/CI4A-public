<template>
  <div class="p"><div class="ph"><el-button text @click="goBack"><el-icon><ArrowLeft /></el-icon> Back</el-button><h1 class="pt">{{f.title||'View Page'}}</h1></div>
    <div class="fc" v-if="f.page_id">
      <div class="ir"><span class="l">ID</span><span>{{f.page_id}}</span></div>
      <div class="ir"><span class="l">Title</span><span>{{f.title}}</span></div>
      <div class="ir"><span class="l">URL Key</span><span>{{f.identifier}}</span></div>
      <div class="ir"><span class="l">Status</span><span>{{f.is_active==1?'Enabled':'Disabled'}}</span></div>
      <div class="ir"><span class="l">Created</span><span>{{fd(f.creation_time)}}</span></div>
      <div class="ir"><span class="l">Modified</span><span>{{fd(f.update_time)}}</span></div>
      <div style="margin-top:16px"><span class="l">Content</span><div style="margin-top:8px;background:#f9f9f9;padding:16px;border:1px solid #eee;white-space:pre-wrap">{{f.content||'No content'}}</div></div>
    </div>
    <div v-else style="text-align:center;padding:40px;color:#999">Loading...</div>
  </div>
</template>
<script setup>import {ref,reactive,onMounted} from 'vue';import {ArrowLeft} from '@element-plus/icons-vue';import dayjs from 'dayjs'
const props=defineProps({pageId:{type:[String,Number],required:true}});const emit=defineEmits(['navigate'])
const f=reactive({page_id:null,title:'',identifier:'',is_active:null,creation_time:null,update_time:null,content:''})
const fd=v=>v?dayjs(v).format('MMM D, YYYY h:mm:ss A'):''
const goBack=()=>{emit('navigate','content_pages')}
onMounted(async()=>{try{const r=await fetch(`/api/content/pages/${props.pageId}`);const d=await r.json();Object.assign(f,d)}catch(e){console.error(e)}})
</script>
<style scoped>.p{padding:0}.ph{display:flex;align-items:center;gap:16px;margin-bottom:20px}.pt{font-size:24px;font-weight:600;margin:0}.fc{background:#fff;padding:24px;border:1px solid #d9d9d9;border-radius:4px;max-width:600px}.ir{display:flex;justify-content:space-between;margin-bottom:10px;padding:8px 0;border-bottom:1px solid #f0f0f0}.l{font-weight:600;color:#303030;font-size:13px}</style>
