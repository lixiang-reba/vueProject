<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 搜索添加区 -->
            <el-row :gutter="20">
                <el-col :span="6">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable
                        @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList">
                        </el-button>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表区 -->
            <el-table :data="userList" stripe style="width: 100%" border>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column label="状态">
                    <!-- 作用域插槽获取开关状态 -->
                    <template v-slot="scope">
                        <el-switch v-model="scope.row.mg_state" @change="changeState(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
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
                        <!-- 分配角色 -->
                        <el-tooltip class="item" effect="dark" content="分配角色" placement="top">
                            <el-button type="warning" icon="el-icon-setting" circle
                                @click="showAllotRoleDialog(scope.row)">
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="this.queryInfo.pagenum" :page-sizes="[1, 2, 4]" :page-size="this.queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加用户对话框 -->
        <el-dialog title="添加用户" :visible.sync="addUserDialogVisible" width="50%" @close="addDialogClosed">
            <!-- 用户信息区 -->
            <el-form ref="addFormRef" :model="addUserForm" label-width="80px" :rules="addFormRules">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addUserForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addUserForm.password" type="password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addUserForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addUserForm.mobile" type="number"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addUserDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑用户对话框 -->
        <el-dialog title="编辑用户" :visible.sync="editUserDialogVisible" width="50%" @close="editDialogClosed">
            <!-- 用户信息区 -->
            <el-form ref="editFormRef" :model="editUserForm" label-width="80px" :rules="editFormRules">
                <el-form-item label="用户名">
                    <el-input v-model="editUserForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editUserForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editUserForm.mobile" type="number"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editUserDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配角色对话框 -->
        <el-dialog title="分配角色" :visible.sync="allotRoleDialogVisible" width="50%" @close="allotRoleDialogClosed">
            <!-- 用户信息区 -->
            <el-form>
                <el-form-item label="当前的用户：">
                    {{this.userInfo.username}}
                </el-form-item>
                <el-form-item label="当前的角色：">
                    {{this.userInfo.role_name}}
                </el-form-item>
                <el-form-item label="分配新角色：">
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                        <el-option v-for="role in rolesOptions" :key="role.id" :label="role.roleName" :value="role.id">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <!-- 确认/取消区 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="allotRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRole">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    created() {
        this.getUserList()
    },
    data() {
        return {
            // 用户列表
            userList: [],
            // 分页信息
            queryInfo: { pagenum: 1, pagesize: 4, query: '' },
            // 总条目数
            total: 0,
            // 是否显示 addDialog
            addUserDialogVisible: false,
            // 添加用户表单数据对象
            addUserForm: {},
            // 添加用户信息预验证
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
            // 编辑用户表单数据对象
            editUserForm: {},
            // 编辑用户信息预验证
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
            // 当前被分配角色的用户信息
            userInfo: {},
            // 分配角色对话框选择器绑定的id
            selectedRoleId: '',
            // 分配新角色配置项
            rolesOptions: []
        }
    },
    methods: {
        // 获取用户数据列表
        async getUserList() {
            const { data: res } = await this.$http.get('users', { params: this.queryInfo })
            if (res.meta.status !== 200) {
                return this.$message.error('获取用户列表数据失败')
            }
            this.userList = res.data.users
            this.total = res.data.total
        },
        // 监听改变状态事件
        async changeState(row) {
            const { data: res } = await this.$http.put(`users/${row.id}/state/${row.mg_state}`)
            if (res.meta.status !== 200) {
                row.mg_state = !row.mg_state
                return this.$message.error('更新用户状态失败')
            }
            return this.$message.success('更新用户状态成功')
        },
        // pageSize 改变时会触发
        handleSizeChange(val) {
            this.queryInfo.pagesize = val
            this.getUserList()
        },
        // currentPage 改变时会触发
        handleCurrentChange(val) {
            this.queryInfo.pagenum = val
            this.getUserList()
        },
        // 监听添加用户对话框关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        // 监听确认添加用户按钮事件
        addUser() {
            this.$refs.addFormRef.validate(async (valid) => {
                // 对整个表单进行校验
                if (!valid) {
                    return
                }
                // 发请求跳转页面
                const { data: res } = await this.$http.post('users', this.addUserForm)
                if (res.meta.status != 201) {
                    return this.$message.error('添加用户失败');
                }
                this.$message.success('添加用户成功');
                this.addUserDialogVisible = false
                this.getUserList()
            })
        },
        // 监听编辑用户对话框打开事件
        async editUserdialogOpened(id) {
            this.editUserDialogVisible = true
            // 根据 ID 查询用户信息
            const { data: res } = await this.$http.get(`users/${id}`)
            if (res.meta.status !== 200) {
                return this.$message.error('获取用户信息失败')
            }
            this.editUserForm = res.data
        },
        // 监听编辑用户对话框关闭事件
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        // 监听确认编辑用户按钮事件
        editUser() {
            this.$refs.editFormRef.validate(async (valid) => {
                // 对整个表单进行校验
                if (!valid) {
                    return
                }
                // 发请求跳转页面
                const { data: res } = await this.$http.put(`users/${this.editUserForm.id}`, this.editUserForm)
                if (res.meta.status != 200) {
                    return this.$message.error('编辑用户失败');
                }
                this.$message.success('编辑用户成功');
                this.editUserDialogVisible = false
                this.getUserList()
            })
        },
        // 展示删除用户弹窗
        async deleteUserDialogOpened(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(error => error)
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            const { data: res } = await this.$http.delete(`users/${id}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除失败')
            }
            this.$message.success('删除成功')
            this.getUserList()
        },
        // 展示分配角色对话框
        async showAllotRoleDialog(userInfo) {
            this.allotRoleDialogVisible = true
            this.userInfo = userInfo
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) {
                return this.$message.error('获取角色列表数据失败')
            }
            this.rolesOptions = res.data
        },
        // 确认分配角色
        async allotRole() {
            if (!this.selectedRoleId) {
                return this.$message.error('请选择要分配的角色！')
            }
            const { data: res } = await this.$http.put(
                `users/${this.userInfo.id}/role`,
                {
                    rid: this.selectedRoleId
                }
            )
            if (res.meta.status !== 200) {
                return this.$message.error('更新角色失败！')
            }
            this.$message.success('更新角色成功！')
            this.getUserList()
            this.allotRoleDialogVisible = false
        },
        allotRoleDialogClosed() {
            this.selectedRoleId = ''
        },
    },
}
</script>

