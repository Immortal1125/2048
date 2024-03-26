import { createRouter, createWebHistory } from "vue-router";
import GameView from "@/views/GameView.vue";
import LeaderboardView from "@/views/LeaderboardView.vue";
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "game",
            component: GameView,
        },
        {
            path: "/leaderboard",
            name: "leader",
            component: LeaderboardView,
        },
    ],
});

export default router;
