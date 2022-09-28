<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
            <!-- 步骤条 -->
            <el-steps :active="active - 0" finish-status="success">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- 添加商品表单 -->
            <el-form ref="addFormRef" :model="addItemForm" label-width="80px" :rules="addItemRules"
                label-position="top">
                <!-- 标签页 -->
                <el-tabs tab-position="left" v-model="active" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addItemForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addItemForm.goods_price"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addItemForm.goods_weight"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addItemForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类">
                            <el-cascader v-model="addItemForm.goods_cat" :options="cateList" :props="cateProps"
                                clearable>
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item v-for="(item,i) in manyTableList" :label="item.attr_name" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox v-for="(params,i) in item.attr_vals" :label="params" :key="i">
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item v-for="(attr,i) in onlyTableList" :label="attr.attr_name" :key="attr.attr_id">
                            <el-input v-model="attr.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload action="http://127.0.0.1:8888/api/private/v1/upload" :on-preview="handlePreview"
                            :on-remove="handleRemove" list-type="picture" :headers="uploadHeaders"
                            :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑器组件 -->
                        <quill-editor ref="myQuillEditor" v-model="addItemForm.goods_introduce" />
                        <el-button class="btn-add" type="primary" @click="addGood">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 图片预览对话框 -->
        <el-dialog title="图片预览" :visible.sync="picPreviewDialogVisible" width="30%">
            <img :src="picPreviewParh" alt="" style="width:100%">
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash';
export default {
    created() {
        this.getCateList()
    },
    data() {
        return {
            // 当前激活的步骤
            active: '0',
            // 添加商品表单数据对象
            addItemForm: {
                goods_number: "",
                goods_name: "",
                goods_weight: "",
                goods_price: "",
                pics: [],
                goods_introduce: '',
                goods_cat: [],
                attrs: []
            },
            // 添加商品信息预验证
            addItemRules: {
                goods_number: [
                    { required: true, message: '请输入姓名', trigger: 'blur' },
                ],
                goods_name: [
                    { required: true, message: '请输入姓名', trigger: 'blur' },
                ],
                goods_weight: [
                    { required: true, message: '请输入姓名', trigger: 'blur' },
                ],
                goods_price: [
                    { required: true, message: '请输入姓名', trigger: 'blur' },
                ],
            },
            // 商品分类数据列表
            cateList: [],
            // 级联选择器配置项
            cateProps: {
                value: 'cat_id',
                expandTrigger: 'hover',
                label: 'cat_name'
            },
            // 动态参数列表 
            manyTableList: [],
            // 静态参数列表 
            onlyTableList: [],
            // 设置上传的请求头部
            uploadHeaders: {
                Authorization: sessionStorage.getItem("token")
            },
            // 图片预览对话框
            picPreviewDialogVisible: false,
            // 图片预览路径
            picPreviewParh: ''
        };
    },
    computed: {
        // 当前选中的三级分类id
        cateId() {
            if (!this.addItemForm.goods_cat.length === 3) {
                return null
            }
            return this.addItemForm.goods_cat[this.addItemForm.goods_cat.length - 1]
        }
    },
    methods: {
        // 获取分类列表数据
        async getCateList() {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) {
                return this.$message.error('获取分类列表数据失败')
            }
            this.cateList = res.data
        },
        // 监听标签切换事件
        beforeTabLeave(activeName, oldActiveName) {
            // console.log(activeName, oldActiveName);
            if (oldActiveName == 0 && !this.addItemForm.goods_cat.length) {
                this.$message.error('请先选择商品分类')
                return false
            }
        },
        // 获取分类参数
        async tabClicked() {
            if (this.active === '1') {
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
                if (res.meta.status !== 200) {
                    return this.$message.error('获取分类参数据失败')
                }
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                });
                console.log(res.data);
                this.manyTableList = res.data
            } else if (this.active === '2') {
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
                if (res.meta.status !== 200) {
                    return this.$message.error('获取分类参数据失败')
                }
                console.log(res.data);
                this.onlyTableList = res.data
            }
        },
        // 点击文件列表中已上传的文件时的钩子
        handlePreview(file) {
            this.picPreviewDialogVisible = true
            this.picPreviewParh = file.response.data.url
        },
        // 文件列表移除文件时的钩子
        handleRemove(file) {
            const filePath = file.response.data.tmp_path
            const i = this.addItemForm.pics.findIndex((x) => {
                x.pic === filePath
            })
            this.addItemForm.pics.splice(i, 1)
        },
        // 文件上传成功时的钩子
        handleSuccess(response) {
            const picInfo = { pic: response.data.tmp_path }
            this.addItemForm.pics.push(picInfo)
            console.log(this.addItemForm);
        },
        // 添加商品
        addGood() {
            this.$refs.addFormRef.validate(async (valid) => {
                if (!valid) {
                    return this.$message.error('请输入有效的商品信息')
                }
                // 执行添加的业务逻辑
                // 处理动态参数
                this.manyTableList.forEach((item) => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(',')
                    }
                    this.addItemForm.attrs.push(newInfo)
                })
                // 处理静态属性
                this.onlyTableList.forEach((item) => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    }
                    this.addItemForm.attrs.push(newInfo)
                })
                // lodash cloneDeep(obj)
                const form = _.cloneDeep(this.addItemForm)
                form.attrs = this.addItemForm.attrs
                form.goods_cat = form.goods_cat.join(',')
                // console.log(form);
                const { data: res } = await this.$http.post('goods', form)
                if (res.meta.status !== 201) {
                    return this.$message.error('添加商品失败')
                }
                this.$message.success('添加商品成功')
                this.$router.push('/goods')
            })
        }
    },
}
</script>

<style scoped>
.el-steps {
    margin: 15px 10px;
}

.btn-add {
    margin-top: 15px;
}
</style>