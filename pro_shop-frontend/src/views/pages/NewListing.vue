<template>
    <div class="signup-page">
        <div class ="signup-card card" v-if="isLoggedIn">
            <h1>Create New Listing</h1>
            <button type="button" class="mb-4 rounded-lg bg-primary px-4 py-2 hover:bg-accent" @click="showDraftPanel = !showDraftPanel">
                {{ showDraftPanel ? 'Hide Drafts' : 'Show Drafts' }}
            </button>

            <div v-if="showDraftPanel" class="mb-6 rounded-xl border bg-white shadow">
                <div class="border-b px-4 py-2 font-semibold">
                    Saved Drafts
                </div>

                <div v-if="drafts.length === 0" class="p-4 text-gray-500">
                    No drafts saved
                </div>

                <ul v-else class="divide-y">
                    <li v-for="draft in drafts" :key="draft.id" class="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div>
                            <p class="font-medium">
                                {{ draft.name || 'Untitled Draft' }}
                            </p>
                            <p class="text-sm text-gray-500">
                                Last saved {{ new Date(draft.lastSaved).toLocaleString() }}
                            </p>
                        </div>

                        <div class="flex gap-2">
                            <button class="text-text hover:underline" @click="loadDraft(draft.id)">
                                Load
                            </button>
                            <button class="text-accent hover:underline" @click="deleteDraftButton(draft.id)">
                                Delete
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
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

                <label for="categories">Categories</label>
                <div class="custom-select">
                    <select multiple v-model="selected_categories">
                        <option v-for="category in categories" :key="category.category_id" :value="category.category_id">
                            {{ category.name }}
                        </option>
                    </select>
                </div>
                <div class="flex gap-2 mt-4">
                    <button type="submit">Create Item</button>

                    <button type="button" @click="saveDraft">
                        Save Draft
                    </button>

                    <button v-if="draftId" type="button" @click="deleteDraft">
                        Delete Draft
                    </button>

                    <button type="button" @click="newDraft">
                        New Draft
                    </button>
                </div>
            </form>
            <div v-if="error" class="error">{{ error }} </div>
            <div v-if="success" class="success" >{{ success }} </div>
        </div>

    </div>
</template>
<script>

import { auth } from '@/services/authentication.js';
import { coreService } from '@/services/core.service.js';
import { draftService } from '@/services/draft.service.js';
    export default {
        data(){
            return{
                draftId: null,
                drafts: [],
                showDraftPanel: false,
                name: '',
                description: '',
                starting_bid: null,
                end_date: '',
                submitted: false,
                categories: [],
                selected_categories: [],
                error: '',
                success: ''
            }
        },
        mounted(){
            coreService.getCategories()
            .then((response) => {
                console.log('Fetched categories:', response);
                this.categories = response.categories;
            })
            .catch((err) => {
                console.error('Error fetching categories:', err);
            });

            this.loadDrafts();

        },
        methods: {
            handleSubmit(e){
                this.submitted = true
                this.error = ""
                this.success = ""
                const{ name, description, starting_bid, end_date, selected_categories} = this

                if(!(name && description && starting_bid && end_date)){
                    return;
                }
                const endDateEpoch = new Date(end_date).getTime();
                const itemData = {
                    name: name,
                    description: description,
                    starting_bid: starting_bid,
                    end_date: endDateEpoch,
                    categories: selected_categories
                };

                console.log(itemData);
                coreService.createItem(itemData)
                    .then(() => {
                        this.success = "Item created successfully!";
                        this.name = '';
                        this.description = '';
                        this.starting_bid = null;
                        this.selected_categories = [];
                        this.end_date = '';
                        this.submitted = false;
                    })
                    .catch((err) => {
                        this.error = err;
                        this.submitted = false;
                    });
            },
            saveDraft(){
                this.error = ""
                this.success = ""

                const id = this.draftId || Date.now().toString();

                const draft = {
                    id,
                    name: this.name,
                    description: this.description,
                    starting_bid: this.starting_bid,
                    end_date: this.end_date,
                    categories: this.selected_categories,
                    lastSaved: Date.now()
                };
                this.draftId = id;
                draftService.saveDraft(draft)
                this.loadDrafts();
                this.success = "Draft saved successfully!";
                setTimeout(() => {
                this.success = ''
                }, 3000)
            },
            deleteDraft(){
                if(!this.draftId){
                    this.error = "No draft to delete.";
                    return;
                }
                draftService.deleteDraft(this.draftId)
                this.loadDrafts();
                this.success = "Draft deleted successfully!";
                this.draftId = null;
                this.name = '';
                this.description = '';
                this.starting_bid = null;
                this.selected_categories = [];
                this.end_date = '';
        },
            loadDrafts(){
                this.drafts = draftService.getDrafts();
            },
            loadDraft(id){
                const draft = draftService.getDraftById(id);
                if(!draft) return;
                this.draftId = draft.id;
                this.name = draft.name;
                this.description = draft.description;
                this.starting_bid = draft.starting_bid;
                this.end_date = draft.end_date;
                this.selected_categories = draft.categories;

                this.success = "Draft loaded successfully!";
                setTimeout(() => {
                this.success = ''
                }, 3000)
            },
            deleteDraftButton(id){
                draftService.deleteDraft(id);
                this.loadDrafts();
                this.success = "Draft deleted successfully!";
                setTimeout(() => {
                this.success = ''
                }, 3000)
            },
            newDraft(){
                this.draftId = null;
                this.name = '';
                this.description = '';
                this.starting_bid = null;
                this.selected_categories = [];
                this.end_date = '';
                this.success = "New draft created!";
                setTimeout(() => {
                this.success = ''
                }, 3000)
            }
        },
          computed:{
            isLoggedIn(){
            return auth.isAuthenticated();
            }
        }
    }
</script>
