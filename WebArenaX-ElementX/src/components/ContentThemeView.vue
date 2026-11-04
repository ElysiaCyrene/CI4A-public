<template>
  <div class="p">
    <div class="ph"><h1 class="pt">Theme: {{ theme.theme_title || 'Loading...' }}</h1><div class="ha"><el-button @click="goBack"><el-icon><ArrowLeft /></el-icon> Back</el-button></div></div>
    <div class="vc" v-if="theme.theme_id">
      <div class="sb"><div class="sb-s"><div class="sb-t">THEME</div><div class="sb-i active">General</div></div></div>
      <div class="mc">
        <h2 class="st">Theme Settings</h2>
        <div class="ir"><div class="l">Theme Path</div><div class="v">{{theme.theme_path}}</div></div>
        <div class="ir"><div class="l">Theme Title</div><div class="v">{{theme.theme_title}}</div></div>
        <div class="ir"><div class="l">Theme ID</div><div class="v">{{theme.theme_id}}</div></div>
        <div class="ir"><div class="l">Parent ID</div><div class="v">{{theme.parent_id||'None'}}</div></div>
        <div class="ir"><div class="l">Preview Image</div><div class="v"><div v-if="theme.preview_image" class="pi"><img :src="theme.preview_image" style="max-width:100%;max-height:300px;border:1px solid #ccc"/></div><div v-else class="ni">No Preview Available</div></div></div>
      </div>
    </div>
    <div v-else style="text-align:center;padding:80px 20px">
      <el-icon :size="48" style="color:#ccc"><Picture /></el-icon>
      <p style="color:#999;margin-top:16px;font-size:16px">Theme not found</p>
      <p style="color:#bbb;font-size:13px">The theme may have been removed or the ID is invalid.</p>
      <el-button style="margin-top:16px" @click="goBack">Go Back</el-button>
    </div>
  </div>
</template>
<script setup>
import {ref,onMounted} from 'vue';import {ArrowLeft,Picture} from '@element-plus/icons-vue'
const props=defineProps({themeId:{type:[String,Number],required:true}});const emit=defineEmits(['back'])
const theme=ref({})
const goBack=()=>emit('back')
onMounted(async()=>{try{const r=await fetch(`/api/content/themes/${props.themeId}`);const d=await r.json();theme.value=d||{theme_id:props.themeId,theme_title:d.theme_title||`Theme #${props.themeId}`,theme_path:d.theme_path||'N/A'}}catch(e){console.error(e);theme.value={theme_id:props.themeId,theme_title:`Theme #${props.themeId}`,theme_path:'Error loading',parent_id:null}}})
</script>
<style scoped>.p{padding:24px;min-height:100vh}.ph{display:flex;justify-content:space-between;align-items:center;background:#fff;padding:16px 24px;margin:-24px -24px 24px;border-bottom:1px solid #e3e3e3}.pt{font-size:24px;font-weight:300;margin:0;color:#333}.ha{display:flex;gap:8px}.vc{display:flex;gap:24px}.sb{width:240px;background:#f5f5f5;border-right:1px solid #e3e3e3;min-height:500px}.sb-s{margin-bottom:16px}.sb-t{padding:12px 16px;font-weight:bold;color:#333;background:#e3e3e3;font-size:13px}.sb-i{padding:12px 16px;cursor:pointer;color:#333;border-left:3px solid transparent}.sb-i.active{background:#fff;border-left-color:#eb5202;font-weight:bold}.mc{flex:1;background:#fff;padding:24px;border:1px solid #e3e3e3}.st{font-size:18px;font-weight:500;margin:0 0 24px 0;padding-bottom:12px;border-bottom:1px solid #e3e3e3}.ir{display:flex;margin-bottom:24px}.l{width:200px;font-weight:600;color:#333;text-align:right;padding-right:24px}.v{flex:1;color:#666}.pi{margin-top:4px}.ni{color:#999;font-style:italic}</style>
