import type { Treatment, Doctor, TimeSlot, Testimonial, BeforeAfterCase } from '@/types';

export const mockTreatments: Treatment[] = [
  {
    id: 'lentes-porcelana',
    name: 'Lentes de Contato em Porcelana Feldspática',
    category: 'estetica',
    categoryLabel: 'Estética Dental',
    shortDescription: 'Lâminas ultrafinas (0.2mm) feitas sob medida para harmonizar cor, forma e proporção do sorriso.',
    fullDescription: 'Projetadas digitalmente através do nosso scanner intraoral 3D e fresadas roboticamente. Preservação biológica com desgaste dentário mínimo ou nulo, reproduzindo a fluorescência e translucidez natural dos dentes.',
    duration: '2 a 3 sessões',
    discomfortLevel: 'Zero',
    recoveryTime: 'Imediata',
    recommendedSessions: 2,
    highlightTag: 'Assinatura Atelier',
    imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
    features: [
      'Planejamento digital com mockup físico prévio',
      'Cerâmicas nobres de padrão suíço',
      'Alta durabilidade (mais de 15 anos)',
      'Resistência a manchas de café e vinho'
    ],
    startingPriceEstimate: 'Consulte avaliação personalizada'
  },
  {
    id: 'alinhadores-invisiveis',
    name: 'Alinhadores Invisíveis SmartTrack',
    category: 'ortodontia',
    categoryLabel: 'Ortodontia Digital',
    shortDescription: 'Ortodontia transparente com tecnologia de ponta, sem braquetes metálicos e 50% mais rápida.',
    fullDescription: 'Correção ortodôntica milimétrica planejada por software de predição biomecânica. Totalmente removíveis para higienização e refeições, proporcionando discrição absoluta.',
    duration: '4 a 12 meses',
    discomfortLevel: 'Mínimo',
    recoveryTime: 'Imediata',
    recommendedSessions: 6,
    highlightTag: 'Invisível & Confortável',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
    features: [
      'Visualização 3D do resultado final antes do início',
      'Trocas quinzenais monitoradas por IA',
      'Sem restrições alimentares',
      'Acompanhamento presencial e teleodontologia'
    ],
    startingPriceEstimate: 'Planos a partir de avaliação clínica'
  },
  {
    id: 'implantes-guiados-3d',
    name: 'Implantes Guiados por Tomografia 3D',
    category: 'implantes',
    categoryLabel: 'Implantodontia Avançada',
    shortDescription: 'Cirurgia guiada por computador sem cortes com bisturi e sem suturas para recuperação ultra-rápida.',
    fullDescription: 'Utilizando guias cirúrgicos impressos em 3D a partir da tomografia cone-beam do paciente, posicionamos o implante suíço Straumann no ângulo ideal com precisão micrométrica, permitindo carga imediata.',
    duration: '1 sessão cirúrgica',
    discomfortLevel: 'Mínimo',
    recoveryTime: '24 a 48 horas',
    recommendedSessions: 3,
    highlightTag: 'Precisão Cirúrgica',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    features: [
      'Titânio grau médico com nanotecnologia',
      'Sem pontos e sem inchaço significativo',
      'Garantia vitalícia do implante',
      'Possibilidade de coroa no mesmo dia'
    ],
    startingPriceEstimate: 'Sob protocolo personalizado'
  },
  {
    id: 'clareamento-laser',
    name: 'Clareamento Dental Laser & Fotoativado',
    category: 'estetica',
    categoryLabel: 'Estética Dental',
    shortDescription: 'Protocolo de clareamento térmico seguro com dessensibilizante bioativo para até 6 tons mais claros.',
    fullDescription: 'Combinação sinérgica de laser frio de diodo com gel de peróxido estabilizado e barreira gengival fotopolimerizada. Clareia os dentes profundamente sem agredir o esmalte nem provocar sensibilidade residual.',
    duration: '60 minutos',
    discomfortLevel: 'Zero',
    recoveryTime: 'Imediata',
    recommendedSessions: 1,
    highlightTag: 'Resultado Instantâneo',
    imageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
    features: [
      'Tecnologia anti-sensibilidade integrada',
      'Remoção de pigmentações profundas',
      'Polimento diamantado pós-tratamento',
      'Acompanha kit de manutenção domiciliar'
    ],
    startingPriceEstimate: 'Protocolo exclusivo'
  },
  {
    id: 'reabilitacao-oral',
    name: 'Reabilitação Oral Biomimética',
    category: 'reabilitacao',
    categoryLabel: 'Reabilitação Completa',
    shortDescription: 'Restauração da função mastigatória, equilíbrio articular e rejuvenescimento facial do terço inferior.',
    fullDescription: 'Abordagem multidisciplinar integrando oclusão, próteses cerâmicas, periodontia e relaxamento da ATM. Devolve a harmonia estética e a eficiência biológica com suporte estético de longo prazo.',
    duration: '3 a 6 meses',
    discomfortLevel: 'Controlado',
    recoveryTime: 'Gradual',
    recommendedSessions: 5,
    highlightTag: 'Transformação Plena',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    features: [
      'Equilíbrio neuromuscular e alívio de bruxismo',
      'Restauração da dimensão vertical de oclusão',
      'Biocompatibilidade total com tecidos periodontais',
      'Acompanhamento semestral preventivo'
    ],
    startingPriceEstimate: 'Orçamento após planejamento tomográfico'
  }
];

export const mockDoctors: Doctor[] = [
  {
    id: 'doc-alexandre',
    name: 'Dr. Alexandre Valença',
    cro: 'CRO/SP 92.418',
    title: 'Diretor Clínico & Especialista em Reabilitação Oral',
    specialty: 'Estética Dental e Cerâmicas Avançadas',
    bio: 'Mestre em Prótese Dentária pela USP com fellowships na Universidade de Zurique. Referência nacional em odontologia minimamente invasiva e lentes cerâmicas.',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    education: [
      'Mestrado em Odontologia Restauradora - USP',
      'Fellowship em Cerâmicas Dentárias - Univ. Zurique (Suíça)',
      'Pioneiro em Microscopia Operatória no Brasil'
    ],
    supportedTreatments: ['lentes-porcelana', 'reabilitacao-oral', 'clareamento-laser']
  },
  {
    id: 'doc-beatriz',
    name: 'Dra. Beatriz Silveira',
    cro: 'CRO/SP 104.590',
    title: 'Especialista em Ortodontia & Harmonização',
    specialty: 'Ortodontia Digital e Alinhadores Transparentes',
    bio: 'Doutora em Ortodontia pela UNICAMP e Diamond Top Doctor em alinhadores invisíveis. Especializada em tratamentos acelerados para adultos e estética orofacial.',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    education: [
      'Doutorado em Ortodontia - UNICAMP',
      'Invisalign Diamond Provider Top 1%',
      'Certificação Internacional em Ancoragem Esquelética'
    ],
    supportedTreatments: ['alinhadores-invisiveis', 'clareamento-laser']
  },
  {
    id: 'doc-rodrigo',
    name: 'Dr. Rodrigo Castelo Branco',
    cro: 'CRO/SP 88.115',
    title: 'Cirurgião Bucomaxilofacial & Implantodontista',
    specialty: 'Cirurgia Guiada 3D e Carga Imediata',
    bio: 'Especialista em cirurgia avançada pela Mayo Clinic e membro da International Team for Implantology (ITI). Mais de 4.000 implantes realizados com tecnologia de navegação 3D.',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    education: [
      'Residência em Cirurgia Bucomaxilofacial - HC-FMUSP',
      'Member of International Team for Implantology (ITI - Basel)',
      'Docente convidado em Cirurgia Guiada'
    ],
    supportedTreatments: ['implantes-guiados-3d', 'reabilitacao-oral']
  }
];

export const mockTimeSlots: TimeSlot[] = [
  { id: 't1', time: '08:30', period: 'manha', available: true },
  { id: 't2', time: '09:30', period: 'manha', available: false },
  { id: 't3', time: '10:30', period: 'manha', available: true },
  { id: 't4', time: '11:30', period: 'manha', available: true },
  { id: 't5', time: '14:00', period: 'tarde', available: true },
  { id: 't6', time: '15:00', period: 'tarde', available: false },
  { id: 't7', time: '16:00', period: 'tarde', available: true },
  { id: 't8', time: '17:30', period: 'tarde', available: true },
  { id: 't9', time: '18:30', period: 'noite', available: true },
];

export const mockTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    patientName: 'Mariana Duarte',
    role: 'Arquiteta de Interiores',
    treatmentTaken: 'Lentes em Porcelana Feldspática',
    comment: 'A precisão do Dr. Alexandre e da equipe é fora de série. Meu sorriso ficou absolutamente natural, captando a luz com perfeição sem parecer artificial. O acolhimento durante todo o processo pareceu o de um hotel cinco estrelas.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'test-2',
    patientName: 'Carlos Eduardo Fontes',
    role: 'Empresário do Setor Financeiro',
    treatmentTaken: 'Implantes Guiados 3D e Carga Imediata',
    comment: 'Tinha receio de procedimentos cirúrgicos pela dor e tempo de recuperação. Com a cirurgia guiada por tomografia 3D do Dr. Rodrigo, voltei às minhas reuniões no dia seguinte sem incômodo algum. Tecnologia inacreditável.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'test-3',
    patientName: 'Dra. Helena Brandão',
    role: 'Dermatologista',
    treatmentTaken: 'Alinhadores Invisíveis SmartTrack',
    comment: 'Como médica, sou extremamente criteriosa com biossegurança e evidência científica. A Dra. Beatriz conduziu meu alinhamento com total discrição e pontualidade britânica. Recomendo de olhos fechados.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
  }
];

export const mockBeforeAfterCases: BeforeAfterCase[] = [
  {
    id: 'case-1',
    title: 'Harmonização com 10 Lentes Superiores',
    category: 'Estética Dental',
    treatmentName: 'Lentes de Contato em Porcelana',
    beforeImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80',
    summary: 'Fechamento de diastemas e correção da proporção áurea dental com porcelana de alta luminosidade.'
  },
  {
    id: 'case-2',
    title: 'Reabilitação Oclusal com Implantes Straumann',
    category: 'Implantodontia',
    treatmentName: 'Implantes Guiados 3D',
    beforeImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
    summary: 'Substituição de próteses antigas por cerâmica pura sobre implantes e reposicionamento do arco dental.'
  }
];
