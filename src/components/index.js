import ColTable from "./ColTable/ColTable.vue";
import RowTable from "./RowTable/RowTable.vue";

let CreateTable = {};

CreateTable.install = function(Vue){
    Vue.component(ColTable.name, ColTable)
    Vue.component(RowTable.name, RowTable)
    if (typeof window !== 'undefined' && window.Vue) {
        window.Vue.use(ColTable);
        window.Vue.use(RowTable);
    }
}

export default CreateTable;