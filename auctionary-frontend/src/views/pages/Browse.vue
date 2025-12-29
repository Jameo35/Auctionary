<template>
  <div class="home">
    <div class="page-title">
      <h1>Browse Auctions</h1>
    </div>
    <div class="search-box card">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search auctions..."
        @keyup.enter="queryItems"
      />
      <select v-model="statusFilter">
        <option value="">All Statuses</option>
        <option value="BID">Bid</option>
        <option value="OPEN">Open</option>
        <option value="ARCHIVE">Archive</option>
      </select>

      <select v-model.number="limit">
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>

      <button @click="queryItems">Search</button>
      <button class="clear-btn" @click="clearSearch">Clear</button>
    </div>
    <div class ="content">
      <section class="AuctionList card">
        <h1>Browse All Auctions</h1>
        <em v-if="loading">Loading...</em>
          <table v-if="items.length" class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Seller</th>
                <th>Auction End Date & Time</th>
              </tr>
            </thead>
            <tbody>
                <ItemRow
                  v-for="item in items"
                  :key="item.item_id"
                  :item="item"
                />
              </tbody>
          </table>
          <div v-else>
            No auctions found.
          </div>

            <div v-if="error">
                <strong>Error: </strong> {{ error }}
            </div>
      </section>
      <div v-if="!isLoggedIn">
        <Login />
      </div>
    </div>
  </div>
</template>

<script>
import ItemRow from '../components/ItemRow.vue';
import { coreService } from '../../services/core.service.js';   
import { auth } from '../../services/authentication.js';
import Login from './Login.vue';
export default {
  components: {
    Login,
    ItemRow
  },
  data() {
    return {
      items: [],
      error: "",
      loading: true,
      isLoggedIn: false,
      searchQuery: "",
      statusFilter: ""
    }
  },
  mounted() {
    coreService.searchItems({})
      .then(items => {
        this.items = items;
        this.loading = false;
      })
      .catch(error => this.error = error)
  },
  computed:{
    isLoggedIn(){
      return auth.isAuthenticated();
    }
  },
  methods: {
    queryItems(){
        const q = this.searchQuery.trim() || undefined;
        const status = this.statusFilter || undefined;
        const limit = this.limit || undefined;
        const token = localStorage.getItem('session_token') || undefined;
        this.loading = true;
        this.error = "";
        coreService.searchItems({q, status, limit, token})
          .then(items => {
            this.items = items;
            this.loading = false;
          })
          .catch(error => {
            this.error = error;
            this.loading = false;
          });
      },
    clearSearch(){
      this.searchQuery = "";
      this.queryItems();
    }
  }
}
</script>
