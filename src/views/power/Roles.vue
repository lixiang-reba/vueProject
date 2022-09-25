<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 添加角色区 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addRoledialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表区 -->
            <el-table :data="rolesList" stripe style="width: 100%" border>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template v-slot="scope">
                        <!-- 角色权限区 -->
                        <el-row v-for="(primary,index) in scope.row.children" :key="primary.id"
                            :class="['bd-bottom',index == 0 ?' bd-top' : '','vcenter']">
                            <!-- 一级权限 -->
                            <el-col :span="6">
                                <el-tag>
                                    {{primary.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="18">
                                <el-row v-for="(second,index) in primary.children" :key="second.id"
                                    :class="[index == 0 ?' bd-bottom' : '','vcenter']">
                                    <!-- 二级权限 -->
                                    <el-col :span="6">
                                        <el-tag type="success">
                                            {{second.authName}}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 三级权限 -->
                                    <el-col :span="18">
                                        <el-tag v-for="(third,index) in second.children" :key="third.id" closable
                                            type="warning" @close="removeRight(scope.row,third.id)">
                                            {{third.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template v-slot="scope">
                        <!-- 编辑 -->
                        <el-button size="mini" type="primary" icon="el-icon-edit"
                            @click="editRoledialogOpened(scope.row.id)">编辑
                        </el-button>
                        <!-- 删除 -->
                        <el-button size="mini" type="danger" icon="el-icon-delete"
                            @click="deleteRoleDialogOpened(scope.row.id)">删除
                        </el-button>
                        <!-- 分配权限 -->
                        <el-button size="mini" type="warning" icon="el-icon-setting"
                            @click="showSetRightDialog(scope.row)">分配权限
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 添加角色对话框 -->
        <el-dialog title="添加角色" :visible.sync="addRoledialogVisible" width="50%" @close="addDialogClosed">
            <!-- 角色信息区 -->
            <el-form ref="addFormRef" :model="addRoleForm" label-width="80px" :rules="addFormRules">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addRoledialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑角色对话框 -->
        <el-dialog title="编辑角色" :visible.sync="editRoledialogVisible" width="50%" @close="editDialogClosed">
            <!-- 角色信息区 -->
            <el-form ref="editFormRef" :model="editRoleForm" label-width="80px" :rules="editFormRules">
                <el-form-item label="角色名称">
                    <el-input v-model="editRoleForm.roleName" disabled></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="email">
                    <el-input v-model="editRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editRoledialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRole">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配权限对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <el-tree ref="setRightRef" :data="setRightTree" :props="setRightProps" show-checkbox default-expand-all
                node-key="id" :default-checked-keys="defKeys">
            </el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="setRight">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    created() {
        this.getRolesList()
    },
    data() {
        return {
            // 角色列表 
            rolesList: [],
            // 是否显示 addDialog
            addRoledialogVisible: false,
            // 添加角色表单数据对象
            addRoleForm: {},
            // 添加角色信息预验证
            addFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' },
                ],
            },
            total: 0,
            // 是否显示 editDialog
            editRoledialogVisible: false,
            // 编辑角色表单数据对象
            editRoleForm: {},
            // 编辑角色信息预验证
            editFormRules: {
                RoleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' },
                ],
            },
            // 是否展示setRightDialog
            setRightDialogVisible: false,
            // 分配权限树形列表
            setRightTree: [],
            // 分配权限树形列表配置
            setRightProps: {
                children: 'children',
                label: 'authName'
            },
            // 分配权限对话框默认选中的id
            defKeys: [],
            // 当前角色id
            roleId: ''
        }
    },
    methods: {
        // 获取所有权限列表
        async getRolesList() {
            const { data: res } = await this.$http.get("roles")
            if (res.meta.status !== 200) {
                return this.$message.error('获取菜单列表数据失败')
            }
            this.rolesList = res.data
        },
        // 监听添加角色对话框关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        // 监听确认添加角色按钮事件
        addRole() {
            this.$refs.addFormRef.validate(async (valid) => {
                // 对整个表单进行校验
                if (!valid) {
                    return
                }
                // 发请求跳转页面
                const { data: res } = await this.$http.post('roles', this.addRoleForm)
                console.log(this.addRoleForm);
                if (res.meta.status != 201) {
                    return this.$message.error('添加角色失败');
                }
                this.$message.success('添加角色成功');
                this.addRoledialogVisible = false
                this.getRolesList()
            })
        },
        // 监听编辑角色对话框打开事件
        async editRoledialogOpened(id) {
            this.editRoledialogVisible = true
            // 根据 ID 查询角色信息
            const { data: res } = await this.$http.get(`roles/${id}`)
            if (res.meta.status !== 200) {
                return this.$message.error('获取角色信息失败')
            }
            this.editRoleForm = res.data
        },
        // 监听编辑角色对话框关闭事件
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        // 监听确认编辑角色按钮事件
        editRole(id) {
            this.$refs.editFormRef.validate(async (valid) => {
                // 对整个表单进行校验
                if (!valid) {
                    return
                }
                // 发请求跳转页面
                const { data: res } = await this.$http.put(`roles/${this.editRoleForm.roleId}`, this.editRoleForm)
                if (res.meta.status != 200) {
                    return this.$message.error('编辑角色失败');
                }
                this.$message.success('编辑角色成功');
                this.editRoledialogVisible = false
                this.getRolesList()
            })
        },
        // 展示删除角色弹窗
        async deleteRoleDialogOpened(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(error => error)
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            const { data: res } = await this.$http.delete(`roles/${id}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除失败')
            }
            this.$message.success('删除成功')
            this.getRolesList()
        },
        // 删除角色指定权限
        async removeRight(role, rightId) {
            const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除权限失败')
            }
            this.$message.success('删除权限成功')
            role.children = res.data
        },
        // 展示分配权限对话框
        async showSetRightDialog(node) {
            this.roleId = node.id
            this.setRightDialogVisible = true
            const { data: res } = await this.$http.get('rights/tree')
            if (res.meta.status !== 200) {
                return this.$message.error('获取权限列表数据失败')
            }
            this.setRightTree = res.data
            this.getDefKeys(node)
        },
        // 获取角色下所有三级权限的id
        getDefKeys(node) {
            if (!node.children) {
                return this.defKeys.push(node.id)
            }
            node.children.forEach(right => {
                this.getDefKeys(right)
            });
        },
        // 监听分配权限对话框关闭事件
        setRightDialogClosed() {
            this.defKeys = []
        },
        // 角色授权
        async setRight() {
            const keys = [
                ...this.$refs.setRightRef.getCheckedKeys(),
                ...this.$refs.setRightRef.getHalfCheckedKeys()
            ]
            const idStr = keys.join(',')
            const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
            if (res.meta.status !== 200) {
                return this.$message.error('角色授权失败')
            }
            this.setRightDialogVisible = false
            this.getRolesList()
            console.log(res.data);
        }
    },
}
</script>
<style scoped>
.el-tag {
    margin: 7px;
}

.bd-top {
    border-top: 1px solid #eee;
}

.bd-bottom {
    border-bottom: 1px solid #eee;
}

.vcenter {
    display: flex;
    align-items: center;
}
</style>
