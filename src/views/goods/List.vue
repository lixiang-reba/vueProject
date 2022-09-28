<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 搜索添加区 -->
            <el-row :gutter="20">
                <el-col :span="6">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable
                        @clear="getItemList">
                        <el-button slot="append" icon="el-icon-search" @click="getItemList">
                        </el-button>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- 商品列表区 -->
            <el-table :data="itemList" stripe style="width: 100%" border>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称"></el-table-column>
                <el-table-column prop="goods_price" label="商品价格"></el-table-column>
                <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
                <el-table-column prop="add_time" label="创建时间"></el-table-column>
                <el-table-column label="操作">
                    <template v-slot="scope">
                        <!-- 编辑 -->
                        <el-button type="primary" icon="el-icon-edit" circle
                            @click="editUserdialogOpened(scope.row.id)">
                        </el-button>
                        <!-- 删除 -->
                        <el-button type="danger" icon="el-icon-delete" circle
                            @click="deleteUserDialogOpened(scope.row.id)">
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="this.queryInfo.pagenum" :page-sizes="[50, 200, 300]" :page-size="this.queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
    created() {
        this.getItemList()
    },
    data() {
        return {
            // 商品列表
            itemList: [],
            // 分页信息
            queryInfo: { pagenum: 1, pagesize: 50, query: '' },
            // 总条目数
            total: 0,
            // 是否显示 addDialog
            addUserDialogVisible: false,
            // 添加商品表单数据对象
            addUserForm: {},
            // 添加商品信息预验证
            addFormRules: {
                username: [
                    { required: true, message: '请输入姓名', trigger: 'blur' },
                    { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在6 到 15 个字符', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在6 到 15 个字符', trigger: 'blur' },
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { min: 1, max: 11, message: '长度在11个字符', trigger: 'blur' },
                ],

            },
            total: 0,
            // 是否显示 editDialog
            editUserDialogVisible: false,
            // 编辑商品表单数据对象
            editUserForm: {},
            // 编辑商品信息预验证
            editFormRules: {
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在6 到 15 个字符', trigger: 'blur' },
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { min: 1, max: 11, message: '长度在11个字符', trigger: 'blur' },
                ],

            },
            // 分配角色对话框是否可见
            allotRoleDialogVisible: false,
            // 当前被分配角色的商品信息
            userInfo: {},
            // 分配角色对话框选择器绑定的id
            selectedRoleId: '',
            // 分配新角色配置项
            rolesOptions: []
        }
    },
    methods: {
        // 获取商品数据列表
        async getItemList() {
            const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品列表数据失败')
            }
            this.itemList = res.data.goods
            this.total = res.data.total
        },
        // pageSize 改变时会触发
        handleSizeChange(val) {
            this.queryInfo.pagesize = val
            this.getItemList()
        },
        // currentPage 改变时会触发
        handleCurrentChange(val) {
            this.queryInfo.pagenum = val
            this.getItemList()
        },
        // 跳转至添加商品页面
        goAddPage() {
            this.$router.push('/goods/add')
        }

    },
}
</script>