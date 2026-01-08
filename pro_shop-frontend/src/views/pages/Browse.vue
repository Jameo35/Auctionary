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
        @keyup.enter="queryItems(true)"
      />
      <select v-model="statusFilter" class="styled-select">
        <option value="">All Statuses</option>
        <option value="BID">Items Bid On</option>
        <option value="OPEN">Items Selling</option>
        <option value="ARCHIVE">Ended Auctions</option>
      </select>

      <select v-model="selectedCategory" class="styled-select">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category.category_id" :value="category.category_id">
          {{ category.name }}
        </option>
      </select>

      <select v-model.number="limit" class="styled-select">
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
                <th>Current Bid</th>
                <th>Auction Start Date & Time</th>
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

          <div class="pagination">
            <button @click="prevPage" v-if="offset > 0">
              Previous
            </button>
            <button @click="nextPage" v-if="hasNextPage">
              Next
            </button>
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
      statusFilter: "",
      categoriesList: [],
      selectedCategory: "",
      limit: 20,
      offset: 0,
      hasNextPage: true

    }
  },
  mounted() {
    this.queryItems(true);

    coreService.getCategories()
      .then((response) => {
        console.log('Fetched categories:', response);
        this.categories = response.categories;
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
      });
  },
  computed:{
    isLoggedIn(){
      return auth.isAuthenticated();
    }
  },
  methods: {
    queryItems(reset = false){
    if (reset) {
    this.offset = 0;
    }
        const q = this.searchQuery.trim() || undefined;
        const status = this.statusFilter || undefined;
        const limit = this.limit || undefined;
        const offset = this.offset;
        const category = this.selectedCategory || undefined;
        const token = localStorage.getItem('session_token') || undefined;
        this.loading = true;
        this.error = "";
        const fetchLimit = this.limit + 1;
        coreService.searchItems({q, status, limit: fetchLimit, offset, token, category})
          .then(items => {
            if (items.length > this.limit) {
                    this.hasNextPage = true;
                    this.items = items.slice(0, this.limit);
                  } else {
                    this.hasNextPage = false;
                    this.items = items;
                  }
                  this.loading = false;
                })
                .catch(error => {
                  this.error = error;
                  this.loading = false;
                });
      },
      clearSearch(){
        this.searchQuery = "";
        this.statusFilter = "";
        this.selectedCategory = "";
        this.queryItems();
      },
      nextPage() {
      if (this.hasNextPage) {
        this.offset += this.limit;
        this.queryItems();
        }
      },
      prevPage() {
        if (this.offset >= this.limit) {
          this.offset -= this.limit;
          this.queryItems();
        }
      }
  }
}
</script>
