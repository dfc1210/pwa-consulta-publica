// Vue composition API helpers
const { createApp, computed, onMounted, provide, inject, watch, reactive, ref, toRefs } = Vue;

const StoragePlugin = {
  install(Vue) {
    Vue.prototype.$storage = {
      set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
      },
      get(key) {
        try {
          return JSON.parse(localStorage.getItem(key));
        } catch (e) {
          return localStorage.getItem(key);
        }
      },
      remove(key) {
        localStorage.removeItem(key);
      }
    };
  }
};

const globalutils = {
    install(app, options) {
        app.provide('viewContext', viewContext);
    }
}
window.StoragePlugin = StoragePlugin;
window.globalutils = globalutils;