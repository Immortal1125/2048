<template>
    <div class="dialog" v-if="end">
        <div class="form">
            <span>游戏结束</span>
            <button class="sub-btn" @click="end = false">确认</button>
        </div>
    </div>
    <div class="dialog" v-if="firstPlay">
        <div class="form">
            <span>请填写用户名</span>
            <form style="margin-top: 10vmin">
                <input type="text" class="user-input" v-model="user.name" />
            </form>
            <button type="submit" class="sub-btn" @click="submitUser">
                确认
            </button>
        </div>
    </div>
    <div class="game-view">
        <div class="header">
            <div class="title">{{ title }}</div>
            <div class="score">分数：{{ score }}</div>
        </div>
        <div id="game-box-border">
            <div id="game-box">
                <GameCard
                    :left="item.y * 15 + 'vmin'"
                    :top="item.x * 15 + 'vmin'"
                    v-for="item in cards"
                    :key="item.id"
                    :value="item.value"
                ></GameCard>
            </div>
        </div>
    </div>

    <div class="control">
        <!-- <div @click="lastStep">上一步</div> -->
        <div @click="reset">重新开始</div>
        <div><RouterLink to="/leaderboard">排行榜</RouterLink></div>
    </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import GameCard from "@/components/GameCard.vue";
import { computed, ref, type Ref } from "vue";
import axios from "axios";
let title = ref(getTitle());

function getTitle() {
    let res = "";
    let time = new Date();
    const hour = time.getHours();
    if ((hour > 19 && hour < 24) || (hour >= 0 && hour < 5)) {
        res += "晚上好，";
    } else if (hour >= 5 && hour < 10) {
        res += "上午好，";
    } else if (hour >= 10 && hour <= 14) {
        res += "中午好，";
    } else {
        res += "下午好，";
    }
    res += localStorage.user;
    return res;
}

const firstPlay = ref(!localStorage.user);
const user = ref({
    name: "",
});

function submitUser(event: Event) {
    event.preventDefault();
    if (user.value.name != "") {
        localStorage.user = user.value.name;
        title.value = getTitle();
        firstPlay.value = false;
    }
}

/**
 * 卡片类型
 */
type Card = {
    id: number;
    x: number;
    y: number;
    value: number;
};

/**
 * 使卡片类型数组可用number索引
 */
interface CardArrayWithIndex extends Ref<Card[]> {
    [index: number]: Card;
}

let cards: CardArrayWithIndex = ref([]) as unknown as CardArrayWithIndex;

/**
 * 二维数组存储对应x,y地址的卡片在cards数组中的索引
 */
let cardsStatus: number[][] = [
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
];

/**
 * 获取卡片索引
 * @param x 卡片的x方向偏移量
 * @param y 卡片的y方向偏移量
 * @returns 卡片在cards数组中的索引
 */
function getCardIndex(x: number, y: number) {
    return cardsStatus[x][y];
}

let lastCardsStatus: number[][] = [];

/**
 * 获取新的卡片
 */
let newCardId = 0;
function getNewCard() {
    if (cards.value.length == 16) {
        return;
    }
    let x = 0;
    let y = 0;
    do {
        x = Math.floor(Math.random() * 10) % 4;
        y = Math.floor(Math.random() * 10) % 4;
    } while (getCardIndex(x, y) != -1);
    const newCard: Card = {
        id: newCardId,
        x: x,
        y: y,
        value: randomValue(),
    };
    const cardsLength = cards.value.push(newCard);
    cardsStatus[x][y] = cardsLength - 1;
    newCardId++;
}

/**
 * 随机获取卡片上的数值
 * @returns 卡片的数值
 */
function randomValue(): number {
    let random = (Math.random() * 10).toFixed(4);
    let res = Number.parseFloat(random);

    if (res < 0.2) {
        return 8;
    } else if (res < 8.5) {
        return 2;
    } else {
        return 4;
    }
}

/**
 * 矩阵移动函数
 * @param matrix  卡片索引矩阵
 * @param direction 移动方向
 */
function move(matrix: number[][], direction: Direction) {
    if (direction != Direction.UNMOVE) {
        lastCards = deepCopyCards(cards.value);
    }

    const rows = matrix.length;
    const cols = matrix.length;

    function _inRange(i: number, j: number) {
        return i >= 0 && i < rows && j >= 0 && j < cols;
    }

    interface Next {
        LEFT: (i: number, j: number) => number[];
        RIGHT: (i: number, j: number) => number[];
        UP: (i: number, j: number) => number[];
        DOWN: (i: number, j: number) => number[];
        [index: string]: Function;
    }
    const next: Next = {
        LEFT: (i: number, j: number) => [i, j + 1],
        RIGHT: (i: number, j: number) => [i, j - 1],
        UP: (i: number, j: number) => [i + 1, j],
        DOWN: (i: number, j: number) => [i - 1, j],
    };

    function _nextNonNegativeOneValue(i: number, j: number) {
        if (!_inRange(i, j)) {
            return;
        }
        let [nextI, nextJ] = next[direction](i, j);
        while (_inRange(nextI, nextJ)) {
            if (matrix[nextI][nextJ] != -1) {
                return [nextI, nextJ, matrix[nextI][nextJ]];
            }
            [nextI, nextJ] = next[direction](nextI, nextJ);
        }
    }

    function _col(i: number, j: number) {
        if (!_inRange(i, j)) {
            return;
        }
        const result = _nextNonNegativeOneValue(i, j);
        if (result == undefined) {
            return;
        }
        const [nextI, nextJ, nextCardIndex] = result;
        const nowCardIndex = matrix[i][j];
        if (nowCardIndex == -1) {
            matrix[i][j] = nextCardIndex;
            matrix[nextI][nextJ] = -1;
            cards.value[nextCardIndex].x = i;
            cards.value[nextCardIndex].y = j;
            _col(i, j);
        } else if (
            cards.value[nowCardIndex].value == cards.value[nextCardIndex].value
        ) {
            cards.value[nextCardIndex].value *= 2;
            matrix[i][j] = nextCardIndex;
            matrix[nextI][nextJ] = -1;
            cards.value[nextCardIndex].x = i;
            cards.value[nextCardIndex].y = j;

            cards.value.splice(nowCardIndex, 1);
            _changeIndex(nowCardIndex);
        }
        const [nextX, nextY] = next[direction](i, j);
        _col(nextX, nextY);
    }
    function _changeIndex(deleteIndex: number) {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (matrix[i][j] > deleteIndex) {
                    matrix[i][j]--;
                }
            }
        }
    }

    switch (direction) {
        case Direction.UP:
            for (let j = 0; j < cols; j++) {
                _col(0, j);
            }
            break;
        case Direction.DOWN:
            for (let j = 0; j < cols; j++) {
                _col(3, j);
            }
            break;
        case Direction.LEFT:
            for (let i = 0; i < rows; i++) {
                _col(i, 0);
            }
            break;
        case Direction.RIGHT:
            for (let i = 0; i < cols; i++) {
                _col(i, 3);
            }
            break;
    }
}

function isMerged() {
    let res = false;
    if (lastCards.length == 0) {
        return true;
    }
    lastCards.forEach((element) => {
        if (getCardIndex(element.x, element.y) == -1) {
            res = true;
        }
    });
    return res;
}

let score = ref(0);
function getScore() {
    let score = 0;
    cards.value.forEach((card) => {
        score += card.value;
    });
    return score;
}

let lastCards: Card[] = [];
function reset() {
    document.removeEventListener("pointerdown", getDownPoint);
    document.addEventListener("pointerdown", getDownPoint);
    cards.value.splice(0);
    resetCardStatus();
    getNewCard();
    getNewCard();
    score.value = getScore();
    lastCards = [];
}
reset();

function resetCardStatus() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            cardsStatus[i][j] = -1;
        }
    }
}

const end = ref(false);
function isEnd() {
    if (cards.value.length != 16) {
        return;
    } else {
        for (let i = 0; i < 4; i++) {
            if (!_col(i, 1) || !_col(i, 0)) {
                return false;
            }
        }
        return true;
    }
    function _col(col: number, way: 1 | 0) {
        if (way) {
            for (let i = 0; i < 3; i++) {
                const first = cards.value[getCardIndex(col, i)].value;
                const end = cards.value[getCardIndex(col, i + 1)].value;
                if (first == end) {
                    return false;
                }
            }
        } else {
            for (let i = 0; i < 3; i++) {
                const first = cards.value[getCardIndex(i, col)].value;
                const end = cards.value[getCardIndex(i + 1, col)].value;
                if (first == end) {
                    return false;
                }
            }
        }
        return true;
    }
}

function deepCopyCards(oldCards: Card[]) {
    let tempCards: Card[] = [];
    oldCards.forEach((card) => {
        const newCard: Card = {
            id: card.id,
            x: card.x,
            y: card.y,
            value: card.value,
        };
        tempCards.push(newCard);
    });
    return tempCards;
}

let isRequesting = false;
function postScore() {
    if (!isRequesting) {
        isRequesting = true;
        let res = axios.post("/api/scoreUpload", {
            user: localStorage.user,
            score: getScore(),
        });
        res.then((res) => {
            if (res.data.code == 1) {
                isRequesting = false;
            }
        });
    }
}

// function lastStep() {
//     if (lastCards.length != 0 && lastCardsStatus.length != 0) {
//         cards.value = deepCopyCards(lastCards);
//         cardsStatus = lastCardsStatus;
//     }
// }

/**
 * 移动方向
 */
enum Direction {
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    UP = "UP",
    DOWN = "DOWN",
    UNMOVE = "UNMOVE",
}

/**
 * 移动事件触发点
 */
type Point = {
    x: number;
    y: number;
};

/**
 * 按下抬起触发点
 */
const downPoint: Point = { x: 0, y: 0 };
const upPoint: Point = { x: 0, y: 0 };

/**
 * 按下事件回调
 * @param event PointEvent事件
 */
function getDownPoint(event: PointerEvent): void {
    downPoint.x = Math.floor(event.x);
    downPoint.y = Math.floor(event.y);
    document.removeEventListener("pointerdown", getDownPoint);
    document.addEventListener("pointerup", getUpPoint);
}

/**
 * 抬起事件回调
 * @param event
 */
function getUpPoint(event: PointerEvent): void {
    upPoint.x = Math.floor(event.x);
    upPoint.y = Math.floor(event.y);
    const direction = getDirection(downPoint, upPoint);
    console.log(direction);
    move(cardsStatus, direction);

    if (isMerged() && direction != Direction.UNMOVE) {
        setTimeout(() => {
            getNewCard();
            score.value = getScore();
            if (isEnd()) {
                setTimeout(() => {
                    end.value = true;
                }, 1000);
                postScore();
            }
        }, 240);
    }
    document.removeEventListener("pointerup", getUpPoint);
    document.addEventListener("pointerdown", getDownPoint);
}

/**
 * 获取滑动方向
 */
function getDirection(downPoint: Point, upPoint: Point): Direction {
    const horizontalDistance = upPoint.x - downPoint.x;
    const verticalDistance = upPoint.y - downPoint.y;

    if (horizontalDistance == 0 && verticalDistance == 0) {
        return Direction.UNMOVE;
    }

    if (Math.abs(horizontalDistance) > Math.abs(verticalDistance)) {
        return horizontalDistance > 0 ? Direction.RIGHT : Direction.LEFT;
    } else {
        return verticalDistance > 0 ? Direction.DOWN : Direction.UP;
    }
}
</script>

<style scoped>
.dialog {
    display: flex;
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    justify-content: center;
    align-items: center;
    z-index: 2001;
}

.user-input {
    font-size: 20px;
    width: 40vmin;
    text-align: center;
    border: none;
    border-radius: 5px;
    height: 30px;
}

.user-input:focus {
    outline: none;
}

.sub-btn {
    width: 100px;
    position: relative;
    bottom: -20vmin;
    font-size: 20px;
    height: 40px;
    background: rgb(120, 120, 229);
}

.form {
    box-sizing: border-box;
    width: 70vmin;
    height: 90vmin;
    background: #999;
    border-radius: 20px;
    box-shadow: #000 0 0 2px;
    text-align: center;
    font-size: 20px;
    color: #fff;
    padding: 20px;
}

.game-view {
    margin-top: 20px;
    width: 100%;
    height: 80%;
    text-align: center;
}

.game-view .title {
    font-size: 2rem;
    color: #fff;
}

.game-view .score {
    position: relative;
    top: 2rem;
    font-size: 1rem;
    color: #fff;
}

#game-box-border {
    z-index: 0;
    position: relative;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    height: 62vmin;
    width: 62vmin;
    border-radius: 5px;
    background-color: #fff;
}

#game-box {
    z-index: 1;
    position: relative;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    height: 60vmin;
    width: 60vmin;
    background-color: #999;
    box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.6);
}

.control {
    position: relative;

    width: 100%;
    display: flex;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    justify-content: center;
}

.control div {
    width: 100px;
    background-color: rgb(120, 120, 229);
    height: 40px;
    text-align: center;
    line-height: 40px;
    margin: 20px;
    border-radius: 10px;
    font-weight: bold;
    font-size: 16px;
    color: azure;
}

.control a {
    display: block;
    text-decoration: none;
    color: azure;
}

.end {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    font-size: 20vmin;
    justify-content: center;
    text-align: center;
    align-items: center;
    color: #fff;
    z-index: 2001;
}
</style>
