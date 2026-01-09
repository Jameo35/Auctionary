<template>
  <div class="profile-page flex flex-col flex-1">
    <h1>{{ seller.first_name }} {{ seller.last_name }}'s Items</h1>
    <em v-if="loading">Loading...</em>
    <div v-if="error" class="error">{{ error }}</div>
    
    <ItemList 
      :title="'Items for Sale'"
      :items="items"
      noItemsMessage="No items found for this seller."
    />

    <ItemList 
      :title="`Items ${seller.first_name} is Bidding On`"
      :items="activeBids"
      noItemsMessage="No items found for this seller."
    />

    <ItemList 
      :title="`Items ${seller.first_name} has bidded on (Ended)`"
      :items="endedBids"
      noItemsMessage="No ended bids found for this user."
    />

    <ItemList 
      :title="`${seller.first_name}'s ended Auctions`"
      :items="auctions_ended"
      noItemsMessage="This seller has no ended auctions."
    />
  </div>
</template>

<script>

import { userService } from '../../services/userService.js';  
import ItemList from '../components/ItemList.vue'; 

export default {
  components: {
    ItemList
  },
  data() {
    return {
      seller: {},
      items: [],
      bidding: [],
      auctions_ended: [],
      activeBids: [],
      endedBids: [],
      loading: true,
      error: ''
    }
  },
  mounted() {
    this.loadUser();
},
  watch: {
    '$route.params.id'(newId, oldId) {
      this.loadUser();
    }
  },
methods: {
  loadUser(){
    this.loading=true;
    this.error="";

      let userId;

  if (this.$route.params.id) {
    userId = this.$route.params.id;
  } else {
    userId = localStorage.getItem('user_id');
  }
   userService.getUserProfile(userId)
    .then(user => {
      this.seller = {
        first_name: user.first_name,
        last_name: user.last_name,
        user_id: user.user_id
      };
      const now = Date.now();
      console.log(now);
      this.items = user.selling || [];

      const allBiddingItems = user.bidding_on || [];
      this.activeBids = allBiddingItems.filter(item => item.end_date > now);
      this.endedBids = allBiddingItems.filter(item => item.end_date < now);

      this.auctions_ended = user.auctions_ended || [];
      this.loading = false;
    })
    .catch(err => {
      this.error = err.message || err;
      this.loading = false;
    });

  }
}
}
</script>
