<template>
  <div class="editTableWrapper" ref="editTableWrapper" >

    <table class="editTable__block" v-if="rowData.length > 0 && colData.length === 0" style="width: 100%">
        <table-row-head v-if="rowData.length > 0"
            :headers="headers"
            class="fix north__east"
            :allRow="false">
        </table-row-head>
        <tr v-for="(x, xindex) in tableData" :key="xindex">
            <td v-for="(y, yindex) in lastDataRow" :key="yindex + '_' + xindex" :style="tdStyle">
            {{x[y.id] || ""}}
            </td>
        </tr>
    </table>

  </div>
</template>
<script>

import TableRowHead from "./TableRowHead.vue";
/**
 * 展开树形结构数据
 */
const getAllColumns = columns => {
  const result = [];
  columns.forEach(column => {
    if (column.children) {
      result.push(column);
      result.push.apply(result, getAllColumns(column.children));
    } else {
      result.push(column);
    }
  });
  return result;
};
/**
 * 计算单元格的colsapn，用于合并列
 * 计算单元格所属的层级
 * @param {*} originColumns，是指第一层级的元素
 */
const headersToRows = originColumns => {
  // window.console.log(originColumns);
  let maxLevel = 1;

  const traverse = (column, parent) => {
    // window.console.log(parent);
    if (parent) {
      //计算当前元素属于第几个层级
      column.level = parent.level + 1;
      if (maxLevel < column.level) {
        //计算最大层级
        maxLevel = column.level;
      }
    }
    if (column.children) {
      let colSpan = 0;
      column.children.forEach(subColumn => {
        //进行递归
        traverse(subColumn, column);

        colSpan += subColumn.colSpan;
      });
      column.colSpan = colSpan;
    } else {
      column.colSpan = 1;
    }
  };

  // 计算值colspan（上一层等于下一层相加）
  originColumns.forEach(column => {
    column.level = 1;
    traverse(column);
  });

  const rows = [];
  let lastData = [];
  window.console.log(rows);
  // 预先加载层级
  for (let i = 0; i < maxLevel; i++) {
    rows.push([]);
  }
  // window.console.log(rows);
  const allColumns = getAllColumns(originColumns);
  window.console.log(allColumns);
  allColumns.forEach(column => {
    if (!column.children) {
      column.rowSpan = maxLevel - column.level + 1;
      lastData.push(column);
    } else {
      column.rowSpan = 1;
    }
    rows[column.level - 1].push(column);
  });
  window.console.log(lastData)
  return { rows: rows, lastData: lastData };
};

export default {
  name: 'RowTable',
  components: {TableRowHead},
  data() {
    return {
      count: 0,
      data: [],
      //初始化数据
      initTable: [],
      scrollX: 0,
      scrollY: 0,
      clientWidth: 0,
      clientHeight: 0,
      tdHeight: [],
      tableClientX: 0,
      tableClientY: 0,
      actualAll: 0,
      tdStyle: {
        width: this.headColWidth + "px",
        height: this.tableTdHeight + "px",
        textAlign: "center"
      }
      
    };
  },
  provide() {
    return {
      edit: this
    };
  },
  computed: {
    //横向表头的初始化数据
    headers() {
      if(this.rowData.length > 0) {
        let data = JSON.parse(JSON.stringify(this.rowData));
        return data;
      } else {
        return []
      }
      
    },
    //获得横向表头的数据
    resetRow() {
      return headersToRows(this.headers);
    },
    //横向表头  tr和td的数据
    resetNewRowHead() {
      let data = this.resetRow;
      return data.rows;
    },
    lastDataRow() {
      let data = this.resetRow;
      return data.lastData;
    },
    //获得横向头部分层的数组
    allHeadRow() {
      return this.resetNewRowHead ? this.resetNewRowHead : []
    },
    //获得横向头部最后一行的数组
    actualFields() {
      return this.lastDataRow;
    },
    //横向表格的宽度
    colheadWidth() {
      let width = 0;
      if (this.colHead.length > 0) {
        if (this.resetNewColHead.length > 0) {
          this.resetNewColHead[0].forEach(() => {
            width += this.headColWidth;
          });
        }
      }
      return width;
    },
    actualHeight() {
      this.heightAdaption();
      let height = 0;
      if (this.headers.length > 0) {
        height += this.headerHeight;
      }
      if (this.colHead.length > 0) {
        height += this.lastDataCol.length * (this.tableTdHeight + 1);
      }
      if (height < this.actualAll) {
        height = this.actualAll;
      }
      return height;
    },
    //纵向表头tr 和td的数据
    resetCol() {
      return convertToRows(this.colHead);
    },
    resetNewColHead() {
      let colRowData = this.resetCol;
      return colRowData.colRow;
    },
    lastDataCol() {
      let colRowData = this.resetCol;
      return colRowData.lastData;
    },

    /**
     * 表格的数据分为三种形式
     * 当是横向表头表格时，表格的数据为Array
     * 当是纵向表头表格时，表格的数据为Array
     * 当是多项表头表格时，表格的数据为Object
     */
    tableData() {
      let arr;
      arr = [...this.tableValue]
      return arr;
      
      
    },
    
    //横向表头的高度
    headerHeight() {
      let height = this.allHeadRow.map(() => this.tableTdHeight).reduce((total, current) => total + current);
      return height;
    },
    actualWidth() {
      let width = 0;
      if (this.headers.length > 0) {
        width = this.lastDataRow.map(() => this.headColWidth).reduce((total, current) => total + current);
      } else {
        width = 0;
      }
      width = width + this.colheadWidth + this.allColHeadRow.length;
      return width;
    },
    actualWidth1() {
      let width = 0;
      if (this.headers.length > 0) {
        width = this.lastDataRow.map(() => this.headColWidth).reduce((total, current) => total + current);
      } else {
        width = 0;
      }
      return width;
    },

    editTableStyle() {
      return {
        height: "100%",
        width: `calc(100% - ${this.colheadWidth + this.allColHeadRow.length - 3}px)`,
        marginLeft: this.colheadWidth + this.allColHeadRow.length - 3 + "px"
      };
    },

    //左上角
    northWestStyle() {
      return {
        width: this.colheadWidth + "px"
        // height: this.tableHeaderHeight + "px"
      };
    },
    //左下角
    southWestStyle() {
      return { top: -this.scrollY + "px", width: this.colheadWidth + "px", left: "0px" };
    },
    //右上角
    northEastStyle() {
      return {
        position: "absolute",
        left: -this.scrollX + this.colheadWidth + "px",
        width: this.colHead.length > 0 ? this.actualWidth1 - 2 + "px" : "",
        minWidth: `calc(100% - ${this.colheadWidth}px)`,
        zIndex: 10,
        top: 0
      };
    },
    allTable() {
      return {
        position: "absolute",
        left: -this.scrollX + this.colheadWidth + "px",
        width: this.actualWidth1 + "px",
        minWidth: `calc(100% - ${this.colheadWidth}px)`,
        zIndex: 0,
        top: -this.scrollY  + "px"
      };
    },
    northEastStyle1() {
      return {
        width: "100%",
        minWidth: "100%",
        position: "relative"
      };
    },
    //右下角
    rightBottomStyle() {
      return {
        minWidth: "100%",
        width: "100%",
        position: "relative",
        
      };
    }
  },
  props: {
    getData: Object,
    colData: {
      type: Array,
      default() {
        return []
      }
    },
    rowData: {
      type: Array,
      default() {
        return []
      }
    },
    //表格里面的展示数据
    tableValue: {
      type: [Object, Array],
      default() {
        if(this.rowData.length > 0 && this.colData.length === 0) {
          //横向表头的表格
          return []
        } else if(this.colData.length > 0 && this.rowData.length === 0) {
          //纵向表头的表格
          return []
        } else {
          //多表头的数据
          return {}
        }
      }
    },
    tableTdHeight: {
      type: Number,
      default: 40
    },
    headColWidth: {
        type: Number,
        default: 80
    },

  },
  watch: {
  },
  mounted() {
    let self = this;
    this.heightAdaption();
    // this.allTableHeight 元素高度

    // 监听窗口大小变化
    window.onresize = () => {
      if (self.currentSelect) {
        let parentTarget = "";
        if (self.currentSelect.target.nodeName == "TD") {
          parentTarget = self.currentSelect.target;
        } else {
          parentTarget = self.getParentTag(self.currentSelect.target);
        }
        self.drag.width = parentTarget.offsetWidth;
        self.drag.cirLeft = self.drag.width - 4;
        self.drag.cirTop = self.drag.height - 4;
        self.drag.clientX = parentTarget.offsetLeft;
        self.drag.clientY = parentTarget.offsetTop;
      }
      this.heightAdaption();
    };
  },
  methods: {
    heightAdaption() {
      this.$nextTick(() => {
        this.allTableHeight =
          this.$refs.editTableWrapper && this.$refs.editTableWrapper.offsetHeight
            ? this.$refs.editTableWrapper.offsetHeight
            : 0;
        this.allTableWidth =
          this.$refs.editTableWrapper && this.$refs.editTableWrapper.offsetWidth
            ? this.$refs.editTableWrapper.offsetWidth
            : 0;

        window.console.log(this.allTableHeight);
      });
    },
    getParentTag(startTag) {
      var self = this;
      // 传入标签是否是DOM对象
      if (!(startTag instanceof HTMLElement)) return;
      // 父级标签是否是body,是着停止返回集合,反之继续
      if ("BODY" !== startTag.parentElement.nodeName) {
        if (startTag.parentElement.nodeName == "TD") {
          return startTag.parentElement;
        } else {
          if (startTag.parentElement.parentElement) {
            return self.getParentTag(startTag.parentElement);
          } else {
            return false;
          }
        }
        // 再上一层寻找
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.editTableWrapper {
  position: relative;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  overflow: hidden;

  .err-div {
    // position: absolute;
    top: 10px;
    height: 20px !important;
    line-height: 20px !important;
    background: rgba(245, 108, 108, 0.1);
    border: 1px solid rgba(245, 108, 108, 0.4);
    font-size: 12px;
    color: #f56c6c;
    z-index: 1000;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  table {
    table-layout: fixed;
  }
  th {
    background: #fff;
    font-size: 14px;
    color: #606266;
  }
}

.editTable {
  position: relative;
  overflow: hidden;
  border-top: 0;
  background: #fff;
  .th-div {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    div {
      height: 100%;
      .el-input {
        height: 100%;
        width: 100%;
      }
      .el-select {
        width: 100%;
      }
    }
    .el-input__inner {
      height: 100%;
      line-height: 100%;
      border: 0;
      outline: 0;
      background: transparent;
      padding-left: 6px;
      padding-right: 15px;
    }
    .el-date-editor .el-input__inner {
      padding-left: 30px;
    }
    .el-range-separator {
      visibility: hidden;
    }
    .el-range-input {
      background: transparent;
    }
  }
}
.edit-table-add {
  width: 100%;
  height: 40px;
  text-align: center;
  line-height: 40px;
  font-size: 14px;
  border: 1px dashed #dcdfe6;
  color: #303133;
  margin-top: 10px;
  cursor: pointer;
  svg {
    fill: #333333;
    vertical-align: middle;
    margin-right: 6px;
  }
}
.north__west {
  position: absolute;
  left: 0px;
  top: 0px;
  background: transparent;
  font-size: 14px;
  color: #606266;
  z-index: 113;
  th {
    background: #fff;
    font-size: 14px;
    color: #606266;
    z-index: 112;
    border: 1px solid #dcdfe6
  }
}
.south__west {
  z-index: 111;
  position: absolute;
  left: 0px;
  top: 0;
  th {
    background: #fff;
    font-size: 14px;
    color: #606266;
    z-index: 112;
  }
  td {
    font-size: 12px;

    background: #fff;
    color: #6a6a6a;
    svg {
      width: 20px;
      height: 20px;
      vertical-align: middle;
    }
  }
}
.north__east {
  top: 0px;
  min-width: 100%;
  z-index: 110;
  font-size: 14px;
  color: #606266;
  th {
    background: #fff;
  }
}
.activity__table {
  min-width: 100%;
  th {
    background: #fff;
    font-size: 14px;
    color: #606266;
  }
  td {
    font-size: 12px;
    color: #6a6a6a;
  }
}


.editTable__block {
  user-select: none;
  border-collapse: collapse;
  padding: 0;

  &::v-deep th,
  &::v-deep td {
    box-sizing: border-box;
    border: 1px solid #dcdfe6;
    font-size: 11px;
    color: #6a6a6a;
  }
}
.editTableWrapper {
  width: 100%;
  height: 100%;
}
.north__east-bottom{
  table{
        border-bottom: 0;

  }
  th {
    border-bottom: 0;
  }
}

.icon-ser {
  cursor: pointer;
}
.editTableWrapper .editTable .el-form-item--mini.el-form-item,
.el-form-item--small.el-form-item {
  margin-bottom: 0;
}
.editTableWrapper .el-form-item--small .el-form-item__error {
  z-index: 100;
}

.value-table {
  table {
    table-layout: fixed;
    min-width: 100%;
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
<style lang="scss">
.editTable__block {
  user-select: none;
  border-collapse: collapse;
  padding: 0;
  th,
  td {
    // box-sizing: border-box;
    border: 1px solid #dcdfe6;
    font-size: 12px;
    color: #6a6a6a;
  }
}
</style>
