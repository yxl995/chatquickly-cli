<template>
  <div style="display: flex;flex-direction: column;align-items: center;width: 100%;height: 100vh;background: #eeeeee">
    <div style="display: flex;flex-direction: column;align-items: center;margin-top: 100px">
      <img src="../assets/logo.png" alt="logo" style="width:100px;height: 100px">
      <span style="font-size: 20px;font-weight: bold;color: #111111;margin-top: 20px">快聊</span>
    </div>
    <div style="display: flex;flex-direction: column;align-items: center;width: 100%;margin-top: 50px">
      <van-field v-model="username" placeholder="请输入聊天昵称" style="width: 70%;border-radius: 10px;margin: 10px 0"
                 @keyup.enter="login" input-align="center" :disabled="isLogin"/>
      <van-button style="width: 70%;border-radius: 10px;margin: 10px 0"
                  type="primary" @click="login" :loading="isLogin" color="#111111">进入聊天室
      </van-button>
    </div>
    <div class="footer">
      <span>Chat Quickly©2021 created by You Xi Long</span>
      <div style="display: flex;align-items: center">
        <img src="../assets/ICP_logo.png" alt="ICP_logo">
        <a style="text-decoration: underline;color: #999999" href="https://beian.miit.gov.cn" target="_blank">粤ICP备2021065603号</a>
      </div>
    </div>
  </div>
</template>

<script>
import store from '../store/index'

const socket = store.state.socket
export default {
  name: 'Login',
  data() {
    return {
      username: '',
      isLogin: false
    }
  },
  mounted() {
    socket.on('usernameRepeat', flag => {
      if (!flag) {
        store.commit('setUsername', this.username)
        this.$router.replace('/chatList')
      } else {
        this.$toast.fail('昵称重复,请重新输入')
        this.username = ''
      }
      this.isLogin = false
    })
  },
  methods: {
    login() {
      this.username = this.username.trim()
      this.isLogin = true
      if (this.username == '') {
        this.$toast.fail('昵称不能为空')
        this.isLogin = false
      } else socket.emit('login', this.username)
    }
  }
}
</script>
<style scoped>
.footer {
  width: 100vw;
  height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  bottom: 0;
  font-size: 12px;
}
</style>
