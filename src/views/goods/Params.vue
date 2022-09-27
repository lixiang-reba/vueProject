<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 警告区 -->
            <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon>
            </el-alert>
            <!-- 选择商品分类区 -->
            <el-row>
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 级联选择框 -->
                    <el-cascader v-model="selectedCateId" :options="cateList" :props="cateProps" clearable
                        @change="handleCateChange">
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- 标签页区 -->
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" :disabled="isBtnDisabled">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyParamsTable" style="width: 100%" border expand-change="expandChange">
                        <!-- 展开行 -->
                        <el-table-column type='expand'>
                            <template v-slot="scope">
                                <!-- 动态参数标签 -->
                                <el-tag type="success" v-for="(item,i) in scope.row.attr_vals" :key="i" closable
                                    @close="tagClosed(scope.row,i)">
                                    {{item}}
                                </el-tag>
                                <!-- 添加标签 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" lable="#"></el-table-column>
                        <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" :disabled="isBtnDisabled">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyParamsTable" style="width: 100%" border>
                        <el-table-column type='expand'>
                        </el-table-column>
                        <el-table-column type="index" lable="#"></el-table-column>
                        <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
    </div>
</template>

<script>
export default {
    created() {
        this.getCateList()
    },
    data() {
        return {
            // 选中的分类
            selectedCateId: [],
            // 商品分类数据列表
            cateList: [],
            // 级联选择器配置项
            cateProps: {
                value: 'cat_id',
                expandTrigger: 'hover',
                label: 'cat_name'
            },
            // 绑定标签页选中项的name
            activeName: 'many',
            // 动态参数
            manyParamsTable: [],
            // 静态参数
            onlyParamsTable: [],
        }
    },
    computed: {
        // 添加参数按钮是否禁用
        isBtnDisabled() {
            return !this.selectedCateId.length
        },
        // 当前选中的三级分类id
        cateId() {
            if (!this.selectedCateId.length === 3) {
                return null
            }
            return this.selectedCateId[this.selectedCateId.length - 1]
        }
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) {
                return this.$message.error('获取分类列表数据失败')
            }
            this.cateList = res.data
        },
        // 监听级联选择器选中项发生变化
        async handleCateChange() {
            this.getCateParams()
        },
        // 监听选中标签变化的事件
        async handleClick() {
            // console.log(this.selectedCateId);
            if (this.selectedCateId.length !== 3) { return }
            this.getCateParams()
        },
        // 获取分类参数
        async getCateParams() {
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
            if (res.meta.status !== 200) {
                return this.$message.error('获取分类参数据失败')
            }
            // console.log(this.selectedCateId);
            // 讲attr_vals项变成数组以便展开行标签遍历
            res.data.forEach(item => {
                // 文本框和按钮的切换显示
                item.inputVisible = false,
                    // 文本框输入内容
                    item.inputValue = ''
                item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
            });
            console.log(res.data);
            if (this.activeName === 'many') {
                this.manyParamsTable = res.data
            } else {
                this.onlyParamsTable = res.data
            }
        },
        // 当用户对某一行展开或者关闭的时候会触发该事件
        expandChange() {

        },
        // 展示文本框
        showInput(row) {
            row.inputVisible = true;
            // 文本框自动获得焦点
            // nexttick：当页面元素被重新渲染后再执行回调
            // 因为只有当input被渲染出来后 才能获取焦点
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        // 发请求提交编辑参数
        async submitParams(row) {
            const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals: row.attr_vals.join(',')
            })
            if (res.meta.status !== 200) {
                return this.$message.error('修改参数失败')
            }
            this.$message.success('修改参数成功')
        },
        // 失去焦点或按下enter提交参数
        async handleInputConfirm(row) {
            // console.log(row);
            if (row.inputValue.trim().length) {
                row.attr_vals.push(row.inputValue);
                this.submitParams(row)
            }
            row.inputVisible = false;
            row.inputValue = '';
        },
        // 监听参数标签关闭事件
        tagClosed(row, i) {
            row.attr_vals.splice(i, 1)
            this.submitParams(row)
        }
    }

}
</script>

<style scoped>
.el-alert {
    margin-bottom: 15px;
}

.el-tag {
    margin: 0 10px;
}

.input-new-tag {
    width: 120px;
}
</style>