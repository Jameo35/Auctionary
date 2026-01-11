<template>
  <div class="home">
    <div class ="content">
      <section class="flex-2 self-start AuctionList card">
        <h1>Browse All Auctions</h1>
        <p>Use the search box below to search items!</p>
        <div class="search-box card p-4 flex-1 grow gap-4 items-end">
          <input type="text" v-model="searchQuery" placeholder="Search auctions..." @keyup.enter="queryItems(true)" class="h-10 px-3" />
          <div>
            <p class="text-center">Filter by Status</p>
          <select v-model="statusFilter" class="styled-select">
            <option value="">All Statuses</option>
            <option value="BID">Items I've Bid On</option>
            <option value="OPEN">Items I'm Selling</option>
            <option value="ARCHIVE">My Ended Auctions</option>
          </select>
          </div>

          <div>
            <p class="text-center">Filter by Category</p>
          <select v-model="selectedCategory" class="styled-select">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.category_id" :value="category.category_id">
              {{ category.name }}
            </option>
          </select>
          </div>
          <div>
            <p>Results Per Page</p>
          <select v-model.number="limit" class="styled-select w-full">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          </div>
          <div>
            <p>Sort page results</p>
          <select v-model="sortBy" class="styled-select">
            <option value="">Most Recently Listed</option>
            <option value="low">Lowest Bid</option>
            <option value="high">Highest Bid</option>
            <option value="endDate">Ending Soon</option>
            <option value="startDate">Oldest Auctions</option>
          </select>
          </div>
          <button class="button mt-0" @click="queryItems">Search</button>
          <button class="button mt-0" @click="clearSearch">Clear</button>
          <div class="flex items-center gap-1">
            <label for="hideEnded" class="text-primary text-xl">Hide Ended Auctions</label>
            <input type="checkbox" id="hideEnded" v-model="hideEnded" class="h-7 w-7"/>
          </div>
        </div>
        <em v-if="loading">Loading...</em>
          <table v-if="items.length" class="items-table table-fixed w-full">
            <thead>
              <tr>
                <th class="w-3/7">Item</th>
                <th class="w-3/7">Description</th>
                <th class="w-1/7">Seller</th>
                <th class="w-1/7">Current Bid</th>
                <th class="w-2/7">Auction Start Date</th>
                <th class="w-2/7">Auction End Date</th>
                <th class="w-2/7">Time Remaining</th>
              </tr>
            </thead>
            <tbody>
                <ItemRow
                  v-for="item in sortedItems"
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
      searchQuery: "",
      statusFilter: "",
      categories: [],
      selectedCategory: "",
      limit: 20,
      offset: 0,
      hasNextPage: true,
      sortBy: "",
      hideEnded: false
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
    },
    sortedItems(){
      let sortedItems = [...this.items];

      if(this.hideEnded){
        sortedItems = sortedItems.filter(item => item.end_date > Date.now())
      }

      switch (this.sortBy){
        case "low":
          sortedItems.sort((a,b) => a.current_bid - b.current_bid);
          break;
        case "high":
          sortedItems.sort((a,b) => b.current_bid - a.current_bid);
          break;
        case "endDate":
          sortedItems.sort((a,b) => a.end_date - b.end_date);
          break;
        case "startDate":
          sortedItems.sort((a,b) => a.start_date - b.start_date);
          break;
      }
      return sortedItems;
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
                    console.log('Fetched items:', items);
                  } else {
                    this.hasNextPage = false;
                    this.items = items;
                    console.log('Fetched items:', items);
                  }
                  this.loading = false;
                })
                .catch(error => {
                  this.error = error;
                  this.loading = false;
                  console.log('Error:', error);
                });
      },
      clearSearch(){
        this.searchQuery = "";
        this.statusFilter = "";
        this.selectedCategory = "";
        this.limit=20;
        this.offset=0;
        this.sortBy="";
        this.hideEnded=false;
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
