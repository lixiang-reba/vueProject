<template>
    <div class="login-container">
        <!-- 登录盒子 -->
        <div class="login-box">
            <!-- logo -->
            <div class="login-logo">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登陆表单 -->
            <el-form class="login_form" :model="loginForm" :rules="loginFormRules" ref="loginFormRef" border>
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username">
                        <i slot="prefix" class="el-input__icon el-icon-lock"></i>
                    </el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password">
                        <i slot="prefix" class="el-input__icon el-icon-user-solid"></i>
                    </el-input>
                </el-form-item>
                <!-- 登录/重置按钮 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 登陆表单数据
            loginForm: {
                username: 'admin',
                password: '123456'
            },
            // 登陆表单验证规则
            loginFormRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                ],
            },
        }
    },
    methods: {
        // 监听登录按钮
        login() {
            this.$refs.loginFormRef.validate(async (valid) => {
                // 对整个表单进行校验
                if (!valid) {
                    return
                }
                // 发请求跳转页面
                const { data: res } = await this.$http.post('login', this.loginForm)
                if (res.meta.status != 200) {
                    this.$message.error('用户名或密码不正确');
                }
                // 将登陆成功后的token保存到sessionStorage中
                sessionStorage.setItem('token', res.data.token)
                // 登录成功，跳转到主页
                this.$router.push('/home')
            })
        },
        // 监听重置按钮
        resetForm() {
            this.$refs.loginFormRef.resetFields()
        }
    },
}
</script>

<style scoped>
.login-container {
    background-color: #1b89cd;
    height: 100%;
}

.login-box {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 400px;
    background-color: #fff;
}

.login-logo {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translate(-50%, -50%);
    overflow: hidden;
    width: 600px;
    width: 200px;
    height: 200px;
    padding: 10px;
    background-color: whitesmoke;
    border-radius: 50%;
    box-shadow: 0px 0px 3px 3px rgb(0 0 0 / 20%)
}

.login-logo img {
    background: grey;
    border-radius: 50%;
}

.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
}

.btns {
    display: flex;
    justify-content: flex-end;
}
</style>