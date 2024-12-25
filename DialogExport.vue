<template>
  <el-dialog
    title="导出"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="visible"
    append-to-body
    width="500px"
    :before-close="cancel"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="formRules"
      label-width="auto"
    >
      <el-form-item label="导出维度" prop="exportType">
        <erp-selection
          v-model="form.exportType"
          :select-options="[
            { label: '按style导出', key: 1, value: 1},
            { label: '按color导出', key: 2, value: 2},
          ]"
          placeholder="导出维度"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="submit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import ErpSelection from '@/components/ErpSelection'
import {
  statisticsExportAll,
} from '@/api/erp/operation'
import { jumpToDownloadMessage } from '@/utils'
export default {
  components: {
    ErpSelection,
  },
  props: {
    queryParams: {
      type: Object,
      default: () => ({}),
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      form: {
        exportType: 1,
      },
      formRules: {
        exportType: [
          { required: true, message: '请选择导出维度', trigger: 'blur' },
        ],
      },
      submitLoading: false,
    }
  },
  computed: {
    submitParams() {
      const params = {
        ...this.queryParams,
        ...this.form,
      }
      return params
    },
  },
  mounted() {
  },
  methods: {
    cancel() {
      this.form = this.$options.data().form
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.$emit('update:visible', false)
    },
    async submit() {
      this.$refs?.form.validate(async(valid) => {
        if (!valid) return
        this.submitLoading = true
        const { success, message } = await statisticsExportAll(this.submitParams).finally(() => {
          this.submitLoading = false
        })
        if (success) {
          jumpToDownloadMessage.bind(this, message)()
          this.cancel()
        } else {
          this.$message.error(message || '导出失败')
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
