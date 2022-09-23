<template>
    <!-- 主页容器 -->
    <el-container class="home-container">
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <h3>电商后台管理系统</h3>
            </div>
            <el-button type="info" @click="logOut">退出登录</el-button>
        </el-header>
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse ? '64px' :' 200px'">
                <!-- 折叠收起菜单按钮 -->
                <el-button type="info" class="toggle-button" @click="toggleCollapse">|||</el-button>
                <!-- 侧边菜单 -->
                <el-menu :default-active="activePath" class="el-menu-vertical-demo" background-color="#545c64"
                    text-color="#fff" active-text-color="#ffd04b" unique-opened :collapse="isCollapse"
                    :collapse-transition="false" router>
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.path" v-for="(item,index) in MenuList" :key="item.id">
                        <template slot="title">
                            <!-- 图标 -->
                            <i class="el-icon-location"></i>
                            <!-- 标题 -->
                            <span>{{item.authName}}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="child.path" v-for="(child,index) in item.children" :key="child.id"
                            @click="saveAcitveIndex(child.path)">
                            <template slot="title">
                                <i class="el-icon-location"></i>
                                <span>{{child.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!--主体 -->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    created() {
        this.activePath = sessionStorage.getItem('activePath'),
            this.getMenuList()
    },
    data() {
        return {
            // 菜单列表数据
            MenuList: {},
            // 是否水平折叠收起菜单
            isCollapse: false,
            // 当前激活菜单的 index
            activePath: '',
        }
    },
    methods: {
        // 监听退出登录按钮
        logOut() {
            sessionStorage.clear()
            this.$router.push('/login')
        },
        // 获取左侧菜单列表数据
        async getMenuList() {
            const { data: res } = await this.$http.get('menus')
            if (res.meta.status !== 200) {
                return this.$message.error('获取菜单列表数据失败')
            }
            this.MenuList = res.data
            // console.log(this.MenuList);
        },
        // 是否水平折叠收起菜单
        toggleCollapse() {
            this.isCollapse = !this.isCollapse
        },
        // 保存当前激活菜单的 index
        saveAcitveIndex(path) {
            sessionStorage.setItem('activePath', path)
            this.activePath = path
        }
    },
}
</script>

<style scoped>
.home-container {
    height: 100%;
}

.el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #434a50;
    padding: 0;
    color: #fff;
}

.el-header>div {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.el-header>div>h3 {
    margin-left: 15px;
}

.el-aside {
    background-color: #434a50;
    color: #fff;
}

.toggle-button {
    width: 100%;
    letter-spacing: 5px;
}

.el-menu {
    border-right: 0;
}

.el-main {
    background-color: #E9EEF3;
}
</style>

