<template>
  <div class="p">
    <div class="ph"><div class="hl"><el-button text @click="goBack"><el-icon><ArrowLeft /></el-icon> Back</el-button><h1 class="pt">{{isNew?'New Page':(page.title||'Edit Page')}}</h1></div><div class="ha"><el-button @click="goBack">Delete Page</el-button><el-button type="primary" style="background:#eb5202;border-color:#eb5202" @click="handleSave" :loading="saving">Save</el-button></div></div>
    <div v-if="loading" style="text-align:center;padding:50px">Loading...</div>
    <div v-else class="fc">
      <div class="fr"><span class="fl">Enable Page</span><el-switch v-model="form.is_active"/></div>
      <div class="fr"><span class="fl">Page Title</span><el-input v-model="form.title" style="width:400px"/></div>
      <el-collapse v-model="activeKey">
        <el-collapse-item title="Content" name="content">
          <div class="fr"><span class="fl">Content Heading</span><el-input v-model="form.content_heading" style="width:400px"/></div>
          <div class="fr"><span class="fl"></span><el-input v-model="form.content" type="textarea" :rows="10" style="width:100%"/><div style="text-align:right;margin-top:4px"><el-button size="small">Edit with Page Builder</el-button></div></div>
        </el-collapse-item>
        <el-collapse-item title="Search Engine Optimization" name="seo">
          <div class="fr"><span class="fl">URL Key</span><el-input v-model="form.identifier" style="width:400px"/></div>
          <div class="fr"><span class="fl">Meta Title</span><el-input v-model="form.meta_title" style="width:400px"/></div>
          <div class="fr"><span class="fl">Meta Keywords</span><el-input v-model="form.meta_keywords" type="textarea" :rows="3" style="width:400px"/></div>
          <div class="fr"><span class="fl">Meta Description</span><el-input v-model="form.meta_description" type="textarea" :rows="3" style="width:400px"/></div>
        </el-collapse-item>
        <el-collapse-item title="Page in Websites" name="websites">
          <div class="fr"><span class="fl">Store View</span><el-select v-model="form.store_views" multiple placeholder="Select Store View" style="width:400px"><el-option label="All Store Views" value="all"/><el-option label="Main Website" value="main"/></el-select></div>
        </el-collapse-item>
        <el-collapse-item title="Design" name="design">
          <div class="fr"><span class="fl">Layout</span><el-select v-model="form.layout" style="width:300px"><el-option label="1 column" value="1column"/><el-option label="2 columns with left bar" value="2columns-left"/><el-option label="2 columns with right bar" value="2columns-right"/><el-option label="3 columns" value="3columns"/></el-select></div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>
<script setup>
import {ref,reactive,onMounted} from 'vue';import {ArrowLeft} from '@element-plus/icons-vue';import {ElMessage} from 'element-plus'
const props=defineProps({pageId:{type:[String,Number],required:true}});const emit=defineEmits(['navigate'])
const isNew=ref(props.pageId==='new'),loading=ref(!isNew.value),saving=ref(false)
const page=reactive({})
const activeKey=ref(['content','seo','websites','design'])
const form=reactive({is_active:true,title:'',content_heading:'',content:'',identifier:'',meta_title:'',meta_keywords:'',meta_description:'',store_views:[],layout:'1column'})
const goBack=()=>emit('navigate','content_pages')
const handleSave=async()=>{saving.value=true;await new Promise(r=>setTimeout(r,500));const d={...form,page_id:isNew.value?Date.now():props.pageId};if(!window.__edits__)window.__edits__={};window.__edits__[`page_${d.page_id}`]=d;ElMessage.success('Page saved.');emit('navigate','content_pages',{tempUpdate:d,newPage:isNew.value});saving.value=false}
onMounted(async()=>{if(!isNew.value){try{const r=await fetch(`/api/content/pages/${props.pageId}`);const d=await r.json();Object.assign(page,d);Object.assign(form,{is_active:d.is_active===1,title:d.title||'',content_heading:d.content_heading||'',content:d.content||'',identifier:d.identifier||'',meta_title:d.meta_title||'',meta_keywords:d.meta_keywords||'',meta_description:d.meta_description||'',store_views:[],layout:d.layout||'1column'})}catch(e){console.error(e)}finally{loading.value=false}}})
</script>
<style scoped>.p{padding:24px;min-height:100vh}.ph{display:flex;justify-content:space-between;align-items:center;background:#fff;padding:16px 24px;margin:-24px -24px 24px;border-bottom:1px solid #e3e3e3}.hl{display:flex;align-items:center;gap:16px}.pt{font-size:24px;font-weight:600;margin:0}.ha{display:flex;gap:8px}.fc{background:#fff;padding:24px;border:1px solid #e3e3e3;border-radius:4px;max-width:800px}.fr{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px}.fl{font-weight:600;font-size:13px;min-width:150px;padding-top:8px}</style>
