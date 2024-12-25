<template>
  <div>
    <el-form ref="form" :model="form" :rules="formRules" label-width="auto" inline>
      <el-form-item label=" " prop="platformSiteShop">
        <CascadeSelector
          v-model="form.platformSiteShop"
          api-key="platformSiteShop"
          :permission="false"
          :need-list="[1]"
          collapse-tags
          :props="{ multiple: true }"
          placeholder="平台 / 站点 / 店铺"
          @change="
            form.userId=[]
            form.styleId=[]
            form.crawlAsin=[]
          "
        />
      </el-form-item>
      <el-form-item label="" prop="buUser">
        <CascadeSelector
          v-model="form.buUser"
          :props="{ multiple: true }"
          api-key="BUTree"
          :permission="false"
          collapse-tags
          placeholder="BU"
          @change="
            form.userId=[]
            form.styleId=[]
            form.crawlAsin=[]
          "
        />
      </el-form-item>
      <el-form-item label="" prop="combatTeam">
        <ErpSelection
          v-model="form.combatTeam "
          placeholder="CT"
          :select-options="ctList"
          @change="
            form.styleId=[]
          "
        />
      </el-form-item>
      <el-form-item label="" prop="userId">
        <ErpSelection
          v-model="form.userId"
          api-key="operationsUser"
          multiple
          :params="userParams"
          ganged
          :ganged-ignore="['groupId','buId']"
          placeholder="组员"
          @change="
            form.styleId=[]
            form.crawlAsin=[]
          "
          @responseData="responseUserData"
        />
      </el-form-item>
      <el-form-item label="" prop="season">
        <ErpSelection
          v-model="form.season"
          multiple
          placeholder="销售季节"
          api-key="season"
        />
      </el-form-item>
      <el-form-item label="" prop="styleId">
        <virtualized-select
          v-model="form.styleId"
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
      <el-form-item label="" prop="crawlAsin">
        <virtualized-select
          v-model="form.crawlAsin"
          :options="asinList"
          :props="{
            label: 'crawlAsin',
            value: 'crawlAsin',
          }"
          collapse-tags
          multiple
          placeholder="Parent ASIN"
        />
      </el-form-item>
      <el-form-item label="" prop="vendorId">
        <ErpSelection
          v-model="form.vendorId"
          placeholder="Vendor"
          api-key="getVendorList"
          multiple
        />
      </el-form-item>
      <el-form-item label="" prop="categoryId">
        <CascadeSelector v-model="form.categoryId" collapse-tags api-key="categoryTreeRefactor" :props="{emitPath:false,multiple:true}" placeholder="类目" />
      </el-form-item>
      <el-form-item label="" prop="positionId">
        <ErpSelection
          v-model="form.positionId"
          placeholder="定位"
          multiple
          api-key="stylePosition"
        />
      </el-form-item>
      <el-form-item label="" prop="time">
        <el-date-picker v-model="form.time" type="daterange" :picker-options="pickerOptions" value-format="yyyy-MM-dd" :clearable="false" range-separator="~" start-placeholder="起始时间" end-placeholder="结束时间" />
      </el-form-item>
      <el-form-item label="" prop="saleStatus">
        <ErpSelection
          v-model="form.saleStatus"
          placeholder="售卖状态"
          :select-options="[
            { label: '可售', key: '1', value: '1',},
            { label: '停售', key: '2', value: '2',},
          ]"
        />
      </el-form-item>
      <div style="margin: 0px 0px 18px 0px;white-space: nowrap;vertical-align: top;display: inline-block;">
        <el-button type="primary" :loading="searchLoading" @click="handleQuery()">查询</el-button>
        <el-button @click="handleReset()">重置</el-button>
      </div>
    </el-form>
    <vxe-toolbar>
      <template #buttons>
        <el-button type="primary" class="el-icon-download" @click="handleExportAll()">一键导出</el-button>
        <el-button type="primary" class="el-icon-download" :loading="exportByDayLoading" @click="handleExportByDay()">按天导出</el-button>
        <div style="margin-left: 20px;">共 {{ tableData.length }} 条</div>
      </template>
      <template v-slot:tools>
        <vxe-input ref="filter" v-model="filterValue" type="search" placeholder="全表搜索" @keyup="searchEvent" />
        <VxeColumnSettings v-if="xTableRef" ref="VxeColumnSettings" :container-ref="xTableRef" ref-name="xTable" local-key="operation-sales-statistics" @upDate="(val) => $refs.xTable.reloadColumn(val)">
          <i class="icon-button mx-1 el-icon-s-fold" @click="$refs['VxeColumnSettings'].visibleShow()" />
        </VxeColumnSettings>
      </template>
    </vxe-toolbar>
    <vxe-table
      ref="table"
      v-loading="searchLoading"
      :max-height="maxHeight"
      class="xTable"
      align="center"
      show-footer
      :data="tableData"
      :scroll-x="{enabled: true }"
      :scroll-y="{enabled: true }"
      :column-config="{resizable: true}"
      :row-config="{height: 60}"
      :footer-method="footerMethod"
      show-footer-overflow
      show-overflow
      row-id="styleIdOrColor"
      :row-class-name="setRowClass"
      :tree-config="{
        transform: true,
        lazy: true,
        rowField: 'styleIdOrColor',
        children: 'children',
        hasChild: 'hasChild',
        loadMethod: handleLoadContentMethod,
        iconOpen: 'el-icon-arrow-down',
        iconClose: 'el-icon-arrow-right',
        iconLoaded: 'el-icon-loading'
      }"
    >
      <vxe-table-column width="50" fixed="left" tree-node />
      <vxe-table-column field="name" title="趋势" min-width="60" fixed="left">
        <template #default="{ row }">
          <i class="vxe-icon-chart-line blue" style="font-size: 18px;" @click="showUtilityLineChart('Utility',row)" />
        </template>
      </vxe-table-column>
      <vxe-table-column field="platformSiteShop" title="平台站点店铺" min-width="150" sortable fixed="left" />
      <vxe-table-column field="crawlAsin" title="Parent ASIN" min-width="120" sortable fixed="left" show-overflow="ellipsis">
        <template #default="{ row }">
          <span v-for="[key,value] in Object.entries(row.crawlAsinStyleNumMap || {})" :key="key" class="blue" style="cursor: pointer;margin-right: 3px;" @click="jumpToDetail(row,key)">{{ `${key}(${value})` }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column field="imageUrl" title="Style图片" min-width="120" fixed="left">
        <template #default="{ row }">
          <el-image
            v-if="row.imageUrl"
            fit="contain"
            style="width: 55px; height: 55px"
            :src="row.imageUrl"
            :preview-src-list="[row.imageUrl]"
          />
        </template>
      </vxe-table-column>
      <vxe-table-column field="styleName" title="Style/Color" min-width="150" sortable fixed="left">
        <template #header>
          <el-tooltip effect="dark" content="若Style当天在参加Deal（含DOTD/7DD/LD），则字体将呈现为红色；否则，字体呈现为蓝色。" placement="top">
            <span style="cursor: pointer">Style/Color</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <el-popover
            placement="right"
            width="585"
            trigger="hover"
            :popper-options="{ boundariesElement: 'body', gpuAcceleration: true }"
            :open-delay="100"
          >
            <vxe-table
              max-height="350px"
              align="center"
              :data="row.styleAddTimeVO"
              :scroll-x="{enabled: false}"
              :scroll-y="{enabled: false}"
              :column-config="{resizable: true}"
              show-overflow
            >
              <vxe-table-column field="siteCode" title="站点" min-width="60" />
              <vxe-table-column field="operator" title="负责人" min-width="80" />
              <vxe-table-column field="categoryName" title="Category" min-width="250" />
              <vxe-table-column field="date" title="上架时间" min-width="150" />
            </vxe-table>
            <span v-if="row.type==='style'" slot="reference" style="cursor: pointer;" @click.stop="handleSalesHistory(row)">
              <span v-if="row.dealColor" class="red">{{ row.styleName }}{{ row.styleName&&row.skuNum ? `(${row.skuNum})` : '' }}</span>
              <span v-else class="blue">{{ row.styleName }}{{ row.styleName&&row.skuNum ? `(${row.skuNum})` : '' }}</span>
            </span>
            <span v-else slot="reference">
              <span v-if="row.dealColor" class="red">{{ row.color }}</span>
              <span v-else class="blue">{{ row.color }}</span>
            </span>
          </el-popover>
        </template>
      </vxe-table-column>
      <vxe-table-column field="position" title="定位" min-width="80" sortable>
        <template #header>
          <el-tooltip
            effect="dark"
            content="Style维度定位：Style下所有MSKU的定位中取最高定位；
            Style-Color维度定位：Style-Color下所有MSKU的定位中取最高定位。"
            placement="top"
          >
            <span>定位</span>
          </el-tooltip>
        </template>
      </vxe-table-column>
      <vxe-table-column field="vendorName" title="Vendor" min-width="100" sortable />
      <vxe-table-column field="season" title="销售季节" min-width="100" sortable />
      <vxe-table-column field="bu" title="BU" min-width="100" sortable />
      <vxe-table-column field="combatTeam" title="CT" min-width="100" sortable />
      <vxe-table-column field="brandName" title="品牌" min-width="100" sortable />
      <vxe-table-column field="category" title="类目" min-width="150" sortable />
      <vxe-table-column field="quantity" title="Sold" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" content="Ordered 销量【箭头代表对比昨日增减】" placement="top">
            <span>Sold</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <el-popover
            placement="left"
            width="550"
            trigger="hover"
            :open-delay="100"
            :popper-options="{ boundariesElement: 'body', gpuAcceleration: true }"
            @show="showSoldDetails(row)"
          >
            <div v-loading="soldDetailsLoading">
              <span>今日动态 </span>
              <span v-if="+row.quantityTrend>0" class="red">+</span>
              <span v-if="+row.quantityTrend>0" class="red">{{ +row.quantityTrend }}</span>
              <span v-else-if="+row.quantityTrend<0" class="green">{{ +row.quantityTrend }}</span>
              <span v-else>{{ +row.quantityTrend }}</span>
              <!-- 在开启虚拟滚动的时候，popover会偶发的定位失败。所以使用v-if来控制，然后自己写一个暂无数据的提示 -->
              <vxe-table
                v-if="soldDetailsTableData.length>0"
                height="350px"
                align="center"
                :data="soldDetailsTableData"
                :scroll-x="{enabled: false}"
                :scroll-y="{enabled: true}"
                :column-config="{resizable: true}"
                show-overflow
              >
                <vxe-table-column field="sku" title="SKU" min-width="200" />
                <vxe-table-column field="quantity" title="Sold" min-width="80" />
                <vxe-table-column v-if="row.type==='style'" field="color" title="Color" min-width="120" />
                <vxe-table-column field="size" title="Size" min-width="60" />
              </vxe-table>
              <div v-else style="text-align: center; border: 1px solid #eee;padding: 5px 0;">暂无数据</div>
            </div>
            <span slot="reference" class="blue" style="cursor: pointer;" @click="showCommonLineChart('Sold',row)">
              <span>{{ row.quantity }}</span>
            </span>
          </el-popover>
          <el-popover
            v-if="row.quantityTrend"
            placement="top"
            trigger="hover"
          >
            <span v-if="+row.quantityTrend>0">+</span>
            <span>{{ +row.quantityTrend }}</span>
            <span v-if="+row.quantityTrend>0" slot="reference" class="el-icon-top  arrow-red" />
            <span v-if="+row.quantityTrend<0" slot="reference" class="el-icon-bottom  arrow-green" />
          </el-popover>
        </template>
      </vxe-table-column>
      <vxe-table-column field="sales" title="Sales" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" content="总销售额。当“平台站点店铺”筛选项被多选时，对应搜索结果，“Sales”的Total行将统一转换成美元币种汇总" placement="top">
            <span>Sales</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <span style="cursor: pointer;" class="blue" @click="jumpToSalesAndInventory(row)">{{ row.sales ? row.currencySymbol : '' }}{{ row.sales }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column field="price" title="Price" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" content="平均价格 销售额/销量" placement="top">
            <span>Price</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <span style="cursor: pointer;" class="blue" @click="showCommonLineChart('Price',row)">{{ row.price ? row.currencySymbol : '' }}{{ row.price }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column field="discountRate" title="Discount" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" content="Discount Rate 折扣率 【Discount/(Sales+Discount)*100%】" placement="top">
            <span>Discount</span>
          </el-tooltip>
        </template>
      </vxe-table-column>
      <vxe-table-column field="returnQuantity" title="退货量" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" content="Return Amout 选择时间段内退货量" placement="top">
            <span>退货量</span>
          </el-tooltip>
        </template>
      </vxe-table-column>
      <vxe-table-column field="returnRate" title="退货率" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" content="Return Rate Recent 6 Month 最近6个完整月退货率 【高于15%标红】[注：从一个月前开始往前推6个月]" placement="top">
            <span>退货率</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <span slot="reference" :class="[row.returnRateColor===1 ? 'blue' : 'red']">{{ row.returnRate }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column field="acos" title="ACoS" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" content="Acos  广告成本产出比=广告成本（spend）/广告产出（salas）" placement="top">
            <span>ACoS</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <span class="blue">{{ row.acos }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column field="clicks" title="广告点击量" min-width="110" sortable>
        <template #header>
          <el-tooltip effect="dark" content="Ad Clicks  广告点击量" placement="top">
            <span>广告点击量</span>
          </el-tooltip>
        </template>
      </vxe-table-column>
      <vxe-table-column field="orders" title="广告订单" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" content="Ad Ordered  广告产生订单量" placement="top">
            <span>广告订单</span>
          </el-tooltip>
        </template>
      </vxe-table-column>
      <vxe-table-column field="session" title="Session" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" content="Session 流量 【低于300标红】" placement="top">
            <span>Session</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <span :class="[row.sessionColor===1 ? 'blue' : 'red']">{{ row.session }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column field="unit" title="转化率" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" content="Unit Percentage (Conversion) 转化率 【低于8%标红】" placement="top">
            <span>转化率</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <span :class="[row.unitColor===1 ? 'blue' : 'red']">{{ row.unit }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column field="inventory" title="FBA可售" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" content="FBA Inventory 可售库存及其他最新库存数据 【10<=receiving<=100标红】【receiving>100时，标记感叹号】" placement="top">
            <span>FBA可售</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <el-popover
            placement="top"
            trigger="hover"
            :disabled="!row.inventoryStr"
          >
            <div v-if="row.inventoryStr" v-html="row.inventoryStr.replace(/\&\#10;/g, '<br>')" />
            <span
              slot="reference"
              style="cursor: pointer;margin-right: 3px;"
              :class="[row.inventoryColor===1 ? 'blue' : row.inventoryColor===2 ? 'red' : '']"
            >
              <span>{{ row.inventory }}</span>
              <span v-if="row.inventoryColor===3" class="red"><span class="el-icon-warning-outline" style="margin-left: 3px;font-size: 16px;" /></span>
            </span>
          </el-popover>
        </template>
      </vxe-table-column>
      <vxe-table-column field="totalCan" title="可补库存" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" content="当前站点的可补库存 【切换站点可以查看其它站点的可补库存】" placement="top">
            <span>可补库存</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <el-popover
            placement="top"
            trigger="hover"
            :disabled="!row.canString"
          >
            <div v-if="row.canString" v-html="row.canString.replace(/\&\#10;/g, '<br>')" />
            <span slot="reference" class="blue" style="cursor: pointer;" @click="jumpToSalesInventoryAnalysis(row)">{{ row.totalCan }}</span>
          </el-popover>
        </template>
      </vxe-table-column>
      <vxe-table-column field="storage" title="FBA仓储费" min-width="120" sortable>
        <template #header>
          <el-tooltip effect="dark" placement="top">
            <div slot="content">
              <div>
                FBA Storage Fee 当日仓储费=FBA可售库存*单个SKU月度仓储费 1到9月份([标准(长*宽*高*0.0005787)*$0.69/30][超标(长*宽*高*0.0005787)*$0.48/30]])
              </div>
              <div>
                10到12月份([标准(长*宽*高*0.0005787)*$2.40/30]][超标(长*宽*高*0.0005787)*$1.20/30]])【高于毛利50%标红】
              </div>
              <div>
                当“平台站点店铺”筛选项被多选时，对应搜索结果，该字段的Total行将统一转换成美元币种汇总
              </div>
            </div>
            <span>FBA仓储费</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <span :class="[row.storageColor===1 ? 'blue' : 'red']">{{ row.storage }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column field="age" title="Age" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" content="Exceed Inventory Age  超库龄库存 【有库存库龄高于180天标红】" placement="top">
            <span>Age</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <span :class="[row.ageColor===1 ? 'blue' : 'red']">{{ row.age }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column field="supply" title="Supply" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" content="Days of Supply  FBA可售库存/最近7日平均销量(Ordered) 【高于90标红，低于45标绿】" placement="top">
            <span>Supply</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <span v-if="row.supplyColor===1">{{ row.supply }}</span>
          <span v-if="row.supplyColor===2" class="red">{{ row.supply }}</span>
          <span v-if="row.supplyColor===3" class="green">{{ row.supply }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column field="rank" title="大类排名" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" placement="top">
            <div slot="content">
              <div>
                Best Seller Ranking 大类排名。
              </div>
              <div>
                按照筛选日期，呈现“筛选结束日期”的取值。
              </div>
              <div>
                因爬虫存在不稳定性，若某Style在“筛选结束日期”当天未爬取到值，则呈现其离“筛选结束日期”最近的一天的不为空的取值。
              </div>
              <div>
                字段右侧箭头的对比规则说明：若某Style在“筛选结束日期”当天或前一天未爬取到值，则取其离“筛选结束日期”最近的两天的不为空的取值做差值对比。
              </div>
            </div>
            <span>大类排名</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <el-popover
            placement="top"
            trigger="hover"
            :disabled="!row.rankTrend"
          >
            <span v-if="+row.rankTrend>0">+</span>
            <span>{{ +row.rankTrend }}</span>
            <span slot="reference" class="blue" style="cursor: pointer;">
              <span>{{ row.rank }}</span>
              <span v-if="+row.rankTrend>0" class="el-icon-top  arrow-red" />
              <span v-if="+row.rankTrend<0" class="el-icon-bottom  arrow-green" />
            </span>
          </el-popover>
        </template>
      </vxe-table-column>
      <vxe-table-column field="rank1" title="小类排名1" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" placement="top">
            <div slot="content">
              <div>
                Category Ranking 小类排名。
              </div>
              <div>
                按照筛选日期，呈现“筛选结束日期”的取值。
              </div>
              <div>
                因爬虫存在不稳定性，若某Style在“筛选结束日期”当天未爬取到值，则呈现其离“筛选结束日期”最近的一天的不为空的取值。
              </div>
              <div>
                字段右侧箭头的对比规则说明：若某Style在“筛选结束日期”当天或前一天未爬取到值，则取其离“筛选结束日期”最近的两天的不为空的取值做差值对比。
              </div>
            </div>
            <span>小类排名1</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <el-popover
            placement="top"
            trigger="hover"
            :disabled="!row.rank1Trend"
          >
            <span v-if="+row.rank1Trend>0">+</span>
            <span>{{ +row.rank1Trend }}</span>
            <span slot="reference" class="blue" style="cursor: pointer;">
              <span>{{ row.rank1 }}</span>
              <span v-if="+row.rank1Trend>0" class="el-icon-top  arrow-red" />
              <span v-if="+row.rank1Trend<0" class="el-icon-bottom  arrow-green" />
            </span>
          </el-popover>
        </template>
      </vxe-table-column>
      <vxe-table-column field="rank2" title="小类排名2" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" placement="top">
            <div slot="content">
              <div>
                Category Ranking 小类排名。
              </div>
              <div>
                按照筛选日期，呈现“筛选结束日期”的取值。
              </div>
              <div>
                因爬虫存在不稳定性，若某Style在“筛选结束日期”当天未爬取到值，则呈现其离“筛选结束日期”最近的一天的不为空的取值。
              </div>
              <div>
                字段右侧箭头的对比规则说明：若某Style在“筛选结束日期”当天或前一天未爬取到值，则取其离“筛选结束日期”最近的两天的不为空的取值做差值对比。
              </div>
            </div>
            <span>小类排名2</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <el-popover
            placement="top"
            trigger="hover"
            :disabled="!row.rank2Trend"
          >
            <span v-if="+row.rank2Trend>0">+</span>
            <span>{{ +row.rank2Trend }}</span>
            <span slot="reference" class="blue" style="cursor: pointer;">
              <span>{{ row.rank2 }}</span>
              <span v-if="+row.rank2Trend>0" class="el-icon-top  arrow-red" />
              <span v-if="+row.rank2Trend<0" class="el-icon-bottom  arrow-green" />
            </span>
          </el-popover>
        </template>
      </vxe-table-column>
      <vxe-table-column field="averageGrade" title="星级" min-width="100" sortable>
        <template #header>
          <el-tooltip effect="dark" placement="top">
            <div slot="content">
              <div>
                Parent ASIN对应的星级；当有多个Parent ASIN时，取平均值。
              </div>
              <div>
                按照筛选日期，呈现“筛选结束日期”的取值。
              </div>
              <div>
                因爬虫存在不稳定性，若某Style在“筛选结束日期”当天未爬取到值，则呈现其离“筛选结束日期”最近的一天的不为空的取值。
              </div>
              <div>
                字段右侧箭头的对比规则说明：若某Style在“筛选结束日期”当天或前一天未爬取到值，则取其离“筛选结束日期”最近的两天的不为空的取值做差值对比。
              </div>
            </div>
            <span>星级</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <el-popover
            placement="top"
            trigger="hover"
            :disabled="!row.averageGradeTrend"
          >
            <span v-if="+row.averageGradeTrend>0">+</span>
            <span>{{ +row.averageGradeTrend }}</span>
            <span slot="reference" class="blue" style="cursor: pointer;">
              <span>{{ +row.averageGrade }}</span>
              <span v-if="+row.averageGradeTrend>0" class="el-icon-top  arrow-red" />
              <span v-if="+row.averageGradeTrend<0" class="el-icon-bottom  arrow-green" />
            </span>
          </el-popover>
        </template>
      </vxe-table-column>
      <vxe-table-column field="goodCommentNum" title="好评|差评" min-width="150" sortable>
        <template #header>
          <el-tooltip effect="dark" placement="top">
            <div slot="content">
              <div>
                爬虫取值数据，因爬虫存在不稳定性，若好评|差评显示为0，则表示在排名数据取值对应日期，未抓取到评论数量信息。
              </div>
              <div>
                或者是评论数量的确为0。字段右侧箭头的对比规则说明：最近两天不为空的取值的差值对比。
              </div>
            </div>
            <span>好评|差评</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <el-popover
            placement="top"
            trigger="hover"
            :disabled="!row.goodCommentNumTrend"
          >
            <span v-if="+row.goodCommentNumTrend>0">+</span>
            <span>{{ +row.goodCommentNumTrend }}</span>
            <span slot="reference" style="cursor: pointer;">
              <span>{{ +row.goodCommentNum }}</span>
              <span v-if="+row.goodCommentNumTrend>0" class="el-icon-top  arrow-red" />
              <span v-if="+row.goodCommentNumTrend<0" class="el-icon-bottom  arrow-green" />
            </span>
          </el-popover>
          <span> | </span>
          <el-popover
            placement="top"
            trigger="hover"
            :disabled="!row.badCommentNumTrend"
          >
            <span v-if="+row.badCommentNumTrend>0">+</span>
            <span>{{ +row.badCommentNumTrend }}</span>
            <span slot="reference" style="cursor: pointer;">
              <span>{{ +row.badCommentNum }}</span>
              <span v-if="+row.badCommentNumTrend>0" class="el-icon-top  arrow-red" />
              <span v-if="+row.badCommentNumTrend<0" class="el-icon-bottom  arrow-green" />
            </span>
          </el-popover>
        </template>
      </vxe-table-column>
      <vxe-table-column field="firstDeliveryTime" title="第一次接受库存日期" min-width="160" sortable />
      <vxe-table-column field="postDate" title="上架日期" min-width="150" />
    </vxe-table>

    <CommonLintChart
      :common-lint-chart-visible.sync="commonLintChartVisible"
      :common-lint-chart-data="commonLintChartData"
      @legendSelectChanged="legendSelectChanged"
      @reset="reset"
    >
      <el-date-picker
        v-model="commonLintChartDate"
        type="daterange"
        value-format="yyyy-MM-dd"
        :clearable="false"
        range-separator="~"
        start-placeholder="起始时间"
        end-placeholder="结束时间"
        @change="handleCommonLintChartDateChange"
      />
    </CommonLintChart>

    <SalesHistory :sales-history-visible.sync="salesHistoryVisible" :style-value="styleValue" :style-list="styleList" />
    <DialogExport :visible.sync="exportAllVisible" :query-params="queryParams" />
  </div>
</template>

<script>
import VxeColumnSettings from '@/components/VxeColumnSettings'
import CascadeSelector from '@/components/CascadeSelector'
import ErpSelection from '@/components/ErpSelection'
import SalesHistory from './components/SalesHistory'
import DialogExport from './components/DialogExport'
import CommonLintChart from './components/CommonLintChart'
import VirtualizedSelect from '@/components/VirtualizedSelect'
import {
  commonLintChartConfig, urlMap, totalMap,
  tempTableData as saveSoldDetailTableData,
  chartSelected, lineChartOption,
} from './config'
import { getStyleList } from '@/api/erp-select'
import { debounceGetTableMaxHeight, getCommodityDictByKey, jumpToDownloadMessage } from '@/utils'
import XEUtils from 'xe-utils'
import {
  saleStatisticsList,
  chartByOrderRankSessions,
  getMonthChart,
  getSkuSalesByStyle,
  statisticsExportByDate,
  statisticsTotal,
  getDistinctAsinList,
} from '@/api/erp/operation'
import { getUserDefaultSite } from '@/api/erp/common'
import { mapGetters } from 'vuex'

import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

export default {
  components: {
    CascadeSelector,
    ErpSelection,
    VxeColumnSettings, VirtualizedSelect,
    CommonLintChart, SalesHistory, DialogExport,
  },
  data() {
    return {
      form: {
        platformSiteShop: [],
        buUser: [],
        combatTeam: undefined,
        userId: [],
        styleId: [],
        crawlAsin: [],
        season: [],
        vendorId: [],
        categoryId: [],
        positionId: [],
        saleStatus: '1',
        time: [dayjs().subtract(1, 'day').format('YYYY-MM-DD'), dayjs().subtract(1, 'day').format('YYYY-MM-DD')],
      },
      formRules: {
        platformSiteShop: [
          { required: true, message: '请选择平台 / 站点 / 店铺', trigger: ['change', 'blur'] },
        ],
        time: [
          {
            validator: (rule, value, callback) => {
              if (value && value.length > 1) {
                const start = dayjs(value[0]).valueOf()
                const end = dayjs(value[1]).valueOf()
                if (end > (dayjs(start).add(1, 'year').valueOf())) {
                  callback(new Error('时间范围不能超过一年'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            },
          },
        ],
      },
      pickerOptions: this.handlePickerOptions(),
      choiceTime: null,
      searchLoading: false,
      tableData: [],
      xTableRef: null,
      styleList: [],
      asinList: [],

      exportByDayLoading: false,
      maxHeight: '520',
      summaryData: {},
      defaultPlatformSiteShop: [],

      commonLintChartVisible: false,
      commonLintChartData: {
        xData: [],
        yData: [],
        title: '',
        isUtility: false,
        selected: {},
        loading: false,
      },
      commonLintChartDate: [],
      commonLintChartParams: {},

      saveQueryForm: {},
      soldDetailsTableData: [],
      soldDetailsLoading: false,

      salesHistoryVisible: false,
      styleValue: {},

      filterValue: '',
      fliterTableData: [],
      fliterTimer: null,

      // 暂存图表数据
      tempSaveChartData: {},
      // 趋势图当前展示的数据类型
      dataTypeList: ['soldData', 'priceData'],
      // 暂存当前行数据
      tempSaveCurrentRow: {},
      chartSelected: chartSelected,

      exportAllVisible: false,
    }
  },
  computed: {
    ...mapGetters('dictionary', ['wmsAllCommodityDict']),
    ctList() {
      return getCommodityDictByKey({
        key: 'COMBAT_TEAM',
        dict: this.wmsAllCommodityDict,
      })
    },
    buIdAndGroupId() {
      const _buId = new Set()
      const _groupId = new Set()
      if (this.form.buUser.length) {
        this.form.buUser.forEach(item => {
          item?.[0] && _buId.add(item[0])
          item?.[1] && _groupId.add(item[1])
        })
      }
      return { groupId: [..._groupId], buId: [..._buId] }
    },
    platformSiteShopParams() {
      const platformSiteShopMap = this.form.platformSiteShop.reduce((acc, cur) => {
        const [platformId, siteId, shopId] = cur
        platformId && acc.platformId.add(platformId)
        siteId && acc.siteId.add(siteId)
        shopId && acc.shopId.add(shopId)
        return acc
      }, { platformId: new Set(), siteId: new Set(), shopId: new Set() })
      return {
        platformId: [...platformSiteShopMap.platformId],
        siteId: [...platformSiteShopMap.siteId],
        shopId: [...platformSiteShopMap.shopId],
      }
    },
    queryParams() {
      const [startDate = '', endDate = ''] = this.form.time || []
      const platformSiteShopList = this.form.platformSiteShop.map(item => {
        const [platformId = '', siteId = '', shopId = ''] = item
        return {
          platformId,
          siteId,
          shopId,
        }
      })
      return Object.assign({}, this.form, {
        startDate,
        endDate,
        buId: this.buIdAndGroupId.buId, groupId: this.buIdAndGroupId.groupId,
        platformSiteShopList,
      })
    },
    userParams() {
      return { ...this.platformSiteShopParams, buId: this.buIdAndGroupId.buId, groupId: this.buIdAndGroupId.groupId }
    },
    styleParams() {
      return {
        ...this.platformSiteShopParams, buId: this.buIdAndGroupId.buId, groupId: this.buIdAndGroupId.groupId,
        combatTeamList: this.form.combatTeam ? [this.form.combatTeam] : [],
        selectedUser: this.form.userId, userId: this.$store.getters.userId,
      }
    },
    asinParams() {
      const platformSiteShopList = this.form.platformSiteShop.map(item => {
        const [platformId = '', siteId = '', shopId = ''] = item
        return {
          platformId,
          siteId,
          shopId,
        }
      })
      return {
        platformSiteShopList,
        userIds: this.form.userId.join(','),
      }
    },
  },
  watch: {
    'styleParams': {
      handler() {
        this.getStyleList()
      },
    },
    'asinParams': {
      handler() {
        this.getAsinList()
      },
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.debounceGetTableMaxHeight)

    saveSoldDetailTableData.clear()
  },
  mounted() {
    this.$nextTick(() => {
      this.xTableRef = this.$refs.table
    })

    this.getDefaultPlatformSiteShop()

    this.debounceGetTableMaxHeight = debounceGetTableMaxHeight.bind(this)
    this.debounceGetTableMaxHeight()
    window.addEventListener('resize', this.debounceGetTableMaxHeight)
  },
  methods: {
    // type style-style维度;color-color维度
    async handleLoadContentMethod({ row }) {
      const { datas = [] } = await saleStatisticsList({
        ...this.queryParams,
        // searchType 1-style维度;2-color维度
        searchType: 2,
        styleId: [row.styleId],
        platformSiteShopList: [{ platformId: row.platformId, siteId: row.siteId, shopId: row.shopId }],
      })
      if (datas.length === 0) {
        row.hasChild = false
      }
      return new Promise(resolve => {
        resolve(datas.map(item => ({ ...item, type: 'color', styleIdOrColor: item.platformId + '-' + item.siteId + '-' + item.shopId + '-' + item.styleId + '-' + item.color })))
      })
    },
    handleSalesHistory(row) {
      this.styleValue = row
      this.salesHistoryVisible = true
    },
    jumpToSalesInventoryAnalysis(row) {
      const obj = {
        styleId: row.styleId,
        platformId: row.platformId,
        siteId: row.siteId,
        shopId: row.shopId,
      }
      const url = this.$router.resolve({
        path: '/operation/sales-inventory-analysis',
        query: obj,
      })
      window.open(url.href, '_blank')
    },
    jumpToSalesAndInventory(row) {
      const url = this.$router.resolve({
        path: '/business-report/sales-distribution/sales-inventory-reports',
        query: {
          styleId: row.styleId,
          styleName: row.styleName,
          platformId: row.platformId,
          siteId: row.siteId,
          shopId: row.shopId,
          startDate: this.saveQueryForm.startDate,
          endDate: this.saveQueryForm.endDate,
        },
      })
      window.open(url.href, '_blank')
    },
    async showSoldDetails(row) {
      const key = row.type === 'style'
        ? row.platformId + '-' + row.siteId + '-' + row.shopId + '-' + row.styleId
        : row.platformId + '-' + row.siteId + '-' + row.shopId + '-' + row.styleId + '-' + row.color

      if (saveSoldDetailTableData.get(key)) {
        this.soldDetailsLoading = false
        // 检查是不是不需要深度冻结
        this.soldDetailsTableData = Object.freeze(saveSoldDetailTableData.get(key))
        return
      }
      const obj = {
        startDate: this.saveQueryForm.startDate,
        endDate: this.saveQueryForm.endDate,
        platformId: row.platformId,
        siteId: row.siteId,
        shopId: row.shopId,
        styleId: row.styleId,
      }
      if (row.type === 'color') {
        obj.color = row.color
      }
      this.soldDetailsLoading = true
      const { datas = [] } = await getSkuSalesByStyle(obj).finally(() => {
        this.soldDetailsLoading = false
      })
      this.soldDetailsTableData = Object.freeze(datas)
      saveSoldDetailTableData.set(key, datas)
    },
    jumpToDetail(row, key) {
      window.open(`${urlMap[row.siteId]}${key}`)
    },
    async showUtilityLineChart(type, row) {
      let title = '指标趋势对比' + '-' + row.styleName
      if (row.type === 'color') {
        title += '-' + row.color
      }
      this.commonLintChartParams = { type, row }
      const [startDate, endDate] = this.commonLintChartDate || []
      const obj = {
        platformId: row.platformId,
        siteId: row.siteId,
        shopId: row.shopId,
        startDate,
        endDate,
        styleId: row.styleId,
        dataTypeList: this.dataTypeList,
      }
      if (row.type === 'color') {
        obj.color = row.color
      }
      this.commonLintChartVisible = true
      this.commonLintChartData.loading = true
      const { datas: { newSalesChartDataVO: { chartData = {}}, xaxisName = [] }} = await chartByOrderRankSessions(obj)
      this.commonLintChartData.title = title
      this.commonLintChartData.xData = xaxisName
      this.tempSaveChartData = Object.freeze(chartData)
      this.tempSaveCurrentRow = row
      this.inintChartData(this.chartSelected)
      this.commonLintChartVisible = true
      this.commonLintChartData.loading = false
    },
    inintChartData(chartSelected) {
      this.commonLintChartData.yData = []
      // y轴数据
      const yIndex = new Map()
      let index = 0
      lineChartOption.forEach((item) => {
        const markPoint = []
        const name = item.name.split('-')[0]
        if (!yIndex.has(name) && chartSelected[item.name]) {
          yIndex.set(name, index)
          index++
        }
        const obj = {
          name: item.name,
          type: 'line',
          data: this.tempSaveChartData?.[item.yAxisfieldFirst]?.[item.yAxisfieldSecond] || [],
          yAxisIndex: (yIndex.get(name) && chartSelected[item.name]) ? yIndex.get(name) : 0,
          markPoint: {},
        }
        if (item?.showMarkPoint) {
          const year = item.yAxisfieldSecond.slice(0, -4)
          const _ldData = this.tempSaveChartData?.[item.yAxisfieldFirst]?.[`${year}LDData`] || []
          const _7ddData = this.tempSaveChartData?.[item.yAxisfieldFirst]?.[`${year}7DDData`] || []
          const _dotdData = this.tempSaveChartData?.[item.yAxisfieldFirst]?.[`${year}DOTDData`] || []
          if (_ldData.length) {
            _ldData.forEach((it) => {
              markPoint.push({
                symbol: 'triangle',
                symbolSize: 15,
                coord: it,
              })
            })
          }
          if (_7ddData.length) {
            _7ddData.forEach((it) => {
              markPoint.push({
                symbol: 'circle',
                symbolSize: 10,
                coord: it,
              })
            })
          }
          if (_dotdData.length) {
            _dotdData.forEach((it) => {
              markPoint.push({
                symbol: 'roundRect',
                symbolSize: 10,
                coord: it,
              })
            })
          }
        }
        obj.markPoint.data = markPoint
        this.commonLintChartData.yData.push(obj)
      })
      // y轴
      const yAxisMap = new Map()
      let i = 0
      this.commonLintChartData.yData.forEach((item) => {
        const name = item.name.split('-')[0]
        if (!yAxisMap.has(name) && chartSelected[item.name]) {
          const obj = {
            type: 'value',
            name: name,
            axisLine: { show: true },
            axisTick: { show: true },
            splitLine: { show: false },
            offset: i > 1 ? 70 * (i - 1) : 0,
          }
          if (['ACoS', '转化率'].includes(name)) {
            obj.axisLabel = {
              formatter: '{value}%', // 右侧Y轴文字显示
            }
          }
          i++
          yAxisMap.set(name, obj)
        }
      })
      this.commonLintChartData.yAxis = [...yAxisMap.values()]
      this.commonLintChartData.isUtility = true
      this.commonLintChartData.selected = chartSelected
    },
    legendSelectChanged(chartSelected) {
      const selectKeys = Object.keys(chartSelected)
      const selectKeysShow = selectKeys.filter((key) => chartSelected[key])
      const dataTypeListSet = new Set()
      if (selectKeysShow.every((key) => {
        const line = lineChartOption.find((it) => it.name === key)
        dataTypeListSet.add(line.yAxisfieldFirst)
        return this.dataTypeList.includes(line.yAxisfieldFirst)
      })) {
        this.dataTypeList = [...dataTypeListSet]
        this.inintChartData(chartSelected)
      } else {
        this.dataTypeList = []
        selectKeys?.forEach((item) => {
          const line = lineChartOption.find((it) => it.name === item)
          if (!this.dataTypeList.includes(line.yAxisfieldFirst) && chartSelected[item]) {
            this.dataTypeList.push(line.yAxisfieldFirst)
          }
        })
        this.chartSelected = chartSelected
        this.showUtilityLineChart('Utility', this.tempSaveCurrentRow)
      }
    },
    async showCommonLineChart(type, row) {
      let title = row.styleName
      if (row.type === 'color') {
        title += '-' + row.color
      }
      this.commonLintChartParams = { type, row }
      const itemData = commonLintChartConfig.find((item) => item.type === type)
      const [startDate, endDate] = this.commonLintChartDate || []
      this.commonLintChartVisible = true
      const obj = {
        platformId: row.platformId,
        siteId: row.siteId,
        shopId: row.shopId,
        startDate,
        endDate,
        type: itemData.params,
        styleId: row.styleId,
      }
      if (row.type === 'color') {
        obj.color = row.color
      }
      const { datas: { newSalesChartDataVO: { chartData = {}, xaxisName = [] }}} = await getMonthChart(obj).finally(() => {
        this.commonLintChartVisible = true
      })
      this.commonLintChartData.xData = xaxisName
      const data = chartData?.[`${type.toLowerCase()}Data`] || {}
      const year = [
        { filed: 'nowYear', name: itemData.name },
        { filed: 'lastYear', name: '去年同期' },
        { filed: 'beforeLastYear', name: '前年同期' },
      ]
      this.commonLintChartData.yData = []
      year.forEach((key) => {
        const markPoint = []
        let obj = {}
        if (data?.[`${key.filed}Data`]) {
          obj = {
            name: key.name,
            data: data?.[`${key.filed}Data`] || [],
            type: 'line',
            markPoint: {},
          }
          const _ldData = data?.[`${key.filed}LDData`] || []
          const _7ddData = data?.[`${key.filed}7DDData`] || []
          const _dotdData = data?.[`${key.filed}DOTDData`] || []
          if (_ldData.length) {
            _ldData.forEach((it) => {
              markPoint.push({
                symbol: 'triangle',
                symbolSize: 15,
                coord: it,
              })
            })
          }
          if (_7ddData.length) {
            _7ddData.forEach((it) => {
              markPoint.push({
                symbol: 'circle',
                symbolSize: 10,
                coord: it,
              })
            })
          }
          if (_dotdData.length) {
            _dotdData.forEach((it) => {
              markPoint.push({
                symbol: 'roundRect',
                symbolSize: 10,
                coord: it,
              })
            })
          }
          obj.markPoint.data = markPoint
        }
        this.commonLintChartData.yData.push(obj)
      })
      this.commonLintChartData.yAxis = [{
        type: 'value',
        name: itemData.name,
        axisLine: { show: true },
        axisTick: { show: true },
        splitLine: { show: false },
      }]
      this.commonLintChartData.title = title
      this.commonLintChartData.selected = []
      this.commonLintChartData.isUtility = false
    },
    handleCommonLintChartDateChange() {
      if (this.commonLintChartParams.type === 'Utility') {
        this.showUtilityLineChart(
          this.commonLintChartParams.type,
          this.commonLintChartParams.row,
        )
      } else {
        this.showCommonLineChart(
          this.commonLintChartParams.type,
          this.commonLintChartParams.row,
        )
      }
    },
    reset() {
      this.commonLintChartDate = []
    },
    async handleExportAll() {
      this.exportAllVisible = true
    },
    async handleExportByDay() {
      this.exportByDayLoading = true
      const { success, msg } = await statisticsExportByDate(this.saveQueryForm).finally(() => {
        this.exportByDayLoading = false
      })
      if (success) {
        jumpToDownloadMessage.bind(this)(msg)
      }
    },
    async getAsinList() {
      const { datas = [] } = await getDistinctAsinList(this.asinParams)
      this.asinList = Object.freeze(datas)
    },
    async getStyleList() {
      const { data = [] } = await getStyleList(this.styleParams)
      this.styleList = Object.freeze(data)
    },
    async getDefaultPlatformSiteShop() {
      const { datas = [] } = await getUserDefaultSite({ userId: this.$store.getters.userId })
      this.defaultPlatformSiteShop = datas
      this.form.platformSiteShop = [this.defaultPlatformSiteShop]
    },
    responseUserData(val) {
      if (val.find(item => item.userId === this.$store.getters.userId)) {
        this.form.userId = [this.$store.getters.userId]
      }
    },
    handleReset() {
      this.$refs.form?.resetFields()
      this.xTableRef?.clearSort()
      this.form.platformSiteShop = [this.defaultPlatformSiteShop]
    },
    handleQuery() {
      this.$refs?.form.validate(async(valid) => {
        if (!valid) return
        this.xTableRef?.clearTreeExpand()
        this.saveQueryForm = this.queryParams
        saveSoldDetailTableData.clear()
        this.dataTypeList = ['soldData', 'priceData']
        this.chartSelected = chartSelected
        this.getTableData()
      })
    },
    async getTableData() {
      await this.getSummary()
      this.searchLoading = true
      const { datas = [] } = await saleStatisticsList({
        ...this.queryParams,
        // searchType 1-style维度;2-color维度
        searchType: 1,
      }).finally(() => {
        this.searchLoading = false
      })
      // type style-style维度;color-color维度
      this.tableData = datas.map(item => {
        return {
          ...item,
          children: [], hasChild: true, type: 'style',
          styleIdOrColor: item.platformId + '-' + item.siteId + '-' + item.shopId + '-' + item.styleId,
        }
      })
      this.fliterTableData = this.tableData
    },
    async getSummary() {
      this.searchLoading = true
      const { datas } = await statisticsTotal(this.queryParams).finally(() => {
        this.searchLoading = false
      })
      this.summaryData = Object.freeze(datas)
    },
    footerMethod({ columns, data }) {
      const result = []
      columns.forEach((column, columnIndex) => {
        if (totalMap?.[column?.property]) {
          if (column.property === 'sales' || column.property === 'price') {
            result.push(this.summaryData?.totalCurrencySymbol ? this.summaryData?.totalCurrencySymbol + this.summaryData?.[totalMap[column.property]] : this.summaryData?.[totalMap[column.property]] || 0)
          } else {
            result.push(this.summaryData?.[totalMap[column.property]])
          }
        } else if (columnIndex === 0) {
          result.push('合计')
        } else {
          result.push('-')
        }
      })
      return [result]
    },
    searchEvent() {
      clearTimeout(this.fliterTimer)
      this.fliterTimer = setTimeout(() => {
        const filterValue = XEUtils.toValueString(this.filterValue).trim().toLowerCase()
        if (filterValue) {
          const searchProps = [
            'platformSiteShop', 'crawlAsin', 'styleName', 'position', 'vendorName',
            'season', 'bu', 'combatTeam', 'brandName', 'category', 'quantity', 'sales',
            'price', 'discountRate', 'returnQuantity', 'returnRate', 'acos', 'clicks',
            'orders', 'session', 'unit', 'inventory', 'totalCan', 'storage', 'age',
            'supply', 'rank', 'rank1', 'rank2', 'averageGrade', 'goodCommentNum', 'badCommentNum',
            'firstDeliveryTime', 'postDate',
          ]
          this.tableData = this.fliterTableData.filter(item => searchProps.some(key => XEUtils.toValueString(item[key]).toLowerCase().indexOf(filterValue) > -1))
        } else {
          this.tableData = this.fliterTableData
        }
      }, 200)
    },
    handlePickerOptions() {
      return {
        onPick: ({ maxDate, minDate }) => {
          this.choiceTime = minDate.getTime()
          if (maxDate) this.choiceTime = null
        },
        disabledDate: (time) => {
          if (this.choiceTime) {
            const minTime = dayjs(this.choiceTime).subtract(1, 'year').valueOf()
            const maxTime = dayjs(this.choiceTime).add(1, 'year').valueOf()
            return (
              time.getTime() < minTime ||
              time.getTime() > maxTime
            )
          }
          return false
        },
      }
    },
    setRowClass({ row }) {
      if (row.type === 'color') {
        return 'color-row'
      }
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep .vxe-table .color-row {
  background: #ededed;
}
.blue{
  color: blue;
}
.red{
  color: red;
}
.green{
  color: green;
}
.arrow-red{
  font-size: 14px;vertical-align: text-bottom;color: red;font-weight: bold;
}
.arrow-green{
  font-size: 14px;vertical-align: text-bottom;color: green;font-weight: bold;
}
::v-deep .vxe-table--main-wrapper {
  display: flex;
  flex-direction: column;
}
::v-deep .vxe-table--body-wrapper {
  order: 1;
}
::v-deep .vxe-table--footer-wrapper{
  background-color: #f8f8f9;
  margin-top: -1px !important;
  &::-webkit-scrollbar {
    display: none;
  }
}
::v-deep .xTable .vxe-table--empty-placeholder{
  top: 70px !important;
}
::v-deep .vxe-table--fixed-left-wrapper,
::v-deep .vxe-table--fixed-right-wrapper{
  // 调整滚动条遮挡
  height: calc(100% - 17px) !important;
  & .vxe-table--body-wrapper{
    top: 80px !important;
  }
  & .vxe-table--footer-wrapper{
    top: 41px !important;
  }
}
::v-deep .vxe-table--fixed-left-wrapper{
  // 调整滚动条遮挡
  & .vxe-table--body-wrapper{
    max-height: calc(100% - 80px) !important;
    &::-webkit-scrollbar {
      display: none;
    }
  }
}
::v-deep .vxe-table--fixed-right-wrapper{
  // 调整滚动条遮挡
  & .vxe-table--body-wrapper{
    max-height: calc(100% - 63px) !important;
  }
}
</style>
<style lang="scss">
.el-popover{
  min-width: 50px!important;
}
</style>
