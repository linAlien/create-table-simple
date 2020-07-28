<template>
  <div class="editTableWrapper" ref="editTableWrapper" >
    <col-head
      v-if="colData.length > 0"
      :onlyFix="true"
      :allRow="true"
      :style="southWestStyle"
    ></col-head>
    <div :style="allTable" class="value-data-div">
      <value-table
        v-if="colData.length > 0 || rowData.length > 0"
        :style="rightBottomStyle"
        :tableData.sync="tableData"
      >
      </value-table>
    </div>
  </div>
</template>
<script>
import ColHead from "./ColHead.vue";
import ValueTable from "./ValueTable.vue";

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

const convertToRows = originColumns => {
  let maxLevel = 1;
  const traverse = (column, parent) => {
    if (parent) {
      column.level = parent.level + 1;
      if (maxLevel < column.level) {
        maxLevel = column.level;
      }
    }
    if (column.children) {
      let colSpan = 0;
      column.children.forEach(subColumn => {
        traverse(subColumn, column);
        colSpan += subColumn.colSpan;
      });
      column.colSpan = colSpan;
    } else {
      column.colSpan = 1;
    }
  };

  originColumns.forEach(column => {
    column.level = 1;
    traverse(column);
  });

  const rows = [];
  for (let i = 0; i < maxLevel; i++) {
    rows.push([]);
  }
  const allColumns = getAllColumns(originColumns);

  allColumns.forEach(column => {
    if (!column.children) {
      column.rowSpan = maxLevel - column.level + 1;
    } else {
      column.rowSpan = 1;
    }
    rows[column.level - 1].push(column);
  });

  let count = 0;
  let colRow = [];
  let lastData = [];
  let cell = [];
  for (let i = 0; i < maxLevel; i++) {
    cell.push(null);
  }
  allColumns.forEach(column => {
    let newCell = JSON.parse(JSON.stringify(cell));
    if (column.level === maxLevel || !column.children) {
      colRow[count] = newCell;
      count++;
    }
  });

  let colRowIndex = 0;
  allColumns.forEach(column => {
    if (column.level === maxLevel || !column.children) {
      colRow[colRowIndex][column.level - 1] = column;
      lastData.push(column);
      colRowIndex++;
    } else {
      colRow[colRowIndex][column.level - 1] = column;
    }
  });
  return { colRow: colRow, lastData: lastData };
};

const headersToRows = originColumns => {
  let maxLevel = 1;
  const traverse = (column, parent) => {
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

  originColumns.forEach(column => {
    column.level = 1;
    traverse(column);
  });
  const rows = [];
  let lastData = [];
  for (let i = 0; i < maxLevel; i++) {
    rows.push([]);
  }
  const allColumns = getAllColumns(originColumns);
  allColumns.forEach(column => {
    if (!column.children) {
      column.rowSpan = maxLevel - column.level + 1;
      lastData.push(column);
    } else {
      column.rowSpan = 1;
    }
    rows[column.level - 1].push(column);
  });
  return { rows: rows, lastData: lastData };
};

export default {
  name: 'ColTable',
  components: {  ColHead, ValueTable},
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
    //纵向表头初始化数据
    colHead() {
      if(this.colData.length > 0) {
        let data = JSON.parse(JSON.stringify(this.colData));
        return data;
      } else {
        return []
      }
      
    },
    allColHeadRow() {
      return this.resetNewColHead[0] ? this.resetNewColHead[0] : []
    },
    colActualFields() {
      return this.lastDataCol
    },
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

    tableData() {
      let arr;
      if(this.headers.length > 0 && this.colHead.length === 0) {
        //横向表头表格
        arr = [...this.tableValue]
      } else if(this.headers.length === 0 && this.colHead.length > 0) {
        //纵向表头表格
        arr = [...this.tableValue]
      } else {
        //多表头表格
        arr = {};
        let [row, col] = [this.lastDataRow, this.lastDataCol];
        col.forEach(x => {
          row.forEach(y => {
            let key = x.id + "__" + y.id;
            arr[key] = "";
          });
        });
        Object.assign(arr, this.tableValue);
      }

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
      return { top: -this.scrollY + "px", left: "0px" };
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
        left: -this.scrollX + this.colheadWidth + "px",
        width: '101%',
        // width: this.actualWidth1 + "px",
        // minWidth: `calc(100% - ${this.colheadWidth}px)`,
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
    ColTableWidth: {
      type: String,
      defaut: '200px'
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
  display: flex;

  th {
    background: #fff;
    font-size: 14px;
    color: #606266;
  }
}

.editTable {
  position: relative;
  overflow: hidden;
  // border: 1px solid #dcdfe6;
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
  border: 1px dashed #d3d3d3;
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
    // background: #f0f2f5;
    background: #fff;
    font-size: 14px;
    color: #606266;
    z-index: 112;
    // border: 1px solid #dcdfe6
  }
}
.south__west {
  z-index: 111;
  position: absolute;
  left: 0px;
  top: 0;
  th {
    // background: #f0f2f5;
    background: #fff;
    font-size: 14px;
    color: #606266;
    z-index: 112;
  }
  td {
    font-size: 12px;
    // color: #606266;
    background: #fff;
    // white-space: nowrap;
    // overflow: hidden;
    // text-overflow: ellipsis;
    // font-size: 11px;
    color: #6a6a6a;
    svg {
      width: 20px;
      height: 20px;
      vertical-align: middle;
    }
  }
}
.north__east {
  position: absolute;
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
    // white-space: nowrap;
    // overflow: hidden;
    // text-overflow: ellipsis;
    // font-size: 11px;
    color: #6a6a6a;
  }
}

.editTable__block {
  user-select: none;
  // position: absolute;
  border-collapse: collapse;
  padding: 0;

  & th,
  td {
    box-sizing: border-box;
    font-size: 11px;
    color: #6a6a6a;
  }
}
.editTableWrapper {
  width: 100%;
  height: 100%;
  .el-input--small {
    .el-input__inner {
      border-color: transparent;
      background: transparent;
      font-size: 12px;
      color: #606266;
      outline: 0;
    }
  }
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

th,
td {
  // box-sizing: border-box;
  border: 1px solid #d3d3d3;
  font-size: 12px;
  color: #6a6a6a;
}
</style>
<style lang="scss">
.editTable__block {
  user-select: none;
  border-collapse: collapse;
  padding: 0;
  th,
  td {
    box-sizing: border-box;
    border: 1px solid #d3d3d3;
    font-size: 12px;
    color: #6a6a6a;
  }
}
.col{
  tr {
    th:last-child{
      border-right: none;
    }
  }
}
</style>
