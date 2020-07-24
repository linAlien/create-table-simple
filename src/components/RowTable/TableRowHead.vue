<script type="text/jsx">
export default {
    data() {
        return {
        }
    },
    inject: ["edit"],
    render(){
        let tr = this.createHead();
        return <thead class="editTable__block" id="tb">{tr}</thead>
    },
    props: {
        allRow: {
            type: Boolean,
            defaule: false
        }
    },
    methods: {
      createHead() {
        let [tr] = [[]];

        this.edit.resetNewRowHead.forEach((x) => {
            let cell = [];
            x.forEach((y) => {
                if(y && y !== null) {
                    // 计算合并行高
                    let height = y.rowSpan * (this.edit.tableTdHeight);
                    cell.push(<th colspan={y.colSpan} rowspan={y.rowSpan} style={{ width: this.edit.headColWidth + "px", height: height + "px", textAlign: this.edit.textAlign}}>{y.name}</th>)
                }
            })
            // 添加节点
            tr.push(<tr>{cell}</tr>);
        });
        return tr;
      },

    }
}
</script>
