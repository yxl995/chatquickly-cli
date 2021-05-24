<template>
  <div>
    <Head>
      <template #content>
        <span style="font-weight: bold;">聊天列表
          <span v-if="Object.keys(userList).length!=0">
          ({{ Object.keys(userList).length }})
          </span>
        </span>
      </template>
      <template #back>
        <div></div>
      </template>
    </Head>

    <div v-if="userArray.length!=0" style="padding-top: 50px">
      <Record v-for="item in userArray" :key="item.name" :item="item" @click="chat(item.name)"/>
    </div>

    <van-empty style="padding-top: 150px" image="https://img.yzcdn.cn/vant/custom-empty-image.png"
               description="聊天室里暂时没人哦" v-else/>

  </div>
</template>

<script>
import store from '../store/index'
import Head from "../components/Head";
import Record from "../components/Record";

const {socket, username} = store.state
export default {
  name: "ChatList",
  components: {
    Head,
    Record
  },
  mounted() {
    this.username = username
    socket.on('getUserList', data => {
      delete data[this.username]
      for (let key in data)
        data[key]['record'] = {
          notRead: 0,
          list: []
        }
      store.commit('setUserList', data)
      this.userList = data
      this.order()
    })
    socket.emit('getUserList')
    socket.on('userEnter', data => {
      if (data.username != this.username) {
        this.$toast(`用户${data.username}进入聊天室`)
        store.commit('addUser', data)
        this.userList[data.username] = {
          id: data.id,
          record: {
            notRead: 0,
            list: []
          }
        }
        this.order()
      }
    })
    socket.on('userQuit', data => {
      if (this.$route.name === 'Chat' && this.$route.params.id === data)
        this.$router.replace('/chatList')
      this.$toast(`用户${data}退出聊天室`)
      store.commit('removeUser', data)
      delete this.userList[data]
      this.order()
    })
    socket.on('sendMsg', data => {
      store.commit('receiveMsg', data)
      if (this.$route.name === 'Chat' && this.$route.params.id === data.from)
        store.commit('isRead', data.from)
      setTimeout(this.order, 500)
    })
    socket.on('call', data => {
      if (this.$route.name == 'Phone' || this.$route.name == 'Video')
        socket.emit('dialOut', data.from)
      else
        this.$router.push({
          name: data.type == 'audio' ? 'Phone' : 'Video',
          params: {username, to: data.from, isCall: 0, streamID: data.streamID}
        })
    })
  },
  data() {
    return {
      username: '',
      userList: {},
      userArray: []
    }
  },
  methods: {
    chat(key) {
      this.$router.push({name: 'Chat', params: {id: key}})
    },
    order() {
      let userArray = []
      for (let key in this.userList) {
        userArray = [...userArray, {name: key, item: {...this.userList[key]}}]
      }
      userArray.sort((u1, u2) => {
        if (u1.item.record.list.length === 0 && u2.item.record.list.length === 0) return 0
        else if (u2.item.record.list.length === 0) return -1
        else if (u1.item.record.list.length === 0) return 1
        else return u2.item.record.list[u2.item.record.list.length - 1].time > u1.item.record.list[u1.item.record.list.length - 1].time ? 1 : -1
      })
      this.userArray = [...userArray]
    }
  }
}
</script>