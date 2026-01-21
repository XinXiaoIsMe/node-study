<script lang="ts" setup>
//如果有token代表登录过了 如果没有则跳转到登录页面，并且地址栏携带AppID
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
if (!token) {
  fetch('http://localhost:3000/login?appId=Rs6s2aHi').then(res => {
    location.href = res.url
  })
}
</script>

<template>
  <div>Vue Client</div>
</template>
