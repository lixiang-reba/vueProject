import Vue from "vue";
import axios from "axios";
import App from "./App.vue";
import router from "./router";
import "./assets/css/global.css";
import "./plugins/element.js";
Vue.config.productionTip = false;
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
Vue.prototype.$http = axios;
// 利用请求拦截器在请求头中使用 `Authorization` 字段提供 `token` 令牌
axios.interceptors.request.use((config) => {
  config.headers.Authorization = sessionStorage.getItem("token");
  // console.log(config.headers);
  return config;
});
new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
