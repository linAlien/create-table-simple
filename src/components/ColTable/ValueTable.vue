<template>
  <div class="value-table">
    <!-- 多表头表体 -->
    <!-- <table class="editTable__block" v-if="edit.rowData.length > 0 && edit.colData.length > 0">
      <tr v-for="(x, xindex) in edit.lastDataCol" :key="xindex">
        <td v-for="(y, yindex) in edit.lastDataRow" :key="yindex + '_' + xindex" :style="tdStyle">
          {{tableData[ y.id+ '__' + x.id] || ""}}
        </td>
      </tr>
    </table>  -->
    <!-- 横向表头表体 -->
    <!-- <table class="editTable__block" v-if="edit.rowData.length > 0 && edit.colData.length === 0">
      <tr v-for="(x, xindex) in tableData" :key="xindex">
        <td v-for="(y, yindex) in edit.lastDataRow" :key="yindex + '_' + xindex" :style="tdStyle">
          {{x[y.id] || ""}}
        </td>
      </tr>
    </table>  -->
    <!-- 纵向表头表体 -->
    <!-- width: (edit.headColWidth + 'px'), -->
    <table class="editTable__block" v-if="edit.rowData.length === 0 && edit.colData.length > 0">
      <tr v-for="(x, xindex) in edit.lastDataCol" :key="xindex">
        <td v-for="(y, yindex) in tableData" :key="yindex + '_' + xindex" 
        :style="{
        height: (x.height ? x.height:edit.tableTdHeight + 'px'),
        textAlign: 'center'
      }">
          {{y[x.id] || ""}}
        </td>
      </tr>
    </table> 
  </div>
  

</template>

<script>
export default {
  inject: ["edit"],
  props: {
    tableData: [Object, Array]
  },
  watch: {
    tableData: {
      immediate: true,
      deep: true,
      handler(val) {
        this.valueData = val;
        this.tableData = val;
      }
    },
    valueData: {
      deep: true,
      handler(val) {
        this.$emit("updata:tableData", val);
      }
    }
  },

  data() {
    return {
      valueData: {},
      tdStyle: {
        width: this.edit.headColWidth + "px",
        height: this.edit.tableTdHeight + "px",
        textAlign: "center"
      }
    };
  },
  methods: {
    change(data) {
      this.$emit("tdChange", data);
    }
  }
};
</script>

<style lang="scss" >
.value-table {
  table {
    table-layout: fixed;
    width: 100%;
  }
  .el-table td {
    padding: 0 !important;
    height: 40px;
    line-height: 40px;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .el-table th {
    padding: 0 !important;
    height: 39px;
    line-height: 39px;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .el-table .cell {
    padding: 0;
    padding-left: 0;
  }
  .el-input__inner {
    border: 0;
    background: transparent;
  }
}

</style>
