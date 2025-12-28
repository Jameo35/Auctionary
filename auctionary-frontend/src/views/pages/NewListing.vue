<template>
    <div class="signup-page">
        <div class ="signup-card card" v-if="isLoggedIn">
            <h1>Create Account</h1>
            <form @submit.prevent="handleSubmit">
                <label for="name">Item Name:</label>
                <input type="text" name="name" v-model="name" />
                <div v-if="submitted && !name">Item name is required</div>
                <label for="description"> Item Description:</label>
                <input type="text" name="description" v-model="description" />
                <div v-if="submitted && !description">Description is required</div>
                <label for="starting_bid">Starting Bid: </label>
                <input type="number" name="starting_bid" v-model="starting_bid" />
                <div v-if="submitted && !starting_bid">Starting bid is required</div>
                <label for="end_date">End Date: </label>
                <input type="datetime-local" name="end_date" v-model="end_date" />
                <div v-if="submitted && !end_date">End date is required</div>
                <button>Create Item</button>
            </form>
            <div v-if="error" class="error">{{ error }} </div>
            <div v-if="success" class="success">{{ success }} </div>
        </div>
    </div>
</template>
<script>

import { auth } from '@/services/authentication.js';
import { coreService } from '@/services/core.service.js';
    export default {
        data(){
            return{
                name: '',
                description: '',
                starting_bid: null,
                end_date: '',
                submitted: false,
                error: '',
                success: ''
            }
        },
        methods: {
            handleSubmit(e){
                this.submitted = true
                this.error = ""
                this.success = ""
                const{ name, description, starting_bid, end_date} = this

                if(!(name && description && starting_bid && end_date)){
                    return;
                }
                const endDateEpoch = new Date(end_date).getTime();
                const itemData = {
                    name: name,
                    description: description,
                    starting_bid: starting_bid,
                    end_date: endDateEpoch
                };

                console.log(itemData);
                coreService.createItem(itemData)
                    .then(() => {
                        this.success = "Item created successfully!";
                        this.name = '';
                        this.description = '';
                        this.starting_bid = null;
                        this.end_date = '';
                        this.submitted = false;
                    })
                    .catch((err) => {
                        this.error = "Failed to create item. Please try again.";
                        this.submitted = false;
                    });
            }
            
        }
        ,
          computed:{
            isLoggedIn(){
            return auth.isAuthenticated();
            }
        }
    }
</script>