import Vue from 'vue'
import Vuex from 'vuex'
import auth from './auth'
import user from './user'
import role from './role'
import userIndex from './user_index'
import api from './api'
import layoutContent from './layout_content'
import ui from './ui'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    auth,
    layoutContent,
    ui,
    role,
    user,
    userIndex,
    api
  }
})
