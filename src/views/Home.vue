<template>
  <div class="home">
    <h1>交通数据分析平台</h1>

    <div class="card-container">

      <router-link to="/location-query" class="link">
        <FunctionCard
          title="地点经纬度查询"
          description="输入地点名称或上传地点文件，查询经纬度信息"
        />
      </router-link>

      <router-link to="/route-detail" class="link">
        <FunctionCard
          title="路线详情查询"
          description="输入起点终点或上传路线文件，查询路线基础信息"
        />
      </router-link>

      <router-link to="/route-plan" class="link">
        <FunctionCard
          title="路线规划"
          description="根据经纬度点生成每分钟移动轨迹"
        />
      </router-link>

      <router-link to="/path-recover" class="link">
        <FunctionCard
          title="路径恢复"
          description="根据出发时间、终止时间、起终点恢复移动轨迹"
        />
      </router-link>

    </div>
  </div>
</template>

<script setup>
import FunctionCard from '../components/FunctionCard.vue'
</script>

<style scoped>
.home {
  padding: 40px;
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  color: #1f2937;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.link {
  text-decoration: none;
}
</style>