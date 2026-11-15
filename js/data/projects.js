import { CHANNEL_URL } from './videos.js';

export const projects = [
  {
    kind: 'App',
    title: 'Meu espaço de estudos',
    description: 'Organize cursos e aulas, acompanhe seu progresso e use o Pomodoro para registrar o tempo de foco.',
    url: '/estudos/',
    cta: 'Organizar meus estudos',
  },
  {
    kind: 'Canal',
    title: 'Bruno Henrique Tech',
    description: 'Vídeos sobre carreira em TI, currículo e áreas da tecnologia, pensados para quem está começando.',
    url: CHANNEL_URL,
    cta: 'Assistir no YouTube',
  },
  {
    kind: 'Comunidade',
    title: 'Dicas rápidas no Instagram',
    description: 'Conteúdo curto sobre carreira em TI, bastidores do trabalho e respostas às dúvidas de quem me acompanha.',
    url: 'https://instagram.com/brunohenriquetech',
    cta: 'Seguir no Instagram',
  },
];

export const toolbox = [
  '.NET',
  'C#',
  'Linux',
  'Observabilidade',
  'Docker',
  'Cloud',
  'Git',
  'CI/CD',
  'SQL Server',
  'PostgreSQL',
  'n8n',  
  'IA'
];
