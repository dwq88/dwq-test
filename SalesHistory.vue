<template>
  <el-dialog
    title="历史销售数据"
    :visible.sync="salesHistoryVisible"
    width="1200px"
    :before-close="handleClosed"
    append-to-body
  >
    <el-form ref="form" :model="form" inline :rules="formRules" label-width="auto">
      <el-form-item label="style" prop="style">
        <virtualized-select
          v-model="form.style"
          :options="styleList"
          :props="{
            label: 'style',
            value: 'styleId',
          }"
          collapse-tags
          multiple
          placeholder="Style"
        />
      </el-form-item>
      <el-form-item label="月份" prop="date">
        <el-date-picker
          v-model="form.date"
          type="monthrange"
          format="yyyy-MM"
          value-format="yyyy-MM"
          range-separator="~"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
        />
      </el-form-item>
      <div style="margin: 0px 0px 18px 0px;white-space: nowrap;vertical-align: top;display: inline-block;">
        <el-button type="primary" :loading="searchLoading" @click="handleQuery()">查询</el-button>
        <el-button @click="handleClosed()">重置</el-button>
        <el-button type="primary" :loading="exportLoading" @click="handleExport()">导出</el-button>
      </div>
    </el-form>
    <vxe-toolbar>
      <template #buttons>
        1.计划销量和计划均价：取自计划管理style销售计划最新一版数据
      </template>
    </vxe-toolbar>
    <vxe-toolbar>
      <template #buttons>
        2.当选择多个style时，实际/计划销量取自多个style实际/计划销量汇总，价格取自多个style实际销售额/计划销售额汇总除以汇总销量
      </template>
    </vxe-toolbar>
    <vxe-table
      ref="table"
      v-loading="searchLoading"
      border
      :max-height="dialogHeight"
      show-overflow
      highlight-current-row
      align="center"
      :scroll-x="{enabled: false}"
      :scroll-y="{enabled: false }"
      :row-config="{isHover: true}"
      :column-config="{resizable: true}"
      :data="tableData"
      keep-source
      :edit-rules="validRules"
      :edit-config="{trigger: 'click', mode: 'cell',showStatus: true}"
    >
      <vxe-table-column field="months" title="月份" min-width="100" />
      <vxe-table-column field="quantity" title="实际销量" min-width="100" />
      <vxe-table-column field="quantityPlan" title="计划销量" min-width="100" />
      <vxe-table-column field="quantityDifference" title="销量差" min-width="100">
        <template #default="{ row }">
          <span :class="[`diff-color-${row.quantityColor}`]">{{ row.quantityDifference }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column field="price" title="实际均价" min-width="100" />
      <vxe-table-column field="pricePlan" title="计划均价" min-width="100" />
      <vxe-table-column field="priceDifference" title="价格差" min-width="100">
        <template #default="{ row }">
          <span :class="[`diff-color-${row.priceColor}`]">{{ row.priceDifference }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column field="sales" title="实际销售额" min-width="100" />
      <vxe-table-column field="salesPlan" title="计划销售额" min-width="100" />
      <vxe-table-column field="salesDifference" title="销售额差值" min-width="100">
        <template #default="{ row }">
          <span :class="[`diff-color-${row.salesColor}`]">{{ row.salesDifference }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column v-if="saveForm.styleId && saveForm.styleId.length===1" field="remark" title="备注" min-width="250" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input
            v-model="row.remark"
            align="center"
            placeholder="请输入"
            @blur="handleSetRemark(row)"
          />
        </template>
      </vxe-table-column>
    </vxe-table>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleClosed">关 闭</el-button>
    </span>
  </el-dialog>
</template>
<script>
import VirtualizedSelect from '@/components/VirtualizedSelect'
import {
  historicalSalesByStyle,
  exportHistoricalSalesRemarkByStyle,
  addHistoricalSalesRemarkByStyle,
} from '@/api/erp/operation'
export default {
  components: { VirtualizedSelect },
  props: {
    salesHistoryVisible: {
      type: Boolean,
      default: false,
    },
    styleList: {
      type: Array,
      default: () => [],
    },
    styleValue: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      form: {
        style: [],
        date: [],
      },
      formRules: {
        style: [{ required: true, message: '请选择style', trigger: ['blur', 'change'] }],
        date: [{ required: true, message: '请选择月份', trigger: ['blur', 'change'] }],
      },
      searchLoading: false,
      exportLoading: false,
      tableData: [],
      saveForm: {},
    }
  },
  computed: {
    queryParams() {
      return {
        styleId: this.form.style,
        startDate: this.form.date?.[0],
        endDate: this.form.date?.[1],
        siteId: this.styleValue?.siteId,
        platformId: this.styleValue?.platformId,
        shopId: this.styleValue?.shopId,
      }
    },
    dialogHeight() {
      return window.innerHeight - 500
    },
    validRules() {
      const validFeild = [
        'remark',
      ]
      const validRulesLists = {}
      validFeild.forEach(item => {
        validRulesLists[item] = [{ required: true, message: '请输入' }]
      })
      return validRulesLists
    },
  },
  watch: {
    styleValue: {
      handler(val) {
        this.form.style = [val.styleId]
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    handleQuery() {
      this.$refs?.form?.validate(async(valid) => {
        if (valid) {
          this.saveForm = { ...this.queryParams }
          this.searchLoading = true
          const { datas = [] } = await historicalSalesByStyle(this.queryParams).finally(() => {
            this.searchLoading = false
          })
          this.tableData = datas
        }
      })
    },
    handleClosed() {
      this.$refs?.form?.resetFields()
      this.tableData = []
      this.$emit('update:salesHistoryVisible', false)
    },
    async handleExport() {
      this.exportLoading = true
      const { success, msg } = await exportHistoricalSalesRemarkByStyle(this.saveForm).finally(() => {
        this.exportLoading = false
      })
      if (success) {
        this.$message({
          type: 'success',
          dangerouslyUseHTMLString: true,
          message: `${msg || '导出成功'} <a target="_blank" style="background-color: #67C23A;color: #FFFFFF;border-radius: 5px;padding: 5px 10px;display: inline-block" href="/data-download/download">去查看</a>`,
          duration: 5000,
        })
      } else {
        this.$message.error(msg || '导出失败')
      }
    },
    async handleSetRemark(row) {
      const errMap = await this.$refs?.table?.validate(row).catch(errMap => errMap)
      if (errMap) {
        const msgList = []
        Object.values(errMap).forEach(errList => {
          errList.forEach(params => {
            const { rowIndex, column, rules } = params
            rules.forEach(rule => {
              msgList.push(`请将第 ${rowIndex + 1} 行 ${column.title} 信息填写完整`)
            })
          })
        })
        this.$message({
          type: 'error',
          dangerouslyUseHTMLString: true,
          message: msgList.join('<br>'),
        })
      } else {
        const { success, message } = await addHistoricalSalesRemarkByStyle({
          ...this.saveForm,
          styleId: [row.styleId],
          remark: row.remark,
          months: row.months,
        })
        if (success) {
          this.$message.success(message || '修改成功')
          this.handleQuery()
        }
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.diff-color-red{
  color: red;
}
.diff-color-balck{
  color: #606266;
}
</style>
