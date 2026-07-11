const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

const defaultJobs = [
  {
    title: 'Desenvolvedor Front-end',
    company: 'TechNova',
    location: 'Remoto',
    type: 'Pleno',
    description: 'Crie interfaces modernas usando HTML, CSS e JavaScript.',
  },
  {
    title: 'Analista de Marketing Digital',
    company: 'MídiaMais',
    location: 'São Paulo, SP',
    type: 'Júnior',
    description: 'Planeje campanhas e otimize performance em redes sociais.',
  },
  {
    title: 'Gerente de Projetos',
    company: 'InovaCorp',
    location: 'Curitiba, PR',
    type: 'Sênior',
    description: 'Gerencie squads ágeis e conduza entregas estratégicas.',
  },
  {
    title: 'Analista de Recursos Humanos',
    company: 'RH Conecta',
    location: 'Recife, PE',
    type: 'Pleno',
    description: 'Apoie recrutamento, seleção e desenvolvimento interno.',
  },
  {
    title: 'Engenheiro de Dados',
    company: 'DataViva',
    location: 'Remoto',
    type: 'Sênior',
    description: 'Construa pipelines de dados e otimize fluxos de ETL.',
  },
  {
    title: 'UX/UI Designer',
    company: 'PixelLab',
    location: 'Belo Horizonte, MG',
    type: 'Pleno',
    description: 'Desenvolva experiências intuitivas e protótipos de produtos.',
  },
  {
    title: 'Assistente Administrativo',
    company: 'AdminMais',
    location: 'Nova Iguaçu, RJ',
    type: 'Júnior',
    description: 'Apoie rotinas administrativas, atendimento e organização de documentos.',
  },
  {
    title: 'Especialista em Atendimento ao Cliente',
    company: 'HelpDesk 24h',
    location: 'Niterói, RJ',
    type: 'Pleno',
    description: 'Atenda clientes via chat e telefone, resolvendo dúvidas com qualidade.',
  },
  {
    title: 'Analista Financeiro',
    company: 'ContaCerta',
    location: 'São Gonçalo, RJ',
    type: 'Pleno',
    description: 'Controle orçamento, fluxo de caixa e prepare relatórios gerenciais.',
  },
];

let jobs = [...defaultJobs];

const jobsList = document.getElementById('jobs-list');
const searchForm = document.getElementById('search-form');
const keywordInput = document.getElementById('search-keyword');
const locationInput = document.getElementById('search-location');
const toggleAddJob = document.getElementById('toggle-add-job');
const addJobPanel = document.getElementById('add-job-panel');
const addJobForm = document.getElementById('add-job-form');

function renderJobs(items) {
  jobsList.innerHTML = '';
  if (items.length === 0) {
    jobsList.innerHTML = '<p>Nenhuma vaga encontrada. Ajuste os filtros e tente novamente.</p>';
    return;
  }

  items.forEach((job) => {
    const card = document.createElement('article');
    card.className = 'job-card';
    card.innerHTML = `
      ${job.imageUrl ? `<img src="${job.imageUrl}" alt="Imagem da vaga ${job.title}" />` : ''}
      <h3>${job.title}</h3>
      <p><strong>${job.company}</strong></p>
      <p>${job.description}</p>
      <div class="meta">
        <span>${job.location}</span>
        <span>${job.type}</span>
      </div>
    `;
    jobsList.appendChild(card);
  });
}

function filterJobs(event) {
  event.preventDefault();
  const keyword = keywordInput.value.trim().toLowerCase();
  const location = locationInput.value.trim().toLowerCase();

  const filtered = jobs.filter((job) => {
    const text = `${job.title} ${job.company} ${job.description}`.toLowerCase();
    const locationMatch = job.location.toLowerCase().includes(location);
    const keywordMatch = text.includes(keyword);
    return keywordMatch && locationMatch;
  });

  renderJobs(filtered);
}

function loadJobsFromApi() {
  fetch(`${API_BASE_URL}/jobs`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao carregar vagas');
      }
      return response.json();
    })
    .then((data) => {
      jobs = data;
      renderJobs(jobs);
    })
    .catch((error) => {
      console.warn('Falha ao carregar vagas do servidor:', error);
      renderJobs(jobs);
    });
}

function toggleAddJobPanel() {
  addJobPanel.classList.toggle('hidden');
  const isOpen = !addJobPanel.classList.contains('hidden');
  toggleAddJob.textContent = isOpen ? 'Fechar formulário' : 'Adicionar vaga';
}

function handleAddJob(event) {
  event.preventDefault();

  const title = document.getElementById('job-title').value.trim();
  const company = document.getElementById('job-company').value.trim();
  const location = document.getElementById('job-location').value.trim();
  const type = document.getElementById('job-type').value;
  const description = document.getElementById('job-description').value.trim();
  const imageInput = document.getElementById('job-image');
  const imageFile = imageInput.files[0];

  if (!title || !company || !location || !description) {
    alert('Por favor, preencha todos os campos antes de enviar.');
    return;
  }

  const sendJob = (jobData) => {
    fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    })
      .then((response) => response.json())
      .then((newJob) => {
        jobs.unshift(newJob);
        renderJobs(jobs);
        addJobForm.reset();
        addJobPanel.classList.add('hidden');
        toggleAddJob.textContent = 'Adicionar vaga';
      })
      .catch((error) => {
        console.error('Erro ao salvar vaga:', error);
        alert('Não foi possível salvar a vaga no servidor. Tente novamente.');
      });
  };

  const jobData = { title, company, location, type, description };

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = () => {
      jobData.imageUrl = reader.result;
      sendJob(jobData);
    };
    reader.readAsDataURL(imageFile);
    return;
  }

  sendJob(jobData);
}


searchForm.addEventListener('submit', filterJobs);
toggleAddJob.addEventListener('click', toggleAddJobPanel);
addJobForm.addEventListener('submit', handleAddJob);
loadJobsFromApi();
