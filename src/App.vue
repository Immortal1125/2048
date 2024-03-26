<template>
    <div id="main">
        <RouterView> </RouterView>
    </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<style scoped>
#main {
    height: 100%;
    width: 100%;
    overflow-x: hidden;
}
</style>
