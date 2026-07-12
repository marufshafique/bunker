import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import FolderView from '@/views/FolderView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/folder/:id',
      name: 'folder',
      component: FolderView,
      props: true,
    },
  ],
})

export default router
