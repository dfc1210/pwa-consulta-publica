const Login = {
    template: `
        <div class="pwa-page">
            <h1>Login</h1>
            <form>
                <input v-model="username" placeholder="Username" autocomplete="username"/><br>
                <input type="password" v-model="password" placeholder="Password" autocomplete="current-password"/><br>
                <label><input type="checkbox" v-model="rememberMe" /> Remember me</label><br>
                <button @click="simpleLogin">Login</button>
                <button @click="clearStorage">Clear Storage</button>
                <hr>
                <button v-if="hasBiometrics" @click="biometricLogin">Login with Fingerprint</button>
                <p v-if="error" style="color:red">{{ error }}</p>
            </form>
        </div>
    `,
    setup() {
        const apiUrl = window.CONSTANTS?.API_URLS?.AUTH_LOGON;
        const username = ref(localStorage.getItem('user') || '');
        const password = ref('');
        const rememberMe = ref(localStorage.getItem('rememberMe') === 'true');
        const isLoggedIn = ref(!!localStorage.getItem('isLoggedIn'));
        const isEnrolled = ref(!!localStorage.getItem('biometric_id'));
        const error = ref('');
        const hasBiometrics = ref(window.PublicKeyCredential !== undefined);
        
        onMounted(() => {
            if (isLoggedIn.value) {
                resolve_navigation();
            }
        });

        const submitCredentials = async () => {
            error.value = '';
            if (!username.value) {
                error.value = 'Enter username';
                return false;
            }
            if (!password.value) {
                error.value = 'Enter password';
                return false;
            }

            try {
                const resp = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'include',
                    body: new URLSearchParams({
                        user: username.value,
                        password: password.value,
                        rememberMe: rememberMe.value ? 'true' : 'false'
                    })
                });

                if (resp.status === 401) {
                    error.value = 'Unauthorized: wrong username or password (401).';
                    return false;
                }

                if (resp.status === 403) {
                    error.value = 'Forbidden: access denied (403).';
                    return false;
                }

                if (resp.status !== 200) {
                    error.value = 'Authentication endpoint returned HTTP ' + resp.status;
                    return false;
                }

                const text = (await resp.text()).trim();

                // Try to parse as JSON and check for Criadores/Establecimientos
                let json = null;
                try {
                    json = JSON.parse(text);
                    if (Array.isArray(json.Criadores)) {
                        localStorage.setItem('Criadores', JSON.stringify(json.Criadores));
                    } else {
                        localStorage.setItem('Criadores', JSON.stringify([]));
                    }
                    if (json.DATA_CRIADOR_ACCESO != null && json.DATA_CRIADOR_ACCESO != '') {
                        localStorage.setItem('DataCriador', JSON.stringify(json.DATA_CRIADOR_ACCESO.Criadores[0]));
                    } else {
                        localStorage.setItem('DataCriador', null);
                    }
                    if (json.ROLES_CRIADOR_ACCESO != null) {
                        localStorage.setItem('CodigoCriador', json.ROLES_CRIADOR_ACCESO);
                    } else {
                        localStorage.setItem('CodigoCriador', 0);
                    }

                    if (Array.isArray(json.Establecimientos)) {
                        localStorage.setItem('Establecimientos', JSON.stringify(json.Establecimientos));
                    } else {
                        localStorage.setItem('Establecimientos', JSON.stringify([]));
                    }
                    if (json.DATA_ESTABLECIMIENTO_ACCESO != null && json.DATA_ESTABLECIMIENTO_ACCESO != '') {
                        localStorage.setItem('DataEstablecimiento', JSON.stringify(json.DATA_ESTABLECIMIENTO_ACCESO.Establecimientos[0]));
                    } else {
                        localStorage.setItem('DataEstablecimiento', null);
                    }
                    if (json.ROLES_ESTABLECIMIENTO_ACCESO != null) {
                        localStorage.setItem('CodigoEstablecimiento', json.ROLES_ESTABLECIMIENTO_ACCESO);
                    } else {
                        localStorage.setItem('CodigoEstablecimiento', 0);
                    }

                } catch (e) {
                    // Not JSON, continue with text checks
                }

                // Define your success condition depending on backend response. Common options:
                if (/^(true|ok|success)$/i.test(text) || text.toLowerCase().includes('autenticaci') || text.toLowerCase().includes('logon')) {
                    return true;
                }

                if (json) {
                    if (json.Result === true || json.success === true || json.authenticated === true || json.isLoggedIn === true) {
                        return true;
                    }
                }

                error.value = 'Authentication failed: ' + text;
                return false;
            } catch (err) {
                error.value = 'Unable to connect to authentication server.';
                return false;
            }
        };

        const resolve_navigation = () => {
            let codigoCriador = localStorage.getItem('CodigoCriador') || 0;
            let codigoEstablecimiento = localStorage.getItem('CodigoEstablecimiento') || 0;

            localStorage.setItem('consulta_publica', codigoCriador == 0 && codigoEstablecimiento == 0);

            if (codigoCriador != 0) {
                
                router.push(`/criador/${codigoCriador}/establecimientos`);
            } else if (codigoEstablecimiento != 0) {
                router.push(`/criador/${codigoCriador}/establecimiento/${codigoEstablecimiento}/animales`);
            } else {
                router.push('/main');
            }
        };

        const simpleLogin = async () => {
            const ok = await submitCredentials();
            if (!ok) return;
            
            const now = Date.now();
            const sessionDurationMs = 60 * 60 * 1000; // 1h for non-remember

            localStorage.setItem('refresh', Math.random());
            localStorage.setItem('user', username.value);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('rememberMe', rememberMe.value ? 'true' : 'false');

            if (rememberMe.value) {
                localStorage.removeItem('authExpires');
            } else {
                localStorage.setItem('authExpires', String(now + sessionDurationMs));
            }

            isLoggedIn.value = true;

            resolve_navigation();

        };

        const clearStorage = () => {
            localStorage.clear();
            username.value = '';
            password.value = '';
            rememberMe.value = false;
            isLoggedIn.value = false;
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

        return { username, password, rememberMe, isLoggedIn, error, hasBiometrics, simpleLogin, clearStorage, biometricLogin };
    }
};

const MainScreen = {
    template: `
        <div class="pwa-page">
            <h1>MERINO - CONSULTA</h1>
            <p>Hello, {{ username }}!</p>
            <router-link to="/criadores"><button>Consulta de criadores</button></router-link>
            <button v-if="false && !isEnrolled" @click="registerBiometric">Enable Fingerprint Login</button>
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
        //...
        const logout = () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
            router.push('/');
        };

        return { username, isEnrolled, error, registerBiometric, logout };
    }
};

const router = new VueRouter({ routes: [
    { path: '/', component: Login },
    { path: '/main', component: MainScreen },
    { path: '/criadores', component: CriadoresList },
    { path: '/criador/:cCriador/establecimientos', component: EstablecimientosList },
    { path: '/criador/:cCriador/establecimiento/:cEstablecimiento/animales', component: AnimalesList },
    { path: '/animal/:cRilAnimal', component: AnimalDetail }
], mode: 'hash' });

router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const expiresAt = Number(localStorage.getItem('authExpires')) || 0;
    const hasExpired = !rememberMe && expiresAt > 0 && Date.now() > expiresAt;

    if (hasExpired) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('authExpires');
        return next('/');
    }

    if (to.path === '/') {
        return loggedIn ? next('/main') : next();
    }

    if (!loggedIn) {
        return next('/');
    }

    next();
});


new Vue({ el: '#app', router, mounted() {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('../sw.js');
}});
