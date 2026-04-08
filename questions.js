// questions.js
// All 12 survey questions in English and French
// PHQ-2, MASS, RIBS, CAMI validated instruments

const questions = {
  
  EN: {
    welcome: "CON Welcome to Faith & Mind Cameroon!\nMental Health Survey\n\n1. Start Survey\n2. About this Survey",
    
    about: "END This survey helps us reduce mental health stigma in Cameroon. Your answers are anonymous. It takes 5-7 minutes. Dial again to start.",
    
    enter_id: "CON Please enter your Participant ID Code:\n(Example: ADV01-001)\n\nContact your advocate if you don't have a code.",
    
    invalid_id: "END Invalid ID code. Please contact your advocate for the correct code.",
    
    survey_type: "CON Welcome! You have an active survey.\n\n1. Pre-Meeting Survey (Before the meeting)\n2. Post-Meeting Survey (After the meeting)",
    
    already_done: "END You have already completed both surveys. Thank you for your participation!",
    
    // PHQ-2 Questions (Depression Screening)
    phq2_q1: "CON QUESTION 1 of 12\n(PHQ-2: Depression Screening)\n\nOver the past 2 weeks, how often have you felt down, depressed, or hopeless?\n\n1. Not at all\n2. Several days\n3. More than half the days\n4. Nearly every day",
    
    phq2_q2: "CON QUESTION 2 of 12\n(PHQ-2: Depression Screening)\n\nOver the past 2 weeks, how often have you had little interest or pleasure in doing things?\n\n1. Not at all\n2. Several days\n3. More than half the days\n4. Nearly every day",
    
    // MASS Questions (Mental illness Attitude Scale for Students)
    mass_q1: "CON QUESTION 3 of 12\n(Stigma Attitudes)\n\nPeople with mental illness are dangerous.\n\n1. Strongly Disagree\n2. Disagree\n3. Neutral\n4. Agree\n5. Strongly Agree",
    
    mass_q2: "CON QUESTION 4 of 12\n(Stigma Attitudes)\n\nPeople with mental illness cannot recover and lead normal lives.\n\n1. Strongly Disagree\n2. Disagree\n3. Neutral\n4. Agree\n5. Strongly Agree",
    
    mass_q3: "CON QUESTION 5 of 12\n(Stigma Attitudes)\n\nI would not want to live next door to someone with mental illness.\n\n1. Strongly Disagree\n2. Disagree\n3. Neutral\n4. Agree\n5. Strongly Agree",
    
    // RIBS Questions (Reported and Intended Behaviour Scale)
    ribs_q1: "CON QUESTION 6 of 12\n(Social Inclusion)\n\nI would be willing to live with someone who has a mental illness.\n\n1. Agree\n2. Disagree\n3. Neutral",
    
    ribs_q2: "CON QUESTION 7 of 12\n(Social Inclusion)\n\nI would be willing to work with someone who has a mental illness.\n\n1. Agree\n2. Disagree\n3. Neutral",
    
    ribs_q3: "CON QUESTION 8 of 12\n(Social Inclusion)\n\nI would be willing to have someone with mental illness as a close friend.\n\n1. Agree\n2. Disagree\n3. Neutral",
    
    ribs_q4: "CON QUESTION 9 of 12\n(Social Inclusion)\n\nI would continue a relationship with a friend who developed mental illness.\n\n1. Agree\n2. Disagree\n3. Neutral",
    
    // CAMI Questions (Community Attitudes toward Mental Illness)
    cami_q1: "CON QUESTION 10 of 12\n(Community Attitudes)\n\nMental hospitals are an outdated means of treating people with mental illness.\n\n1. Strongly Disagree\n2. Disagree\n3. Neutral\n4. Agree\n5. Strongly Agree",
    
    cami_q2: "CON QUESTION 11 of 12\n(Community Attitudes)\n\nPeople with mental illness have for too long been the subject of ridicule in our society.\n\n1. Strongly Disagree\n2. Disagree\n3. Neutral\n4. Agree\n5. Strongly Agree",
    
    cami_q3: "CON QUESTION 12 of 12\n(Community Attitudes)\n\nThe best therapy for many people with mental illness is to be part of a normal community.\n\n1. Strongly Disagree\n2. Disagree\n3. Neutral\n4. Agree\n5. Strongly Agree",
    
    thank_you_pre: "END Thank you for completing the PRE-meeting survey!\n\nPlease attend the meeting and complete the survey again AFTER the meeting using the same ID code.\n\nFaith & Mind Cameroon thanks you!",
    
    thank_you_post: "END Thank you for completing the POST-meeting survey!\n\nYour participation helps reduce mental health stigma in Cameroon.\n\nFaith & Mind Cameroon thanks you! 🌟",
    
    error: "END An error occurred. Please try again or contact your advocate.\n\nFaith & Mind Cameroon"
  },
  
  FR: {
    welcome: "CON Bienvenue chez Faith & Mind Cameroun!\nEnquête sur la Santé Mentale\n\n1. Commencer l'Enquête\n2. À propos de cette Enquête",
    
    about: "END Cette enquête aide à réduire la stigmatisation liée à la santé mentale au Cameroun. Vos réponses sont anonymes. Durée: 5-7 minutes. Composez à nouveau pour commencer.",
    
    enter_id: "CON Veuillez entrer votre Code d'Identification:\n(Exemple: ADV01-001)\n\nContactez votre délégué si vous n'avez pas de code.",
    
    invalid_id: "END Code invalide. Contactez votre délégué pour le code correct.",
    
    survey_type: "CON Bienvenue! Vous avez une enquête active.\n\n1. Enquête Pré-Réunion (Avant la réunion)\n2. Enquête Post-Réunion (Après la réunion)",
    
    already_done: "END Vous avez déjà complété les deux enquêtes. Merci de votre participation!",
    
    // PHQ-2 en Français
    phq2_q1: "CON QUESTION 1 sur 12\n(PHQ-2: Dépistage Dépression)\n\nAu cours des 2 dernières semaines, combien de fois vous êtes-vous senti(e) déprimé(e) ou sans espoir?\n\n1. Jamais\n2. Plusieurs jours\n3. Plus de la moitié des jours\n4. Presque tous les jours",
    
    phq2_q2: "CON QUESTION 2 sur 12\n(PHQ-2: Dépistage Dépression)\n\nAu cours des 2 dernières semaines, combien de fois avez-vous eu peu d'intérêt ou de plaisir à faire les choses?\n\n1. Jamais\n2. Plusieurs jours\n3. Plus de la moitié des jours\n4. Presque tous les jours",
    
    // MASS en Français
    mass_q1: "CON QUESTION 3 sur 12\n(Attitudes de Stigmatisation)\n\nLes personnes atteintes de maladie mentale sont dangereuses.\n\n1. Fortement en désaccord\n2. En désaccord\n3. Neutre\n4. D'accord\n5. Fortement d'accord",
    
    mass_q2: "CON QUESTION 4 sur 12\n(Attitudes de Stigmatisation)\n\nLes personnes atteintes de maladie mentale ne peuvent pas guérir et mener une vie normale.\n\n1. Fortement en désaccord\n2. En désaccord\n3. Neutre\n4. D'accord\n5. Fortement d'accord",
    
    mass_q3: "CON QUESTION 5 sur 12\n(Attitudes de Stigmatisation)\n\nJe ne voudrais pas vivre à côté d'une personne atteinte de maladie mentale.\n\n1. Fortement en désaccord\n2. En désaccord\n3. Neutre\n4. D'accord\n5. Fortement d'accord",
    
    // RIBS en Français
    ribs_q1: "CON QUESTION 6 sur 12\n(Inclusion Sociale)\n\nJe serais prêt(e) à vivre avec quelqu'un qui a une maladie mentale.\n\n1. D'accord\n2. En désaccord\n3. Neutre",
    
    ribs_q2: "CON QUESTION 7 sur 12\n(Inclusion Sociale)\n\nJe serais prêt(e) à travailler avec quelqu'un qui a une maladie mentale.\n\n1. D'accord\n2. En désaccord\n3. Neutre",
    
    ribs_q3: "CON QUESTION 8 sur 12\n(Inclusion Sociale)\n\nJe serais prêt(e) à avoir comme ami(e) proche quelqu'un atteint de maladie mentale.\n\n1. D'accord\n2. En désaccord\n3. Neutre",
    
    ribs_q4: "CON QUESTION 9 sur 12\n(Inclusion Sociale)\n\nJe maintiendrais une relation avec un(e) ami(e) qui développerait une maladie mentale.\n\n1. D'accord\n2. En désaccord\n3. Neutre",
    
    // CAMI en Français
    cami_q1: "CON QUESTION 10 sur 12\n(Attitudes Communautaires)\n\nLes hôpitaux psychiatriques sont un moyen dépassé de traiter les personnes atteintes de maladie mentale.\n\n1. Fortement en désaccord\n2. En désaccord\n3. Neutre\n4. D'accord\n5. Fortement d'accord",
    
    cami_q2: "CON QUESTION 11 sur 12\n(Attitudes Communautaires)\n\nLes personnes atteintes de maladie mentale ont trop longtemps été ridiculisées dans notre société.\n\n1. Fortement en désaccord\n2. En désaccord\n3. Neutre\n4. D'accord\n5. Fortement d'accord",
    
    cami_q3: "CON QUESTION 12 sur 12\n(Attitudes Communautaires)\n\nLa meilleure thérapie pour beaucoup de personnes atteintes de maladie mentale est de faire partie d'une communauté normale.\n\n1. Fortement en désaccord\n2. En désaccord\n3. Neutre\n4. D'accord\n5. Fortement d'accord",
    
    thank_you_pre: "END Merci d'avoir complété l'enquête PRÉ-réunion!\n\nAssistez à la réunion et complétez l'enquête à nouveau APRÈS la réunion avec le même code.\n\nFaith & Mind Cameroun vous remercie!",
    
    thank_you_post: "END Merci d'avoir complété l'enquête POST-réunion!\n\nVotre participation aide à réduire la stigmatisation au Cameroun.\n\nFaith & Mind Cameroun vous remercie! 🌟",
    
    error: "END Une erreur s'est produite. Réessayez ou contactez votre délégué.\n\nFaith & Mind Cameroun"
  }
};

module.exports = questions;
