<template>
  <a class="file_box" :href="content.content" :download="content.filename">
    <div style="height:100%;display: flex;flex-direction: column;justify-content: space-between;margin-right:20px">
      <div style="font-weight: bold">
        {{
          content.filename.length > 10 ?
              content.filename.slice(0, 8) + '...' :
              content.filename
        }}
      </div>
      <div style="font-size: 14px;color: #aaaaaa">
        {{
          !(content.size > 900) ?
              content.size + 'B' :
              !(content.size > 9000000) ?
                  (content.size / 1024.0).toFixed(1) + 'KB' :
                  (content.size / 1048576.0).toFixed(1) + 'MB'
        }}
      </div>
    </div>
    <van-icon name="tosend" size="50"/>
  </a>
</template>

<script>
export default {
  name: "fileRecord",
  props: {
    content: Object
  }
}
</script>

<style scoped>
.file_box {
  background: white;
  border-radius: 5px;
  box-shadow: 2px 2px 5px #cccccc;
  margin: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  color: black;
}

.file_box:hover {
  background: #dddddd;
}
</style>