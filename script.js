// Banco de Dados
let db = JSON.parse(localStorage.getItem('stock_db_final')) || [
    { id: 1, name: 'MacBook Pro M3', cat: 'Hardware', qty: 10, price: 15000 },
    { id: 2, name: 'Monitor Studio Display', cat: 'Hardware', qty: 4, price: 12000 }
];

let charts = {};

function init() {
    lucide.createIcons();
    initCharts();
    updateUI();
}

// TROCA DE ABAS (O que faltava)
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`tab-${tab}`).classList.add('active');
    event.currentTarget.classList.add('active');
    
    const titles = { dash: 'Intelligence Overview', inventory: 'Master Inventory', reports: 'System Reports' };
    document.getElementById('page-title').innerText = titles[tab];
}

function updateUI() {
    localStorage.setItem('stock_db_final', JSON.stringify(db));
    renderTable();
    calculateStats();
    updateCharts();
}

function renderTable() {
    const body = document.getElementById('inventory-body');
    body.innerHTML = db.map((item, index) => `
        <tr>
            <td><b>${item.name}</b></td>
            <td>${item.cat}</td>
            <td>${item.qty} un</td>
            <td>R$ ${Number(item.price).toLocaleString()}</td>
            <td><span style="color:${item.qty < 5 ? '#991b1b' : '#22c55e'}">${item.qty < 5 ? 'Baixo' : 'Ok'}</span></td>
            <td style="text-align:right">
                <button class="btn-del" onclick="deleteItem(${index})">Remover</button>
            </td>
        </tr>
    `).join('');
}

function calculateStats() {
    const totalQty = db.reduce((a, b) => a + Number(b.qty), 0);
    const totalWorth = db.reduce((a, b) => a + (b.qty * b.price), 0);
    const alerts = db.filter(i => i.qty < 5).length;

    document.getElementById('kpi-total').innerText = totalQty;
    document.getElementById('kpi-worth').innerText = totalWorth.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    document.getElementById('kpi-alerts').innerText = alerts;
}

function initCharts() {
    const dCtx = document.getElementById('chartDoughnut').getContext('2d');
    charts.doughnut = new Chart(dCtx, {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: ['#991b1b', '#333', '#666'], borderWidth: 0 }] },
        options: { cutout: '80%', plugins: { legend: { display: false } } }
    });

    const bCtx = document.getElementById('chartBar').getContext('2d');
    charts.bar = new Chart(bCtx, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Estoque', data: [], backgroundColor: '#991b1b' }] },
        options: { scales: { y: { display: false } } }
    });
}

function updateCharts() {
    const cats = [...new Set(db.map(i => i.cat))];
    const catData = cats.map(c => db.filter(i => i.cat === c).reduce((a, b) => a + Number(b.qty), 0));
    
    charts.doughnut.data.labels = cats;
    charts.doughnut.data.datasets[0].data = catData;
    charts.doughnut.update();

    charts.bar.data.labels = db.map(i => i.name);
    charts.bar.data.datasets[0].data = db.map(i => i.qty);
    charts.bar.update();
}

// RELATÓRIO (Exportar CSV)
function exportData() {
    let csv = "Produto;Categoria;Quantidade;Preco\n";
    db.forEach(i => csv += `${i.name};${i.cat};${i.qty};${i.price}\n`);
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio_estoque.csv';
    a.click();
}

function saveRecord() {
    const name = document.getElementById('p-name').value;
    const cat = document.getElementById('p-cat').value;
    const qty = document.getElementById('p-qty').value;
    const price = document.getElementById('p-price').value;

    if(name && qty) {
        db.push({ name, cat, qty, price });
        updateUI();
        closeModal();
    }
}

function deleteItem(i) { db.splice(i, 1); updateUI(); }
function openModal() { document.getElementById('modalOverlay').style.display = 'flex'; }
function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }

init();