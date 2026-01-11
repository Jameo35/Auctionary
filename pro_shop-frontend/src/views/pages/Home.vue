<template>
  <div class="home flex flex-col flex-1 gap-4 ">
    <section class="justify-center text-center pb-0 pt-5">
      <h1> Welcome to the Pro Shop, time to really get into the swing of things! </h1>
      <p v-if="!isLoggedIn"> To browse more items at once and with more search options, please log in or sign up.</p>
      <p v-else> To Browse with more functionality please use the <router-link to="/browse" class="item-link">Browse</router-link> page.</p>
    </section>
    <div class ="content flex flex-wrap gap-4 pt-0 pb-0">
      <section class="flex-3 self-start AuctionList card p-4">
        <h1 class="text-center"> Recently Added Auctions </h1>
        <em v-if="loading">Loading...</em>
          <table v-if="items.length" class="items-table table-fixed">
            <thead>
              <tr>
                <th class="w-1/7">Item</th>
                <th class="w-1/7">Description</th>
                <th class="w-1/7">Seller</th>
                <th class="w-1/7">Current Bid</th>
                <th class="w-1/7">Auction Start Date</th>
                <th class="w-1/7">Auction End Date</th>
                <th class="w-1/7">Time Remaining</th>
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
          <div v-else class="justify-center">
            No auctions found. Why don't you tee off and get some items listed?
          </div>
            <div v-if="error">
                <strong>Error: </strong> {{ error }}
            </div>
      </section>
      <div class="flex-1 self-start min-w-[320px] Login" v-if="!isLoggedIn">
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
      loading: true
    }
  },
  mounted() {
    coreService.searchItems({limit: 5
    })
      .then(items => {
        this.items = items;
        this.loading = false;
        console.log('Fetched items:', items);
      })
      .catch(error => this.error = "Failed to connect to backend service")
      this.loading = false;

  },
  computed:{
    isLoggedIn(){
      return auth.isAuthenticated();
    }
  },
  methods: {
    // queryItems(){
    //     const q = this.searchQuery.trim() || undefined;
    //     this.loading = true;
    //     this.error = "";
    //     coreService.searchItems({q, limit: 5})
    //       .then(items => {
    //         this.items = items;
    //         this.loading = false;
    //         console.log('Fetched items:', items);

    //       })
    //       .catch(error => {
    //         this.error = error;
    //         this.loading = false;
    //         console.log('Error:', error);

    //       });
    //   },
    // clearSearch(){
    //   this.searchQuery = "";
    //   this.queryItems();
    // }
  }
}
</script>
