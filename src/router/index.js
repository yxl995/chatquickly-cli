import {createRouter, createWebHashHistory} from 'vue-router'
import Login from '../views/Login.vue'

const routes = [{
    path: '/',
    name: 'Login',
    component: Login
}, {
    path: '/chat:id',
    name: 'Chat',
    component: () => import('../views/Chat.vue')
}, {
    path: '/chatList',
    name: 'ChatList',
    component: () => import('../views/ChatList.vue')
}, {
    path: '/phone',
    name: 'Phone',
    component: () => import('../views/Phone.vue')
}, {
    path: '/video',
    name: 'Video',
    component: () => import('../views/Video.vue')
}]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
