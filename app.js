const { ref, onMounted, computed } = Vue;

const Login = {
    template: `
        <div class="card">
            <h1>Login</h1>
            <input v-model="username" placeholder="Username" /><br>
            <button @click="simpleLogin">Standard Login</button>
            <button @click="clearStorage">Clear Storage</button>
            <hr>
            <button v-if="hasBiometrics" @click="biometricLogin">Login with Fingerprint</button>
            <p v-if="error" style="color:red">{{ error }}</p>
        </div>
    `,
    setup() {
        const username = ref(localStorage.getItem('user') || '');
        const isLoggedIn = ref(!!localStorage.getItem('isLoggedIn'));
        const isEnrolled = ref(!!localStorage.getItem('biometric_id'));
        const error = ref('');
        const hasBiometrics = ref(window.PublicKeyCredential !== undefined);

        onMounted(() => {
            if (isLoggedIn.value) {
                router.push('/main');
            }
        });

        const simpleLogin = () => {
            if (!username.value) return error.value = "Enter username";
            localStorage.setItem('user', username.value);
            localStorage.setItem('isLoggedIn', 'true');
            isLoggedIn.value = true;
            router.push('/main');
        };

        const clearStorage = () => {
            localStorage.clear();
            username.value = '';
        };

        const biometricLogin = async () => {
            try {
                const options = {
                    publicKey: {
                        challenge: Uint8Array.from("random_login_challenge", c => c.charCodeAt(0)),
                        allowCredentials: [{ id: Uint8Array.from(atob(localStorage.getItem('biometric_id')), c => c.charCodeAt(0)), type: 'public-key' }],
                        userVerification: "required"
                    }
                };
                await navigator.credentials.get(options); // This triggers the phone's biometric prompt
                isLoggedIn.value = true;
                localStorage.setItem('isLoggedIn', 'true');
                router.push('/main');
            } catch (err) {
                error.value = "Biometric login failed.";
            }
        };

        return { username, isLoggedIn, error, hasBiometrics, simpleLogin, clearStorage, biometricLogin };
    }
};

const MainScreen = {
    template: `
        <div class="card">
            <h1>Welcome Back!</h1>
            <p>Hello, {{ username }}!</p>
            <router-link to="/random-list"><button>Consulta de animales</button></router-link>
            <button v-if="!isEnrolled" @click="registerBiometric">Enable Fingerprint Login</button>
            <button @click="logout">Logout</button>
        </div>
    `,
    setup() {
        const username = ref(localStorage.getItem('user') || '');
        const isEnrolled = ref(!!localStorage.getItem('biometric_id'));
        const error = ref('');

        const registerBiometric = async () => {
            try {
                // Simulation: In a real app, 'challenge' comes from your server
                const options = {
                    publicKey: {
                        challenge: Uint8Array.from("random_server_challenge", c => c.charCodeAt(0)),
                        rp: { name: "Vue PWA Demo", id: window.location.hostname },
                        user: { id: Uint8Array.from("123", c => c.charCodeAt(0)), name: username.value, displayName: username.value },
                        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                        authenticatorSelection: { userVerification: "required" },
                        timeout: 60000
                    }
                };
                const credential = await navigator.credentials.create(options);
                localStorage.setItem('biometric_id', btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));
                isEnrolled.value = true;
                alert("Fingerprint registered!");
            } catch (err) {
                error.value = "Registration failed: " + err.message;
            }
        };

        const logout = () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
            router.push('/');
        };

        return { username, isEnrolled, error, registerBiometric, logout };
    }
};

const RandomList = {
    template: `
        <div class="card">
            <h1>Consulta de animales</h1>
            <input v-model="search" placeholder="Buscar..." />
            <ul>
                <li v-for="item in filteredItems" :key="item.id || item.name">
                    {{ item.name }} - {{ item.description || item.tipo || '' }}
                </li>
            </ul>
            <button @click="$router.go(-1)">Back</button>
        </div>
    `,
    setup() {
        const items = ref([]);
        const search = ref('');

        const filteredItems = computed(() => {
            if (!search.value) return items.value;
            return items.value.filter(item =>
                item.name.toLowerCase().includes(search.value.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(search.value.toLowerCase()))
            );
        });

        onMounted(async () => {
            try {
                const response = await fetch('https://merino.com.ar/handlerws/AnimalesPublicos.ashx');
                const data = await response.json();
                items.value = Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('Error fetching data:', error);
                items.value = [];
            }
        });

        return { items, search, filteredItems };
    }
};

const router = new VueRouter({ routes: [
    { path: '/', component: Login },
    { path: '/main', component: MainScreen },
    { path: '/random-list', component: RandomList }
] });
new Vue({ el: '#app', router, mounted() {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
}});
