document.addEventListener('DOMContentLoaded', () => {
    const configForm = document.getElementById('config-form');
    const filterForm = document.getElementById('filter-form');

    if (configForm) {
        loadConfig();
        configForm.addEventListener('submit', saveConfig);
    }

    if (filterForm) {
        loadParticipants();
        filterForm.addEventListener('submit', applyFilters);
    }
});

function loadConfig() {
    const token = localStorage.getItem('token') || '';
    const clanTag = localStorage.getItem('clan_tag') || '';
    
    document.getElementById('token').value = token;
    document.getElementById('clan_tag').value = clanTag;
}

function saveConfig(event) {
    event.preventDefault();
    
    const token = document.getElementById('token').value;
    const clanTag = document.getElementById('clan_tag').value;

    localStorage.setItem('token', token);
    localStorage.setItem('clan_tag', clanTag);

    alert('Configurações salvas com sucesso!');
    window.location.href = 'index.html';
}

function loadParticipants() {
    const token = localStorage.getItem('token');
    const clanTag = localStorage.getItem('clan_tag');

    if (!token || !clanTag) {
        alert('Configurações não encontradas. Por favor, configure o token e a tag do clã.');
        window.location.href = 'config.html';
        return;
    }

    const API_URL_RACE = `https://api.clashroyale.com/v1/clans/%23${clanTag}/currentriverrace`;
    const API_URL_MEMBERS = `https://api.clashroyale.com/v1/clans/%23${clanTag}/members`;

    fetch(API_URL_RACE, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const participants = data.clan.participants || [];
        fetch(API_URL_MEMBERS, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(membersData => {
            const activeMembersTags = new Set(membersData.items.map(member => member.tag));
            const filteredParticipants = participants.filter(p => activeMembersTags.has(p.tag));
            displayParticipants(filteredParticipants);
        });
    })
    .catch(error => {
        console.error('Erro ao buscar dados:', error);
        alert('Erro ao buscar dados da API.');
    });
}

function displayParticipants(participants) {
    const tbody = document.getElementById('participants-body');
    const notPlayedTodayCount = participants.filter(p => p.decksUsedToday === 0).length;
    const usedTwoDecksTodayCount = participants.filter(p => p.decksUsedToday === 2).length;
    const totalPlayersCount = participants.length;

    // Exibe as estatísticas
    document.getElementById('stats').innerHTML = `
        Jogadores ativos: <strong>${totalPlayersCount}</strong><br>
        Jogadores que ainda não jogaram hoje: <strong>${notPlayedTodayCount}</strong><br>
        Jogadores que usaram exatamente 2 decks hoje: <strong>${usedTwoDecksTodayCount}</strong>
    `;

    // Ordena os participantes por fama
    participants.sort((a, b) => b.fame - a.fame);

    // Renderiza as linhas da tabela
    tbody.innerHTML = participants.map(p => `
        <tr>
            <td>${p.tag}</td>
            <td>${p.name}</td>
            <td>${p.fame}</td>
            <td>${p.repairPoints}</td>
            <td>${p.boatAttacks}</td>
            <td>${p.decksUsed}</td>
            <td>${p.decksUsedToday}</td>
        </tr>
    `).join('');
}

function applyFilters(event) {
    event.preventDefault();
    loadParticipants();
}

function clearFilters() {
    document.getElementById('name-filter').value = '';
    document.getElementById('fame-filter').value = '';
    document.getElementById('decks-used-today-filter').value = '';
    loadParticipants();
}
