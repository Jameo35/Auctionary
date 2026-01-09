<template>
  <tr>
    <td><router-link :to="`/item/${item.item_id}`" class="item-link">{{ item.name }}</router-link></td>
    <td>{{  item.description }}</td>
    <td>{{ item.first_name }} {{ item.last_name }}</td>
    <td>{{ item.current_bid !== null ? `£${item.current_bid}` : 'No bids yet'  }}</td> 
    <td>{{ formatDate(item.start_date) }}</td>
    <td>{{ formatDate(item.end_date) }}</td>
    <td>{{ remaining }}</td>
  </tr>
</template>

<script>
export default {
  name: "ItemRow",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      remaining:""
    };
  },
  mounted() {
    this.updateRemaining();
    this.timer = setInterval(this.updateRemaining,1000);
  },
  beforeUnmount(){
    clearInterval(this.timer);
  },
  methods: {
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString();
    },
    updateRemaining(){
      const now = new Date();
      const end = new Date(this.item.end_date);
      let difference = Math.floor((end-now)/1000);

      if(difference <=0){
        this.remaining = "Auction Ended";
        return;
      }
      const days = Math.floor(difference/(24*3600));
      difference -= days * 24 * 3600;

      const hours = Math.floor(difference/3600);
      difference -= hours * 3600;

      const minutes = Math.floor(difference/60);
      const seconds = difference - minutes * 60;

      let result = "";
      if(days) result += days + "d ";
      result += hours + "h " + minutes + "m " + seconds + "s";

      this.remaining = result;

    }
  }
}
</script>