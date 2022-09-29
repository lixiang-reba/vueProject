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
                    <el-input placeholder="请输入内容" class="input-with-select" clearable>
                        <el-button slot="append" icon="el-icon-search">
                        </el-button>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <el-button type="primary">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表区 -->
            <el-table :data="orderList" stripe style="width: 100%" border>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="order_number" label="订单编号"></el-table-column>
                <el-table-column prop="order_price" label="订单价格"></el-table-column>
                <el-table-column label="是否付款">
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.is_send === '是'">已付款</el-tag>
                        <el-tag v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货"></el-table-column>
                <el-table-column label="操作">
                    <el-button type="primary" icon="el-icon-edit" @click="showEditAddressDialog"></el-button>
                    <el-button type="success" icon="el-icon-s-opportunity" @click="showProgressDialog"></el-button>
                </el-table-column>
            </el-table>
            <!-- 分页区 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="this.queryInfo.pagenum" :page-sizes="[5, 9, 10]" :page-size="this.queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 修改地址对话框 -->
        <el-dialog title="修改地址" :visible.sync="editAddressDialogVisible" width="50%">
            <el-form :model="editAddressForm" :rules="editAddressRules" ref="editAddressRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader v-model="editAddressForm.address1" :options="cityData">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="editAddressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editAddressDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editAddressDialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 物流进度对话框 -->
        <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
            <el-timeline :reverse="true">
                <el-timeline-item v-for="(activity, index) in progressData" :key="index" :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>
            <span slot="footer" class="dialog-footer">
                <el-button @click="progressDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="progressDialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import cityData from "./citydata";
export default {
    created() {
        this.getOrderList()
    },
    data() {
        return {
            // 订单列表
            orderList: [],
            // 分页信息
            queryInfo: { pagenum: 1, pagesize: 9, query: '' },
            // 总条目数
            total: 0,
            editAddressDialogVisible: false,
            editAddressForm: {
                address1: [],
                address2: ''
            },
            editAddressRules: {
                address1: [
                    { required: true, message: '请选择省市区/县', trigger: 'blur' },
                ],
                address2: [
                    { required: true, message: '请输入详细地址', trigger: 'blur' },
                ],
            },
            cityData,
            progressDialogVisible: false,
            progressData: [
                {
                    "time": "2018-05-10 09:39:00",
                    "ftime": "2018-05-10 09:39:00",
                    "context": "已签收,感谢使用顺丰,期待再次为您服务",
                    "location": ""
                },
                {
                    "time": "2018-05-10 08:23:00",
                    "ftime": "2018-05-10 08:23:00",
                    "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
                    "location": ""
                },
                {
                    "time": "2018-05-10 07:32:00",
                    "ftime": "2018-05-10 07:32:00",
                    "context": "快件到达 [北京海淀育新小区营业点]",
                    "location": ""
                },
                {
                    "time": "2018-05-10 02:03:00",
                    "ftime": "2018-05-10 02:03:00",
                    "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
                    "location": ""
                },
                {
                    "time": "2018-05-09 23:05:00",
                    "ftime": "2018-05-09 23:05:00",
                    "context": "快件到达 [北京顺义集散中心]",
                    "location": ""
                },
                {
                    "time": "2018-05-09 21:21:00",
                    "ftime": "2018-05-09 21:21:00",
                    "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
                    "location": ""
                },
                {
                    "time": "2018-05-09 13:07:00",
                    "ftime": "2018-05-09 13:07:00",
                    "context": "顺丰速运 已收取快件",
                    "location": ""
                },
                {
                    "time": "2018-05-09 12:25:03",
                    "ftime": "2018-05-09 12:25:03",
                    "context": "卖家发货",
                    "location": ""
                },
                {
                    "time": "2018-05-09 12:22:24",
                    "ftime": "2018-05-09 12:22:24",
                    "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
                    "location": ""
                },
                {
                    "time": "2018-05-08 21:36:04",
                    "ftime": "2018-05-08 21:36:04",
                    "context": "商品已经下单",
                    "location": ""
                }
            ],
        }
    },
    methods: {
        // 获取订单数据列表
        async getOrderList() {
            const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
            if (res.meta.status !== 200) {
                return this.$message.error('获取订单列表数据失败')
            }
            this.total = res.data.total
            console.log(this.total);
            this.orderList = res.data.goods
        },
        // pageSize 改变时会触发
        handleSizeChange(val) {
            this.queryInfo.pagesize = val
            this.getOrderList()
        },
        // currentPage 改变时会触发
        handleCurrentChange(val) {
            this.queryInfo.pagenum = val
            this.getOrderList()
        },
        // 监听修改地址按钮
        showEditAddressDialog() {
            this.editAddressDialogVisible = true
        },
        showProgressDialog() {
            this.progressDialogVisible = true
        }
    },
}
</script>

<style>

</style>