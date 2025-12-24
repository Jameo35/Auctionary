<template>
  <div class="home">
    <h1 v-if="isLoggedIn">Welcome back to Auctionary</h1>
    <div class="search-box card">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search auctions..."
        @keyup.enter="queryItems"
      />
      <button @click="queryItems">Search</button>
      <button class="clear-btn" @click="clearSearch">Clear</button>
    </div>
    <div class ="content">
      <section class="AuctionList card">
        <h1>Current Auctions</h1>
        <em v-if="loading">Loading...</em>
          <table v-if="items.length" class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Seller</th>
                <th>Current Bid</th>
                <th>Auction Ends</th>
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
      isLoggedIn: false
    }
  },
  mounted() {
    coreService.searchItems()
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
        const query = this.searchQuery.trim() ? this.searchQuery : undefined;
        this.loading = true;
        this.error = "";
        coreService.searchItems(query)
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
