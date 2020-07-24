<template>
  <div id="app">
    <RowTable :rowData="colData" :tableValue="tableValue"></RowTable>
    <br>
    <br>
    <hr />
    <br>
    <br>
    <ColTable :colData="colData" :tableValue="tableValue"></ColTable>
  </div>
</template>

<script>
import RowTable from './components/RowTable/RowTable.vue';
import ColTable from './components/ColTable/ColTable.vue';

export default {
  name: 'app',
  components: {
    RowTable,
    ColTable
  },
  data() {
    return {
      colData: [
          {
            id: '1',
            name: '日期'
          },
          {
            id: '2',
            name: '时间'
          },
          {
            id: '3',
            name: '评估项目'
          },
          {
            id: '4',
            name: '感觉',
            children: [
                {
                    id: '5',
                    height: '80px',
                    width: '150px',
                    name: '完全受限1分 非常受限2分 轻度受限3分 未受损害4分'
                }
            ]
          },
          {
            id: '6',
            name: '潮湿',
            children: [
                {
                    id: '7',
                    name: '完全受限1分 非常受限2分 轻度受限3分 未受损害4分'
                }
            ]
          }
        ],
        tableValue: [
            {
              '1': '2020.1.10',
              '2': '17:59',
              '3': '####',
              '5': '1分',
              '7': '1分'
            },
            {},
            {},
            {}
        ]
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  padding: 100px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
