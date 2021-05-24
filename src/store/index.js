import {createStore} from 'vuex'

export default createStore({
    state: {
        socket: require('../socket/index')('https://chatquickly.cn:8090'),
        userList: {},
        username: '',
        tempUserList: {},
        AppID: 2617846436,
        AppSign: '0xcb,0x76,0xbe,0x5a,0xb9,0x03,0x0a,0x42,0xb7,0x9e,0x35,0x91,0xd2,0xdb,0x51,0xbc,0xab,0xae,0x33,0xaf,0x62,0xcf,0xa5,0xb5,0x92,0x8a,0x16,0x7e,0x1c,0x48,0xd9,0x75',
        server: 'wss://webliveroom-test.zego.im/ws'
    },
    mutations: {
        closeSocket(state) {
            state.socket.close()
        },
        setUsername(state, data) {
            state.username = data
        },
        setUserList(state, data) {
            state.userList = data
        },
        addUser(state, data) {
            state.userList[data.username] = {
                id: data.id,
                record: {
                    notRead: 0,
                    list: []
                }
            }
        },
        removeUser(state, data) {
            delete state.userList[data]
        },
        receiveMsg(state, data) {
            switch (data.type) {
                case 'text': {
                    state.userList[data.from].record.list.push({
                        content: data.msg,
                        isSelf: false,
                        time: new Date().toTimeString().split(' ')[0],
                        type: data.type
                    })
                    state.userList[data.from].record.notRead++
                    break
                }
                default: {
                    if (data.msg === 'start') {
                        if (!Object.hasOwnProperty.call(state.tempUserList, data.from))
                            state.tempUserList[data.from] = {}
                        if (!Object.hasOwnProperty.call(state.tempUserList[data.from], data.type))
                            state.tempUserList[data.from][data.type] = {}

                        state.tempUserList[data.from][data.type][data.filename] = {
                            content: '',
                            size: data.size
                        }
                    } else if (data.msg === 'end') {
                        state.userList[data.from].record.list.push({
                            content: state.tempUserList[data.from][data.type][data.filename].content,
                            filename: data.filename,
                            size: state.tempUserList[data.from][data.type][data.filename].size,
                            isSelf: false,
                            time: new Date().toTimeString().split(' ')[0],
                            type: data.type
                        })
                        state.userList[data.from].record.notRead++
                        delete state.tempUserList[data.from][data.type][data.filename]
                    } else state.tempUserList[data.from][data.type][data.filename].content += data.msg
                    break
                }
            }
        },
        sendMsg(state, data) {
            state.userList[data.to].record.list.push(data.record)
        },
        isRead(state, data) {
            state.userList[data].record.notRead = 0
        }
    }
})
