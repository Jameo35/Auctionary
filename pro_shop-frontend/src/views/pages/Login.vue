<template>
    <div :class="{'login-page': isStandalone }">
        <div class ="login-card card" v-if="!isLoggedIn">
            <div>
                <h1>Login</h1>
                <form @submit.prevent="handleSubmit">
                    <label for="email">Email: </label>
                    <input type="email" name="email" v-model="email" />
                    <div v-show="submitted && !email">Email is required</div>
                    <br /><br />
                    <label for="password">Password: </label>
                    <input type="password" name="password" v-model="password"/>
                    <div v-show="submitted && !password">Password is required</div>
                    <br /><br />
                    <button>Login</button>
                    <button href="/signup" @click.prevent="$router.push('/signup')">Sign Up</button>
                </form>
                <div v-if="error">{{ error }} </div>
            </div>
        </div>
        <div v-else>
            <h2>You are already logged in.</h2>      
        </div>  
    </div>

</template>
<script>
import { userService } from '@/services/userService';
import { auth } from '@/services/authentication.js';
import * as EmailValidator from 'email-validator';
    export default {
        data(){
            return{
                email:"",
                password: "",
                submitted: false,
                isLoggedIn: false

            }
        },
        props: {
            isStandalone: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            handleSubmit(e){
                this.submitted = true
                this.error = ""
                const{email, password} = this

                if(!(email && password)){
                    return;
                }
                if(!(EmailValidator.validate(email))){
                    this.error = "Email must be a valid email."
                    return;
                }
                userService.login(email, password)
                    .then(() => {
                        auth.login();
                        this.$router.push("/")
                    })
                    .catch((err) => {
                        this.error = err; // "Invalid email or password"
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
