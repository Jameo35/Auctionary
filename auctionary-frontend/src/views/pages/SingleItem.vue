<template>
  <div class="item-details-container">
    <div class="item-details">
        <button class="back-btn" @click="goBack">
        Back
        </button>
        <h1>Item Details</h1>
        <em v-if="loading">Loading...</em>
        <div v-else class="card item-card">
          <p>Item Name: {{ item.name}}</p>
          <p>Item description: {{ item.description}}</p>
          <p>All Item Info for Debugging</p>
          <p>{{ item }}</p>
        </div>
        <div v-if="error" class="error">
            {{ error }}
        </div>
      <div class="card bid-history-card">
        <h2>Bid History</h2>
        <em v-if="loading">Loading...</em>
        <ul v-else-if="bids.length">
          <li v-for="bid in bids" :key="bid.bid_id">
            {{ bid.first_name }} {{ bid.last_name }} bid ${{ bid.amount }} on {{ new Date(bid.timestamp).toLocaleString() }}
          </li>
        </ul>
        <div v-else>No bids found for this item.</div>
        <div v-if="errorBids" class="error">{{ errorBids }}</div>
      </div>
      <div class="card questions">
        <h2>Questions & Answers</h2>
        <em v-if="loading">Loading...</em>
        <ul v-else-if="questions.length">
          <li v-for="question in questions" :key="question.question_id">
            <strong>Q:</strong> {{ question.question_text }}<br/>
            <strong>A:</strong> {{ question.answer_text || "No answer yet." }}
          </li>
        </ul>
        <div v-else>No questions found for this item.</div>
        <div v-if="errorQuestions" class="error">{{ errorQuestions }}</div>
      </div>
    </div>
  </div>
  <div class="seller-details" v-if="item && Object.keys(item).length">
    <div class="card seller-card">
      <h2>Seller Details</h2>
      <p><strong>Name:</strong> {{item.first_name }} {{ item.last_name }}</p>
      <router-link :to="`/profile/${item.creator_id}`">
      See other items by this seller
      </router-link>
    </div>
  </div>
</template>

<script>
import { coreService } from '../../services/core.service.js';   
export default {
  data() {
    return {
      items: [],
      error: "",
      loading: true,
      loadingBids: true,
      bids: [],
      errorBids: "",
      loadingQuestions: true,
      questions: [],
      errorQuestions: "",
    }
  },
  mounted() {
    coreService.getSingleItem(this.$route.params.id)
      .then((item) => {
        this.item = item;
        this.loading = false;
      })
      .catch(error => this.error = error)
    coreService.getBidHistory(this.$route.params.id)
      .then((bids) => {
        this.bids = bids;
        this.loadingBids = false;
      })
      .catch(error => this.errorBids = error)
    coreService.getQuestionsForItem(this.$route.params.id)
      .then((questions) => {
        this.questions = questions;
        this.loadingQuestions = false;
      })
      .catch(error => this.errorQuestions = error)
  },
  methods: {
    goBack() {
      this.$router.back();
    }
  }
}
</script>


