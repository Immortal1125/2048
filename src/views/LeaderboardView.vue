<template>
    <div style="height: 80%">
        <ElTable
            height="100%"
            stripe
            :data="scoreList"
            :default-sort="{ prop: 'score', order: 'descending' }"
        >
            <ElTableColumn prop="user" label="user"></ElTableColumn>
            <ElTableColumn prop="score" label="score" sortable></ElTableColumn>
        </ElTable>
    </div>
    <div
        style="
            width: 100%;
            height: 20%;
            display: flex;
            justify-content: center;
            align-items: center;
        "
    >
        <div
            style="
                width: 120px;
                height: 40px;
                background: rgb(120, 120, 229);
                border-radius: 10px;
                text-align: center;
                line-height: 40px;
            "
        >
            <RouterLink
                to="/"
                style="font-size: 20px; color: #fff; text-decoration: none"
                >返回</RouterLink
            >
        </div>
    </div>
</template>

<script setup lang="ts">
import { ElTable, ElTableColumn } from "element-plus";
import { onMounted, ref } from "vue";
import axios from "axios";
import { RouterLink } from "vue-router";

let scoreList = ref([]);
onMounted(async () => {
    let res = await axios.get("/api/scoreList");
    scoreList.value = res.data.data;
    console.log(res);
});
</script>
