const { ref, computed, onMounted } = Vue;

const RandomList = {
    template: `
        <div class="card">
            <h1>Consulta de criadores</h1>
            <input v-model="search" placeholder="Buscar..." />
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ccc; padding: 8px;">Codigo Criador</th>
                        <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Descripcion</th>
                        <th style="border: 1px solid #ccc; padding: 8px; text-align: center;">Contacto</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in filteredItems" :key="item.cCriador || item.name" @click="viewDetails(item.cCriador)" style="cursor: pointer;" @mouseover="$event.target.parentElement.style.backgroundColor='#f0f0f0'" @mouseout="$event.target.parentElement.style.backgroundColor=''">
                        <td style="border: 1px solid #ccc; padding: 8px;">{{ item.cCriador }}</td>
                        <td style="border: 1px solid #ccc; padding: 8px; text-align: left;">{{ item.dCriador }}</td>
                        <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">{{ item.dTelefono }}</td>
                    </tr>
                </tbody>
            </table>
            <button @click="$router.go(-1)">Back</button>
        </div>
    `,
    setup() {
        const items = ref([]);
        const search = ref('');

        const filteredItems = computed(() => {
            if (!search.value) return items.value;
            return items.value.filter(item =>
                (item.cCriador && item.cCriador.toString().toLowerCase().includes(search.value.toLowerCase())) ||
                (item.dCriador && item.dCriador.toLowerCase().includes(search.value.toLowerCase())) ||
                (item.dTelefono && item.dTelefono.toLowerCase().includes(search.value.toLowerCase()))
            );
        });

        onMounted(async () => {
            try {
                const response = await fetch(window.CONSTANTS.API_URLS.CRIADORES_PUBLICOS);
                const data = await response.json();
                items.value = Array.isArray(data.DB.Criadores) ? data.DB.Criadores : [];
            } catch (error) {
                console.error('Error fetching data:', error);
                items.value = [];
            }
        });

        const viewDetails = (cCriador) => {
            router.push(`/establecimientos/${cCriador}`);
        };

        return { items, search, filteredItems, viewDetails };
    }
};
