<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 添加分类区 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 分类列表区 -->
            <el-table :data="cateList" style="width: 100%" border>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="cat_name" label="分类名称">
                    <template v-slot="scope">
                        <el-tree :data="[scope.row]" :props="cateTreeProps"></el-tree>
                    </template>
                </el-table-column>
                <el-table-column label="是否有效">
                    <template v-slot="scope">
                        <i class="el-icon-success" style="color:green" v-if="scope.row.cat_deleted === false"></i>
                        <i class="el-icon-error" v-else style="color:red"></i>
                    </template>
                </el-table-column>
                <el-table-column label="排序">
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                        <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
                        <el-tag v-else="scope.row.cat_level === 2" type="warning">三级</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="300px">
                    <template v-slot="scope">
                        <!-- 编辑 -->
                        <el-button size="mini" type="primary" icon="el-icon-edit"
                            @click="editCatedialogOpened(scope.row)">编辑
                        </el-button>
                        <!-- 删除 -->
                        <el-button size="mini" type="danger" icon="el-icon-delete"
                            @click="deleteCateDialogOpened(scope.row)">删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="this.queryInfo.pagenum" :page-sizes="[10, 20, 30]" :page-size="this.queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
            <!-- 分类信息区 -->
            <el-form ref="addCateFormRef" :model="addCateForm" label-width="80px">
                <el-form-item label="分类名称">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <!-- 级联选择框 -->
                    <el-cascader v-model="selectedCateId" :options="parentCateList" :props="cateProps"
                        @change="handleCateChange" clearable>
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    created() {
        this.getCateList()
    },
    data() {
        return {
            // 添加分类对话框
            addCateDialogVisible: false,
            // 商品分类数据列表
            cateList: [],
            // 分页信息
            queryInfo: { pagenum: 1, pagesize: 10, query: '' },
            total: 0,
            // 分类树形控件配置项
            cateTreeProps: {
                children: 'children',
                label: 'cat_name'
            },
            // 添加分类表单
            addCateForm: {
                // 父级分类名称
                cat_name: '',
                // 父级分类id
                cat_pid: 0,
                // 分类层级，`0`表示一级分类
                cat_level: 0
            },
            // 选中的父级分类
            selectedCateId: [],
            // 级联选择器配置项
            cateProps: {
                value: 'cat_id',
                expandTrigger: 'hover',
                checkStrictly: true,
                label: 'cat_name'
            },
            // 父级分类数据列表
            parentCateList: []
        }
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
            if (res.meta.status !== 200) {
                return this.$message.error('获取分类列表数据失败')
            }
            console.log(res.data.result);
            this.cateList = res.data.result
            this.total = res.data.total
        },
        editCatedialogOpened(cate) {
            console.log(cate);
        },
        deleteCateDialogOpened(cate) {
            console.log(cate);
        },
        // pageSize 改变时会触发
        handleSizeChange(val) {
            this.queryInfo.pagesize = val
            this.getCateList()
        },
        // currentPage 改变时会触发
        handleCurrentChange(val) {
            this.queryInfo.pagenum = val
            this.getCateList()
        },
        // 展示添加分类对话框
        showAddCateDialog() {
            this.addCateDialogVisible = true
            this.getParentCateList()
        },
        // 获取父级分类数据列表
        async getParentCateList() {
            const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
            if (res.meta.status !== 200) {
                return this.$message.error('获取分类列表数据失败')
            }
            this.parentCateList = res.data
        },
        // 当级联选择器选中节点变化时触发
        handleCateChange() {
            if (!this.selectedCateId.length) {
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
                return
            }
            this.addCateForm.cat_pid = this.selectedCateId[this.selectedCateId.length - 1]
            this.addCateForm.cat_level = this.selectedCateId.length
        },
        // 监听添加分类对话框关闭事件
        addCateDialogClosed() {
            this.addCateForm.cat_pid = 0
            this.addCateForm.cat_level = 0
            this.selectedCateId = []
            this.$refs.addCateFormRef.resetFields()
        },
        // 添加分类
        async addCate() {
            const { data: res } = await this.$http.post('categories', this.addCateForm)
            if (res.meta.status !== 201) {
                return this.$message.error('添加分类失败')
            }
            this.$message.success('添加分类成功')
            this.addCateDialogVisible = false
            console.log(res.data);
        },
    },
}
</script>

<style>

</style>