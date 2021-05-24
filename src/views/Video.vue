<template>
  <div class="panel" :style="{background:$route.params.isCall==1||isConnected?'rgba(1, 1, 1, 0)':'rgba(1, 1, 1, 0.8)'}">
    <div style="font-size: 30px;font-weight: bold;color: #dddddd;top: 150px;position: absolute;"
         v-if="$route.params.isCall==0&&!isConnected">
      {{ $route.params.to }}
    </div>
    <div v-if="$route.params.isCall==1||isConnected"
         style="display: flex;flex-direction: column;align-items: center;position: absolute;bottom: 0;padding-bottom: 50px">
      <div style="color: #dddddd;font-size: 18px;margin-bottom: 20px">
        <span v-if="isConnected"><span v-if="minute<10">0</span>{{ minute }}:<span v-if="second<10">0</span>{{
            second
          }}</span>
        <span v-else>{{ dialingText }}</span>
      </div>
      <div style="display: flex">
        <div class="btn" style="background: white;color: #111111" v-if="isConnected" @click="mute">
          <img v-if="muted" src="../assets/muted.png" alt="muted" style="width: 70%;height: 70%">
          <img v-else src="../assets/unmuted.png" alt="unmuted" style="width: 70%;height: 70%">
        </div>
        <div class="btn" style="background: orangered" @click="dialOut">
          <img src="../assets/dialOut.png" alt="reject" style="width: 70%;height: 70%">
        </div>
      </div>
    </div>
    <div v-else style="display: flex;position: absolute;bottom: 0;padding-bottom: 50px">
      <div class="btn" style="background: #dddddd" @click="()=>response(false)">
        <img src="../assets/reject.png" alt="reject" style="width: 70%;height: 70%">
      </div>
      <div class="btn" style="background: limegreen" @click="()=>response(true)">
        <img src="../assets/accept.png" alt="accept" style="width: 70%;height: 70%">
      </div>
    </div>
    <video :class="{fill:!isConnected,scale:isConnected}" :srcObject="localStream" v-if="localRendered" muted
           autoplay></video>
    <video class="fill" :srcObject="remoteStream" v-if="remoteRendered" autoplay></video>
  </div>
</template>

<script>
import {ZegoExpressEngine} from 'zego-express-engine-webrtc'
import {request} from "../network/request";
import store from '../store/index'

const {AppID, AppSign, server, socket} = store.state
const engine = new ZegoExpressEngine(AppID, server)
let userName
let room
let roomID
let dialingID = null
let timeID = null

export default {
  name: "Video",
  deactivated() {
    this.localStream = null
    this.localRendered = false
    this.muted = false
    this.remoteStream = null
    this.remoteRendered = false
    this.minute = 0
    this.second = 0
    this.isConnected = false
    this.dialingText = '拨号中'
  },
  activated() {
    const {username, to, isCall} = this.$route.params
    userName = Buffer.from(username).toString('base64')
    room = isCall == 1 ? username + to : to + username
    roomID = Buffer.from(room).toString('base64')
    if (isCall == 1) {
      dialingID = setInterval(() => {
        this.dialingText += '.'
        if (this.dialingText.length == 7)
          this.dialingText = this.dialingText.substr(0, 3)
      }, 300)
    }

    request({
      url: '/api/token',
      params: {
        appId: AppID,
        appSign: AppSign,
        userID: userName,
        minute: 1
      }
    }).then(async res => {
      return await engine.loginRoom(roomID, res.data.data, {
        userID: userName,
        userName: userName
      })
    }).then(async flag => {
      if (flag && isCall == 1) {
        this.localStream = await engine.createStream({
          camera: {video: true, audio: true},
        })
        engine.startPublishingStream(userName, this.localStream)
        this.localRendered = true
        socket.on('responsePhone', async data => {
          window.clearInterval(dialingID)
          this.dialingText = '拨号中'
          dialingID = null
          if (data.flag) {
            timeID = setInterval(() => {
              this.second++
              if (this.second == 60) {
                this.second = 0
                this.minute++
              }
            }, 1000)
            this.remoteStream = await engine.startPlayingStream(data.streamID)
            this.remoteRendered = true
            this.isConnected = true
          } else {
            this.$toast.fail('对方拒接或通话中')
            this.localRendered = false
            this.remoteRendered = false
            if (userName)
              engine.stopPublishingStream(userName)
            if (this.localStream) {
              engine.destroyStream(this.localStream)
              this.localStream = null
            }
            if (roomID)
              engine.logoutRoom(roomID)
            this.isConnected = false
            this.$router.back()
          }
        })
        socket.emit('call', {to, from: username, streamID: userName, type: 'video'})
      } else if (!flag) {
        this.$toast.fail('进入通话失败')
        this.$router.back()
      }
    }).catch(() => {
      this.$toast.fail('进入通话失败')
      this.$router.back()
    })
    socket.on('dialOut', () => {
      this.localRendered = false
      this.remoteRendered = false
      if (this.isConnected) {
        if (this.remoteStream) {
          engine.stopPlayingStream(Buffer.from(to).toString('base64'))
          engine.destroyStream(this.remoteStream)
          this.remoteStream = null
        }
        if (userName)
          engine.stopPublishingStream(userName)
        if (this.localStream) {
          engine.destroyStream(this.localStream)
          this.localStream = null
        }
      }
      if (roomID)
        engine.logoutRoom(roomID)
      this.isConnected = false
      this.$router.back()
    })
  },
  data() {
    return {
      localStream: null,
      localRendered: false,
      muted: false,
      remoteStream: null,
      remoteRendered: false,
      minute: 0,
      second: 0,
      isConnected: false,
      dialingText: '拨号中'
    }
  },
  methods: {
    async response(flag) {
      if (flag) {
        timeID = setInterval(() => {
          this.second++
          if (this.second == 60) {
            this.second = 0
            this.minute++
          }
        }, 1000)
        this.isConnected = true
        this.localStream = await engine.createStream({
          camera: {video: true, audio: true},
        })
        engine.startPublishingStream(userName, this.localStream)
        socket.emit('responsePhone', {connect: flag, to: this.$route.params.to, streamID: userName})
        this.remoteStream = await engine.startPlayingStream(this.$route.params.streamID)
        this.localRendered = true
        this.remoteRendered = true
      } else {
        socket.emit('responsePhone', {connect: flag, to: this.$route.params.to})
        if (roomID)
          engine.logoutRoom(roomID)
        this.$router.back()
      }
    },
    dialOut() {
      if (dialingID) {
        window.clearInterval(dialingID)
        dialingID = null
        this.dialingText = '拨号中'
      }
      if (timeID) {
        window.clearInterval(timeID)
        timeID = null
        this.second = 0
        this.minute = 0
      }
      socket.emit('dialOut', this.$route.params.to)
      this.localRendered = false
      this.remoteRendered = false
      if (this.isConnected && this.remoteStream) {
        engine.stopPlayingStream(Buffer.from(this.$route.params.to).toString('base64'))
        engine.destroyStream(this.remoteStream)
        this.remoteStream = null
      }
      if (userName)
        engine.stopPublishingStream(userName)
      if (this.localStream) {
        engine.destroyStream(this.localStream)
        this.localStream = null
      }
      if (roomID)
        engine.logoutRoom(roomID)
      this.isConnected = false
      this.$router.back()
    },
    mute() {
      this.muted = !this.muted
      engine.mutePublishStreamAudio(this.localStream, this.muted)
    }
  }
}
</script>

<style scoped>
.panel {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  margin: 0 30px;
}

.fill {
  width: 100%;
  height: 100%;
  object-fit: fill;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -2;
}

.scale {
  position: absolute;
  width: 30%;
  height: 20%;
  object-fit: fill;
  top: 0;
  right: 0;
  z-index: -1;
}
</style>