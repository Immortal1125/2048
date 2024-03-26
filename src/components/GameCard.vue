<template>
    <div class="card" :style="{ left: props.left, top: props.top }">
        <div class="inner-card" :class="getBackground">{{ props.value }}</div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    left?: string;
    top?: string;
    value: number;
}>();

interface ValueOfColor {
    [index: number]: string;
}

const valueOfColor: ValueOfColor = {
    2: "card-2",
    4: "card-4",
    8: "card-8",
    16: "card-16",
    32: "card-32",
    64: "card-64",
    128: "card-128",
    256: "card-256",
};

const getBackground = computed(() => {
    return valueOfColor[props.value];
});
</script>

<style scoped>
.card {
    position: absolute;
    height: 15vmin;
    width: 15vmin;
    transition: 0.2s linear;
}

.inner-card {
    position: relative;
    height: 13vmin;
    width: 13vmin;
    background-color: #444;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 8px;
    box-shadow: #000 1px 1px 2px;
    line-height: 13vmin;
    font-size: 4.5vmin;
    text-align: center;
    color: #fff;
    font-weight: bold;
    text-shadow: #000 0 0 2px;
}

.card-2 {
    background: #eee4da;
}

.card-4 {
    background: #ede0c8;
}
.card-8 {
    background: #f2b179;
}

.card-16 {
    background: #f59563;
}

.card-32 {
    background: #f67c5f;
}

.card-64 {
    background: #f65e3b;
}

.card-128 {
    background: #edcf72;
}

.card-256 {
    background: #edcc61;
}
</style>
