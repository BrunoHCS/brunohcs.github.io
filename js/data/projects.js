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
    kind: 'Vídeo',
    title: 'Currículo que passa no ATS',
    description: 'O que é ATS, erros que eliminam candidatos, LinkedIn que gera entrevistas e um modelo de currículo gratuito.',
    url: 'https://www.youtube.com/watch?v=7ZAzE5__Cec',
    cta: 'Ver o vídeo principal',
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
  'SQL Server',
  'PostgreSQL',
  'Linux',
  'Git',
  'n8n',
  'Docker',
  'CI/CD',
  'Cloud',
  'Observabilidade',
];
