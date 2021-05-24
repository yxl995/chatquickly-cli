<template>
  <div v-if="item.isSelf" class="right" @click="playAudio">
    <audio :src="item.content" :id="item.filename"/>
    <van-icon v-if="playing" :name="icon"/>
    <van-icon v-else :name="require('../assets/audio_right_3.png')"/>
    {{ item.size }}"
  </div>
  <div v-else class="left" @click="playAudio">
    {{ item.size }}"
    <van-icon v-if="playing" :name="icon"/>
    <van-icon v-else :name="require('../assets/audio_left_3.png')"/>
    <audio :id="item.filename" :src="item.content"/>
  </div>
</template>

<script>
const audio_left_1 = require('../assets/audio_left_1.png')
const audio_left_2 = require('../assets/audio_left_2.png')
const audio_left_3 = require('../assets/audio_left_3.png')
const audio_right_1 = require('../assets/audio_right_1.png')
const audio_right_2 = require('../assets/audio_right_2.png')
const audio_right_3 = require('../assets/audio_right_3.png')
export default {
  name: "Audio",
  props: {
    item: Object
  },
  data() {
    return {
      icon: this.item.isSelf ? audio_right_1 : audio_left_1,
      playing: false
    }
  },
  methods: {
    playAudio() {
      let audio = document.getElementById(this.item.filename)
      if (audio.paused)
        audio.play().then(() => {
          this.playing = true
          let i = 1
          let id = setInterval(() => {
            if (audio.paused) {
              this.playing = false
              window.clearInterval(id)
            }
            i++
            if (i === 4) i = 1
            switch (i) {
              case 1: {
                this.icon = this.item.isSelf ? audio_right_1 : audio_left_1
                break
              }
              case 2: {
                this.icon = this.item.isSelf ? audio_right_2 : audio_left_2
                break
              }
              case 3: {
                this.icon = this.item.isSelf ? audio_right_3 : audio_left_3
                break
              }
            }
          }, 300)
          this.$toast({
            message: '播放中',
            icon: 'volume-o',
            forbidClick: true,
            duration: this.item.size * 1000
          })
        })
    }
  }
}
</script>

<style scoped>
.left, .right {
  max-width: 50%;
  display: flex;
  align-items: center;
  width: fit-content;
  word-break: break-all;
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
  white-space: pre-wrap;
}

.left {
  background: #111111;
  color: white;
}

.right {
  background: white;
}
</style>