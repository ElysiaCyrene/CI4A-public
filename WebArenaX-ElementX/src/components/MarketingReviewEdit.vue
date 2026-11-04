<template>
  <div class="p">
    <div class="ph"><h1 class="pt">Edit Review</h1>
      <div class="ha"><el-button @click="goBack"><el-icon><ArrowLeft /></el-icon> Back</el-button><el-button @click="handleDelete">Delete Review</el-button><el-button @click="fetchReview">Reset</el-button><el-button>Save and Next</el-button><el-button type="primary" style="background:#eb5202;border-color:#eb5202" @click="handleSave">Save Review</el-button></div>
    </div>
    <div class="fc" v-if="fs.review_id||loaded">
      <h3 class="st">Review Details</h3>
      <div class="fr"><span class="fl">Product</span><a href="#">{{fs.product_name}}</a></div>
      <div class="fr"><span class="fl">Author</span><span>{{fs.author}}</span></div>
      <div class="fr"><span class="fl">Summary Rating</span><el-rate v-model="fs.summary_rating" disabled/></div>
      <div class="fr"><span class="fl">Detailed Rating</span><el-rate v-model="fs.detailed_rating"/></div>
      <div class="fr"><span class="fl">Status</span><el-select v-model="fs.status_id" style="width:200px"><el-option label="Approved" value="Approved"/><el-option label="Pending" value="Pending"/><el-option label="Not Approved" value="Not Approved"/></el-select></div>
      <div class="fr"><span class="fl">Nickname</span><el-input v-model="fs.nickname"/></div>
      <div class="fr"><span class="fl">Summary of Review</span><el-input v-model="fs.title"/></div>
      <div class="fr"><span class="fl">Review</span><el-input v-model="fs.detail" type="textarea" :rows="6"/></div>
    </div>
    <div v-else style="text-align:center;padding:40px;color:#999">Loading...</div>
  </div>
</template>
<script setup>
import {ref,reactive,onMounted} from 'vue';import {ArrowLeft} from '@element-plus/icons-vue';import {ElMessage} from 'element-plus'
const props=defineProps({reviewId:{type:[String,Number],required:true}});const emit=defineEmits(['navigate'])
const loaded=ref(false)
const fs=reactive({product_name:'',author:'',summary_rating:0,detailed_rating:0,status_id:'Pending',nickname:'',title:'',detail:'',review_id:props.reviewId})
const goBack=()=>{emit('navigate','marketing_all_reviews')}
const fetchReview=async()=>{try{const r=await fetch(`/api/reviews?id=${props.reviewId}`);const d=await r.json();if(d.items?.length){const rv=d.items[0];const sm={1:'Approved',2:'Pending',3:'Not Approved'};fs.product_name=rv.product_name;fs.author=rv.type;fs.summary_rating=rv.rating_value||0;fs.detailed_rating=rv.rating_value||0;fs.status_id=sm[rv.status_id]||'Pending';fs.nickname=rv.nickname;fs.title=rv.title;fs.detail=rv.detail;fs.review_id=rv.review_id};loaded.value=true}catch(e){console.error(e);loaded.value=true}}
const sm={Approved:1,Pending:2,'Not Approved':3}
const handleSave=()=>{const u={...fs,status_id:sm[fs.status_id]||2,status_name:fs.status_id,review_id:props.reviewId};if(!window.__edits__)window.__edits__={};window.__edits__[`review_${props.reviewId}`]=u;ElMessage.success('You saved the review.');emit('navigate','marketing_all_reviews')}
const handleDelete=()=>{if(!window.__edits__)window.__edits__={};window.__edits__[`review_${props.reviewId}`]={_deleted:true};ElMessage.success('Review deleted (mock).');emit('navigate','marketing_all_reviews')}
onMounted(()=>fetchReview())
</script>
<style scoped>.p{padding:24px;min-height:100vh}.ph{display:flex;justify-content:space-between;align-items:center;background:#fff;padding:16px 24px;margin:-24px -24px 24px;border-bottom:1px solid #e3e3e3}.pt{font-size:24px;font-weight:300;margin:0;color:#333}.ha{display:flex;gap:8px}.fc{background:#fff;padding:32px;border:1px solid #e3e3e3;border-radius:4px;max-width:900px}.st{font-size:18px;font-weight:500;margin:0 0 24px 0;padding-bottom:12px;border-bottom:1px solid #e3e3e3}.fr{display:flex;align-items:center;gap:16px;margin-bottom:20px}.fl{font-weight:600;font-size:14px;min-width:180px}</style>
