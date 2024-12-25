<template>
  <div>
    <el-dialog
      :title="commonLintChartData.title"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      :visible.sync="commonLintChartVisible"
      :before-close="cancel"
      append-to-body
      width="90%"
      top="5%"
      center
      style="font-weight: bold"
    >
      <div v-loading="commonLintChartData.loading">
        <div style="display: flex;justify-content: space-between;align-items: center">
          <div style="color: #E6A23C;">
            <span>
              图表Deal标注说明：
            </span>
            <span v-if="commonLintChartData.isUtility">
              Sold、Price指标趋势上，
            </span>
            <span>
              三角形标注表示LD、圆形标注表示7DD、方形标注表示DOTD
            </span>
          </div>
          <div>
            <slot />
          </div>
        </div>
        <div ref="chart" style="height: 50vh;width: 100%;margin-top: 10px;" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  props: {
    commonLintChartData: {
      type: Object,
      default: () => {},
    },
    commonLintChartVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      chart: null,
      chartOption: {
        dataZoom: [{}],
        grid: {
          top: '',
          left: '50',
          containLabel: false,
        },
        legend: {
          selected: {},
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
        },
        xAxis: {
          type: 'category',
          data: [],
          boundaryGap: false,
        },
        yAxis: [],
        series: [],
      },
    }
  },
  watch: {
    commonLintChartData: {
      handler() {
        this.$refs?.chart && this.initChart()
      },
      deep: true,
    },
  },
  destroyed() {
    this.destroyChart()
  },
  methods: {
    cancel() {
      this.$emit('update:commonLintChartVisible', false)
      this.$emit('reset')
    },
    initChart() {
      this.chart && this.destroyChart()
      this.chart = echarts.init(this.$refs['chart'])
      this.chartOption.series = this.commonLintChartData.yData
      this.chartOption.xAxis.data = this.commonLintChartData.xData
      this.chartOption.yAxis = this.commonLintChartData.yAxis
      this.chartOption.grid.top = this.commonLintChartData?.isUtility ? '140' : '30'
      this.chartOption.grid.right = this.commonLintChartData?.isUtility ? ((this.commonLintChartData.yAxis.length - 1) * 70 + 10) : '30'
      this.chartOption.legend.selected = this.commonLintChartData?.selected || {}
      this.chart.setOption(this.chartOption)
      this.chart.on('legendselectchanged', (params) => {
        if (!this.commonLintChartData?.isUtility) {
          return
        }
        // 最后一个不允许取消
        if (Object.values(params.selected).filter(value => value).length === 0) {
          params.selected[params.name] = true
        }
        this.$emit('legendSelectChanged', params.selected)
      })
      window.addEventListener('resize', this.chartResize)
    },
    destroyChart() {
      window.removeEventListener('resize', this.chartResize)
      this.chart?.off('legendselectchanged')
      this.chart?.dispose()
      this.chart = null
    },
    chartResize() {
      this.chart && this.chart.resize()
    },
  },
}
</script>

<style lang="scss" scoped>
/deep/ .el-dialog--center .el-dialog__body {
  padding: 0px 25px;
}
</style>
