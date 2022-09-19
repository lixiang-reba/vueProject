<template>
    <div>
        <el-button type="info" @click="logOut">退出登录</el-button>
    </div>
</template>

<script>
export default {
    data() {
        return {

        }
    },
    methods: {
        // 监听退出登录按钮
        logOut() {
            sessionStorage.clear()
            this.$router.push('/login')
        }
    },
}
</script>

<style>

</style>