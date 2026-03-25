const AnimalesDetail = {
    template: `
        <div class="card">
            <button @click="$router.go(-1)">Back</button>
            <h1>Animales - Criador {{ selectedCriador }} / Establecimiento {{ selectedEstablecimiento }}</h1>

            <div style="margin: 12px 0;">
                <span style="font-weight: bold; margin-right: 8px;">Género:</span>
                <button :style="{ backgroundColor: bGenero === 1 ? '#ADD8E6' : 'inherit' }" @click="selectGenero(1)">Macho</button>
                <button :style="{ backgroundColor: bGenero === 0 ? '#ADD8E6' : 'inherit' }" @click="selectGenero(0)">Hembra</button>
            </div>

            <div v-if="loading" style="display: flex; justify-content: center; align-items: center; height: 180px;">
                <div class="loader"></div>
            </div>

            <div v-else>
                <p v-if="error" style="color: red;">{{ error }}</p>
                <p v-else-if="animales.length === 0" style="text-align: center; color: #999;">No se encontraron animales para este filtro.</p>
                <table v-else style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ccc; padding: 8px;">ID Animal</th>
                            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">RP</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in animales" :key="item.cRilAnimal" @click="goToAnimalDetail(item.cRilAnimal)" style="border-bottom: 1px solid #ccc; cursor: pointer; transition: background-color 0.2s;" @mouseover="$event.target.parentElement.style.backgroundColor = '#f0f0f0'" @mouseout="$event.target.parentElement.style.backgroundColor = ''">
                            <td style="border: 1px solid #ccc; padding: 8px;">{{ item.cRilAnimal || item.cAnimal || item.id }}</td>
                            <td style="border: 1px solid #ccc; padding: 8px; text-align: left;">{{ (item.RP || '').toString().toUpperCase() }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <button @click="$router.go(-1)">Back</button>
        </div>
    `,
    setup() {
        const selectedCriador = ref(router.currentRoute.params.cCriador || '');
        const selectedEstablecimiento = ref(Number(router.currentRoute.params.cEstablecimiento) || 0);
        const bGenero = ref(1);
        const animales = ref([]);
        const loading = ref(false);
        const error = ref('');

        const fetchAnimales = async () => {
            if (!selectedCriador.value || !selectedEstablecimiento.value) {
                animales.value = [];
                return;
            }

            loading.value = true;
            error.value = '';
            animales.value = [];

            try {
                const params = new URLSearchParams();
                params.set('cCriador', selectedCriador.value.toString());
                params.set('cEstablecimiento', selectedEstablecimiento.value.toString());
                params.set('bGenero', bGenero.value.toString());

                const url = `${window.CONSTANTS.API_URLS.CRIADORES_ANIMALES}?${params.toString()}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                // Assume API returns an array directly, or in data.Animales
                if (Array.isArray(data)) {
                    animales.value = data;
                } else if (Array.isArray(data.Animales)) {
                    animales.value = data.Animales;
                } else if (Array.isArray(data.DB?.Animales)) {
                    animales.value = data.DB.Animales;
                } else {
                    animales.value = [];
                }
            } catch (err) {
                console.error('Error fetching animales:', err);
                error.value = `No se pudo cargar Animales: ${err.message}`;
            } finally {
                loading.value = false;
            }
        };

        const selectGenero = (value) => {
            if (bGenero.value === value) return;
            bGenero.value = value;
            fetchAnimales();
        };

        const goToAnimalDetail = (cRilAnimal) => {
            router.push(`/animal/${cRilAnimal}`);
        };

        onMounted(() => {
            fetchAnimales();
        });

        return { selectedCriador, selectedEstablecimiento, bGenero, animales, loading, error, selectGenero, goToAnimalDetail };
    }
};
