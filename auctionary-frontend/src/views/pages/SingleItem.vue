<template>
  <div class="item-page">
    <div class="item-details-container">
      <div class="item-details">
        <button class="back-btn" @click="goBack">Back</button>

        <h1>Item Details</h1>
        <em v-if="loading">Loading...</em>

        <div v-else class="card item-card">
          <p>Item Name: {{ item.name }}</p>
          <p>Item description: {{ item.description }}</p>
          <p>Starting Bid: £{{ item.starting_bid }}</p>
          <p>Current Bid: £{{ item.current_bid || 'No bids yet' }}</p>
          <p>Auction Started: {{ new Date(item.start_date).toLocaleString() }}</p>
          <p>Auction Ends: {{ new Date(item.end_date).toLocaleString() }}</p>
          <p>All Item Info for Debugging</p>
          <pre>{{ item }}</pre>
        </div>

        <div v-if="error" class="error">{{ error }}</div>

        <div class="card bid-history-card">
          <h2>Bid History</h2>
          <em v-if="loadingBids">Loading...</em>

          <ul v-else-if="bids.length">
            <li v-for="bid in bids" :key="bid.bid_id">
              {{ bid.first_name }} {{ bid.last_name }}
              bid £{{ bid.amount }}
              on {{ new Date(bid.timestamp).toLocaleString() }}
            </li>
          </ul>

          <div v-else>No bids found for this item.</div>
          <div v-if="errorBids" class="error">{{ errorBids }}</div>
        </div>

        <div class="card questions-card">
          <h2>Questions & Answers</h2>
          <em v-if="loadingQuestions">Loading...</em>

          <ul v-else-if="questions.length">
            <li v-for="question in questions" :key="question.question_id">
              <strong>Q:</strong> {{ question.question_text }}<br />
              <strong>A:</strong> {{ question.answer_text || "No answer yet." }}

               <div
                  v-if="isOwner && !question.answer_text"
                  class="answer-form"
                >
                  <input
                    type="text"
                    v-model="answers[question.question_id]"
                    placeholder="Write your answer..."
                    required
                  ></input>

                  <button @click="submitAnswer(question.question_id)">
                    Submit Answer
                  </button>
                </div>
            </li>
          </ul>

          <div v-else>No questions found for this item.</div>
          <div v-if="errorQuestions" class="error">{{ errorQuestions }}</div>
        </div>
      </div>
    </div>

    <div class="side-panel" v-if="item && Object.keys(item).length">
      <div class="card seller-card">
        <h2>Seller Details</h2>
        <p><strong>Name:</strong> {{ item.first_name }} {{ item.last_name }}</p>
        <router-link :to="`/profile/${item.creator_id}`">
          See this seller's profile
        </router-link>
      </div>

      <div class="card bid-form-card">
        <h2>Place a Bid</h2>

        <form @submit.prevent="placeBid">
          <label>Bid Amount (£)</label>
          <input
            type="number"
            v-model.number="bidAmount"
            min="1"
            required
          />

          <div v-if="bidError" class="error">{{ bidError }}</div>
          <div v-if="bidSuccess" class="success">{{ bidSuccess }}</div>

          <button type="submit">Place Bid</button>
        </form>
      </div>

      <div class="card question-form-card">
        <h2>Ask a Question</h2>

        <form @submit.prevent="submitQuestion">
          <label>Your Question</label>
          <input
            type="text"
            v-model="newQuestion"
            placeholder="Type your question here..."
            required
          ></input>
          <div v-if="questionError" class="error">{{ questionError }}</div>
          <div v-if="questionSuccess" class="success">{{ questionSuccess }}</div>
          <button type="submit">Submit Question</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { coreService } from '../../services/core.service.js';   
import { questionService } from '../../services/question.service.js';
import { auth } from '../../services/authentication.js';
export default {
  data() {
    return {
      item: {},
      error: "",
      loading: true,
      loadingBids: true,
      bids: [],
      errorBids: "",
      loadingQuestions: true,
      questions: [],
      errorQuestions: "",
      bidAmount: null,
      bidError: "",
      bidSuccess: "",
      newQuestion: "",
      questionError: "",
      questionSuccess: "",
      answers: {}
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
    },
    placeBid() {
      this.bidError = "";
      this.bidSuccess = "";
      coreService.placeBid(this.$route.params.id, this.bidAmount)
        .then(() => {
          this.bidSuccess = "Bid placed successfully!";
          this.bidAmount = null;
          return coreService.getBidHistory(this.$route.params.id);
        })
        .then((bids) => {
          this.bids = bids;
        })
        .catch(error => {
          this.bidError = error;
        });
      } ,
    submitQuestion() {
      this.questionError = "";
      this.questionSuccess = "";
      questionService.submitQuestion(this.$route.params.id, this.newQuestion)
        .then(() => {
          this.questionSuccess = "Question submitted successfully!";
          this.newQuestion = "";
          return coreService.getQuestionsForItem(this.$route.params.id);
        })
        .then((questions) => {
          this.questions = questions;
        })
        .catch(error => {
          this.questionError = error;
        });
    },
    submitAnswer(questionId) {
      const answerText = this.answers[questionId];
      if (!answerText) {
        return;
      }
      questionService.submitAnswer(questionId, answerText)
        .then(() => {
          this.answers[questionId] = "";
          return coreService.getQuestionsForItem(this.$route.params.id);
        })
        .then((questions) => {
          this.questions = questions;
        })
        .catch(error => {
          this.errorQuestions = error;
        });
    }
  },
  computed: {
    isOwner(){
      const userId = auth.getUserId();
      return Number(userId) === Number(this.item.creator_id);
  }
}
}
</script>


