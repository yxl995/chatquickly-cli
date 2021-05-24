<template>
  <div>
    <Head>
      <template #content>
        <span style="font-weight: bold">{{ $route.params.id }}</span>
      </template>
    </Head>
    <div v-show="loading" style="width:100px;height:100px;" class="loading_shadow">
      <van-loading vertical color="#eeeeee">发送中...</van-loading>
    </div>
    <div v-show="recording" class="loading_shadow"
         style="background: rgba(0,0,0,0.5);width: 150px;top: calc(50vh - 75px);left: calc(50vw - 75px)">
      <div style="display: flex;flex-direction: column;align-items: center;width: 100%;color: white">
        <span style="margin: 15px 0 5px 0">录音中</span>
        <span style="margin: 5px 0 5px 0">{{ recordTime }}s</span>
        <van-button size="small" style="width: 80%;margin: 5px 0 5px 0;color: red" @click="cancelRecord">取消
        </van-button>
        <van-button size="small" style="width: 80%;margin: 5px 0 15px 0;color: white" color="#111111"
                    @click="endRecord">发送
        </van-button>
      </div>
    </div>
    <div class="middle" @click="showAction=false;showTab=false">
      <div style="width: 100%;display: flex" v-for="(item,index) in list" :key="index">
        <div v-if="!item.isSelf" style="width:100%;display: flex">
          <img src="../assets/default_head.jpg" alt="avatar"
               style="width: 40px;height: 40px;border-radius: 5px;margin: 10px 0 10px 10px">
          <template v-if="item.type==='text'">
            <div class="before_left"></div>
            <div class="left">{{ item.content }}</div>
          </template>
          <van-image v-if="item.type==='image'" style="margin:10px;box-shadow: 2px 2px 5px #aaaaaa"
                     width="100" radius="5" :src="item.content" @click="previewImg(item.content)"/>
          <fileRecord v-if="item.type==='file'" :content="item"/>
          <template v-if="item.type==='audio'">
            <div class="before_left"></div>
            <Audio :item="item"/>
          </template>
        </div>
        <div v-else style="width:100%;display: flex;justify-content: flex-end">
          <template v-if="item.type==='text'">
            <div class="right">{{ item.content }}</div>
            <div class="after_right"></div>
          </template>
          <van-image v-if="item.type==='image'" style="margin:10px;box-shadow: 2px 2px 5px #aaaaaa"
                     width="100" radius="5" :src="item.content" @click="previewImg(item.content)"/>
          <fileRecord v-if="item.type==='file'" :content="item"/>
          <template v-if="item.type==='audio'">
            <Audio :item="item"/>
            <div class="after_right"></div>
          </template>
          <img src="../assets/default_head.jpg" alt="avatar"
               style="width: 40px;height: 40px;border-radius: 5px;margin: 10px 10px 10px 0">
        </div>
      </div>
    </div>
    <div style="display: flex;flex-direction: column;width: 100%;position: fixed;bottom: 0">
      <div class="bottom">
        <div id="record_btn" :style="{background:recording?'#999999':'#eeeeee'}">
          <img src="../assets/audio.png" style="width:26px;height:26px;margin: 0 8px" @click="startRecord"/>
        </div>
        <van-field v-model="msg" rows="1" :autosize="{maxHeight:100}" type="textarea"
                   @keyup.enter="inputChange" @focus="inputChange" style="border-radius: 5px"/>
        <van-icon name="smile-o" size="26" style="margin: 10px 5px"
                  @click="showTab=!showTab;showAction=false;inputChange()"/>
        <van-icon v-show="msg===''" name="add-o" size="26" style="margin: 10px 5px"
                  @click="showAction=!showAction;showTab=false;inputChange()"/>
        <van-button v-show="msg!==''" size="small" type="primary" @click="sendMsg" color="#111111"
                    style="width: 70px;height:25px;font-size: 14px;margin: 10px 5px">发送
        </van-button>
      </div>
      <van-swipe v-if="showTab" :loop="false" @change="changeSwipe">
        <van-swipe-item v-for="(tab,tabIndex) in emojiList" :key="tabIndex">
          <div class="tab_box">
            <div class="emoji_box" v-for="(emoji,emojiIndex) in tab" :key="emojiIndex"
                 @click="()=>insertEmoji(tabIndex,emojiIndex)">{{ emoji }}
            </div>
          </div>
        </van-swipe-item>
        <template #indicator>
          <div class="custom-indicator">
            <div v-for="(item,index) in emojiList" :key="index"
                 :class="activeTab===index?'active_indicator':'inactive_indicator'"></div>
          </div>
        </template>
      </van-swipe>
      <div class="action" v-show="showAction">
        <div style="display: flex;flex-direction: column;align-items: center">
          <van-uploader v-model="fileList" :preview-image="false" multiple :after-read="()=>sendFile('image')">
            <div class="icon_box">
              <van-icon name="photo" size="40"/>
            </div>
          </van-uploader>
          <span style="font-size: 12px;margin: 5px 10px;color: #666666">图片</span>
        </div>
        <div style="display: flex;flex-direction: column;align-items: center">
          <van-uploader v-model="fileList" :preview-image="false" :after-read="()=>sendFile('file')"
                        accept="*">
            <div class="icon_box">
              <van-icon name="card" size="40"/>
            </div>
          </van-uploader>
          <span style="font-size: 12px;margin: 5px 0;color: #666666">文件</span>
        </div>
        <div style="display: flex;flex-direction: column;align-items: center">
          <div class="icon_box"
               @click="$router.push({name: 'Phone', params: {username:$store.state.username,to:$route.params.id,isCall:1}})">
            <van-icon name="phone" size="40"/>
          </div>
          <span style="font-size: 12px;margin: 5px 0;color: #666666">音频通话</span>
        </div>
        <div style="display: flex;flex-direction: column;align-items: center">
          <div class="icon_box"
               @click="$router.push({name: 'Video', params: {username:$store.state.username,to:$route.params.id,isCall:1}})">
            <van-icon name="photograph" size="40"/>
          </div>
          <span style="font-size: 12px;margin: 5px 0;color: #666666">视频通话</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Head from "../components/Head"
import fileRecord from "../components/fileRecord"
import Audio from "../components/Audio"
import store from '../store/index'
import {ImagePreview} from 'vant'
import Recorder from 'js-audio-recorder'
import emojiList from '../emoji/index'

const {socket, userList, username} = store.state
export default {
  name: "Chat",
  components: {
    Head,
    fileRecord,
    Audio
  },
  activated() {
    this.inputChange()
    this.list = userList[this.$route.params.id].record.list
    store.commit('isRead', this.$route.params.id)
    document.querySelector('body').setAttribute('style', 'background:#eeeeee')
  },
  deactivated() {
    this.showAction = false
    this.showTab = false
    document.querySelector('body').setAttribute('style', 'background:white')
  },
  watch: {
    list: {
      handler() {
        setTimeout(() => {
          document.documentElement.scrollTop = document.documentElement.scrollHeight - window.screen.height
        }, 100)
      },
      deep: true
    }
  },
  data() {
    return {
      msg: '',
      list: [],
      showAction: false,
      fileList: [],
      loading: false,
      recording: false,
      recordTime: 0,
      recordID: null,
      recorder: null,
      showTab: false,
      emojiList,
      activeTab: 0
    }
  },
  methods: {
    sendMsg() {
      socket.emit('sendMsg', {
        from: username,
        to: userList[this.$route.params.id].id,
        msg: this.msg,
        type: 'text'
      })
      let obj = {
        content: this.msg,
        isSelf: true,
        time: new Date().toTimeString().split(' ')[0],
        type: 'text'
      }
      store.commit('sendMsg', {record: obj, to: this.$route.params.id})
      this.msg = ''
    },
    inputChange() {
      setTimeout(() => {
        document.documentElement.scrollTop = document.documentElement.scrollHeight - window.screen.height
      }, 100)
    },
    sendFile(type) {
      this.loading = true
      this.showAction = false
      this.fileList.forEach(item => {
        let obj = {
          content: item.content,
          filename: item.file.name,
          size: item.file.size,
          isSelf: true,
          time: new Date().toTimeString().split(' ')[0],
          type
        }
        store.commit('sendMsg', {record: obj, to: this.$route.params.id})

        socket.emit('sendMsg', {
          from: username,
          to: userList[this.$route.params.id].id,
          msg: 'start',
          type,
          filename: item.file.name,
          size: item.file.size
        })
        while (item.content.length > 0) {
          socket.emit('sendMsg', {
            from: username,
            to: userList[this.$route.params.id].id,
            msg: item.content.substr(0, 500000),
            type,
            filename: item.file.name
          })
          item.content = item.content.substr(500000)
        }
        socket.emit('sendMsg', {
          from: username,
          to: userList[this.$route.params.id].id,
          msg: 'end',
          type,
          filename: item.file.name
        })
      })
      this.fileList = []
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },
    previewImg(src) {
      ImagePreview({images: [src], showIndex: false})
    },
    startRecord() {
      if (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia)
        navigator.mediaDevices.getUserMedia({audio: true}).then(() => {
          this.recording = true
          this.recordID = setInterval(() => {
            this.recordTime++
            if (this.recordTime === 60) this.endRecord()
          }, 1000)
          this.recorder = new Recorder()
          this.recorder.start()
        }).catch(() => this.$toast.fail('获取麦克风权限失败'))
      else this.$toast.fail('请允许使用麦克风')
    },
    cancelRecord() {
      this.recording = false
      window.clearInterval(this.recordID)
      this.recordID = null
      this.recordTime = 0
      this.recorder.destroy(() => this.recorder = null)
    },
    endRecord() {
      this.recorder.stop()
      if (this.recorder == null || this.recorder.duration === 0)
        this.$toast.fail('请先录音')
      else {
        let blob = this.recorder.getWAVBlob()
        let reader = new FileReader()
        let duration = this.recorder.duration
        reader.readAsDataURL(blob)
        reader.onload = () => {
          let result = reader.result
          let obj = {
            content: result,
            filename: Date.now() + '.wav',
            size: Number.parseInt(duration) + 1,
            isSelf: true,
            time: new Date().toTimeString().split(' ')[0],
            type: 'audio'
          }
          store.commit('sendMsg', {record: obj, to: this.$route.params.id})

          socket.emit('sendMsg', {
            from: username,
            to: userList[this.$route.params.id].id,
            msg: 'start',
            type: 'audio',
            filename: obj.filename,
            size: Number.parseInt(duration) + 1
          })
          while (result.length > 0) {
            socket.emit('sendMsg', {
              from: username,
              to: userList[this.$route.params.id].id,
              msg: result.substr(0, 500000),
              type: 'audio',
              filename: obj.filename
            })
            result = result.substr(500000)
          }
          socket.emit('sendMsg', {
            from: username,
            to: userList[this.$route.params.id].id,
            msg: 'end',
            type: 'audio',
            filename: obj.filename
          })
        }
        this.cancelRecord()
      }
    },
    insertEmoji(tabIndex, emojiIndex) {
      this.msg += emojiList[tabIndex][emojiIndex]
    },
    changeSwipe(index) {
      this.activeTab = index
    }
  }
}
</script>
<style scoped>

.active_indicator, .inactive_indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 0 2px;
}

.active_indicator {
  background: #111111;
}

.inactive_indicator {
  background: #999999;
}

.custom-indicator {
  width: 100%;
  height: 20px;
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tab_box {
  width: 100%;
  height: 150px;
  background: #eeeeee;
  display: flex;
  padding: 5px 0;
  flex-wrap: wrap;
}

.emoji_box {
  width: 10%;
  height: 30px;
  text-align: center;
  line-height: 30px;
  border-radius: 5px;
}

.middle {
  width: 100%;
  margin: 50px 0 55px 0;
}

.bottom {
  width: 100%;
  background: #f0f0f0;
  display: flex;
  align-items: flex-end;
  border-top: 1px solid lightgray;
  padding: 5px 0;
}

.left, .right {
  max-width: 50%;
  display: flex;
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

.before_left {
  width: 0;
  height: 0;
  border: 5px solid;
  border-color: transparent #111111 transparent transparent;
  margin-top: 25px;
}

.right {
  background: white;
}

.after_right {
  width: 0;
  height: 0;
  border: 5px solid;
  border-color: transparent transparent transparent white;
  margin-top: 25px;
}

.action {
  width: 100%;
  height: 100px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
}

.icon_box {
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 10px;
}

#record_btn {
  display: flex;
  height: 45px;
  justify-content: center;
  align-items: center;
  margin: 0 5px;
  border-radius: 5px;
}

.loading_shadow {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.3);
  position: fixed;
  top: calc(50vh - 50px);
  left: calc(50vw - 50px);
  z-index: 2000;
}

.emoji_box:hover {
  background: #999999;
}
</style>