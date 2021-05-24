<template>
  <div class="record_box">
    <div style="width: 20%;display: flex;justify-content: center;align-items: center">
      <van-badge v-if="item.item.record.notRead!==0" :content="item.item.record.notRead">
        <img src="../assets/default_head.jpg" alt="avatar"
             style="width: 50px;height: 50px;border-radius: 10px">
      </van-badge>
      <img v-else src="../assets/default_head.jpg" alt="avatar"
           style="width: 50px;height: 50px;border-radius: 10px">
    </div>
    <div class="record_content">
      <div style="width: 100%;display: flex;justify-content: space-between">
        <span style="font-size: 17px;font-weight: bold">{{ item.name }}</span>
        <span v-if="item.item.record.list.length!==0" style="color: gray;font-size: 14px">
                      {{ item.item.record.list[item.item.record.list.length - 1].time.slice(0, 5) }}
                    </span>
        <span v-else></span>
      </div>
      <div v-if="item.item.record.list.length!==0" style="width: 100%;color: gray;font-size: 14px">
        <span style="width: 100%" v-if="item.item.record.list[item.item.record.list.length - 1].type==='text'">
          {{
            item.item.record.list[item.item.record.list.length - 1].content.length > 12 ?
                item.item.record.list[item.item.record.list.length - 1].content.slice(0, 10) + '...' :
                item.item.record.list[item.item.record.list.length - 1].content
          }}
        </span>
        <span style="width: 100%" v-if="item.item.record.list[item.item.record.list.length - 1].type==='image'">
          [图片]
        </span>
        <span style="width: 100%" v-if="item.item.record.list[item.item.record.list.length - 1].type==='file'">
          [文件]
        </span>
        <span style="width: 100%" v-if="item.item.record.list[item.item.record.list.length - 1].type==='audio'">
          [语音]
        </span>
      </div>
      <span v-else></span>
    </div>
  </div>
</template>

<script>
export default {
  name: "Record",
  props: {
    item: Object
  }
}
</script>

<style scoped>
.record_box {
  display: flex;
  align-items: center
}


.record_content {
  border-bottom: 1px solid lightgray;
  width: 80%;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 15px 15px 15px 0;
  box-sizing: border-box
}

.record_box:hover {
  background: #dddddd;
}
</style>