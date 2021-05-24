<template>
  <div class="head">
    <slot name="content"></slot>
    <slot name="back">
      <div style="position: absolute;left: 10px">
        <van-icon name="arrow-left" @click="$router.back()"/>
      </div>
    </slot>
  </div>
</template>

<script>
export default {
  name: "Head"
}
</script>

<style scoped>
.head {
  width: 100%;
  height: 50px;
  background: #eeeeee;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 10px lightgray;
  position: fixed;
  top: 0;
  z-index: 1000;
}
</style>