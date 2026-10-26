export type SpecClause = {
  id: string;
  text: string;
};

export type SpecClauseSection = {
  id: string;
  label: string;
  clauses: SpecClause[];
};

export const SPEC_CLAUSE_SECTIONS: SpecClauseSection[] = [
  {
    id: "generalites",
    label: "Généralités",
    clauses: [
      {
        id: "gen-1",
        text: "Divers panneaux de marquage et de prescription.",
      },
      {
        id: "gen-2",
        text: "Récipient fermé permettant l’entreposage des chiffons propres au local ou en fond de fosse.",
      },
      {
        id: "gen-3",
        text: "Porte-documents fixé contre le mur.",
      },
      {
        id: "gen-4",
        text: "Établissement des plans et fourniture du nombre nécessaire à la réalisation.",
      },
      {
        id: "gen-5",
        text: "Demandes d’autorisations si nécessaires.",
      },
      {
        id: "gen-6",
        text: "Transport, emballage et déchargement du matériel.",
      },
      {
        id: "gen-7",
        text: "Évacuation des emballages, y compris taxes.",
      },
      {
        id: "gen-8",
        text: "Éventuelles taxes de location du domaine public.",
      },
      {
        id: "gen-9",
        text: "Mise à disposition de la charge nécessaire pour les essais.",
      },
      {
        id: "gen-10",
        text: "Montage, essais et mise en service.",
      },
      {
        id: "gen-11",
        text: "Fourniture des documents de conformité.",
      },
      {
        id: "gen-12",
        text: "Analyse de risque pour les tuyaux au local machines, inclus les capotages.",
      },
      {
        id: "gen-13",
        text: "L’ensemble doit être conforme aux normes EN 81-20 et EN 81-50 ainsi qu’à la directive de protection incendie AEAI 23-15.",
      },
    ],
  },
  {
    id: "specificites",
    label: "Spécificités du projet",
    clauses: [
      {
        id: "spec-1",
        text: "Les dimensions de la cage doivent être exploitées au maximum.",
      },
      {
        id: "spec-2",
        text: "Un nouvel accès sera créé ; la structure existante de la gaine sera adaptée pour l’implantation de la nouvelle porte palière. Les renforcements de structure nécessaires à cette modification sont prévus et pris en charge par le maître d’ouvrage (MO).",
      },
      {
        id: "spec-3",
        text: "Si des renforts complémentaires sont nécessaires à l’implantation de l’installation, le soumissionnaire les intègre dans la présente soumission.",
      },
      {
        id: "spec-4",
        text: "Le verre de la cage vitrée sera tôlé par le MO.",
      },
    ],
  },
  {
    id: "travaux",
    label: "Travaux à prévoir (à exécuter par l’ascensoriste)",
    clauses: [
      {
        id: "trav-1",
        text: "Démontage et évacuation de l’installation existante, inclus les portes palières.",
      },
      {
        id: "trav-2",
        text: "Évacuation et élimination de l’ancien matériel selon les directives locales concernant le recyclage.",
      },
      {
        id: "trav-3",
        text: "Une attention particulière sera donnée pour l’élimination des éléments pouvant contenir de l’amiante, tels que les garnitures de frein, l’isolation de certaines portes, etc.",
      },
      {
        id: "trav-4",
        text: "Fourniture et pose des ponts de montage en gaine, selon les directives SUVA (cages d’ascenseurs et travail en sécurité).",
      },
      {
        id: "trav-5",
        text: "Pose des SAS de protection devant chaque porte palière, avec cylindre et bouton tournant du côté intérieur de la trémie.",
      },
    ],
  },
  {
    id: "traction",
    label: "Système de traction",
    clauses: [
      {
        id: "trac-1",
        text: "Machine entraînée par convertisseur de fréquence.",
      },
      {
        id: "trac-2",
        text: "180 démarrages/heure.",
      },
      {
        id: "trac-3",
        text: "Arrivée directe à l’étage avec une précision de ± 3 mm.",
      },
      {
        id: "trac-4",
        text: "Isonivelage automatique.",
      },
      {
        id: "trac-5",
        text: "Châssis de fixation de la machine.",
      },
      {
        id: "trac-6",
        text: "Silentblocs pour l’isolation du châssis.",
      },
      {
        id: "trac-7",
        text: "Type de machine : Gearless (treuil, planétaire, Gearless, etc.).",
      },
      {
        id: "trac-8",
        text: "Emplacement de la machine : en tête de gaine.",
      },
      {
        id: "trac-9",
        text: "Emplacement de la machine : dans le local.",
      },
      {
        id: "trac-10",
        text: "Emplacement de la machine : en fosse.",
      },
      {
        id: "trac-11",
        text: "Puissance de la machine (à indiquer par le soumissionnaire).",
      },
      {
        id: "trac-12",
        text: "Courant nominal et courant de démarrage (à indiquer par le soumissionnaire).",
      },
      {
        id: "trac-13",
        text: "Tension : 3 x 400 V / 230 V 50 Hz.",
      },
    ],
  },
  {
    id: "manoeuvre",
    label: "Manœuvre",
    clauses: [
      {
        id: "man-1",
        text: "Manœuvre collective-descente (service bus).",
      },
      {
        id: "man-2",
        text: "Coffret principal verrouillable.",
      },
      {
        id: "man-3",
        text: "Câbles pendentifs, information de gaine et ligne de commande.",
      },
      {
        id: "man-4",
        text: "Ligne d’équipotentielle et de mise à terre entre les éléments spécifiques à l’ascenseur.",
      },
      {
        id: "man-5",
        text: "L’armoire de manœuvre sera positionnée au local machines ; la porte de ce dernier devra être remplacée par un modèle EI30 par le prestataire.",
      },
    ],
  },
  {
    id: "complement-manoeuvre",
    label: "Complément de manœuvre",
    clauses: [
      {
        id: "man-6",
        text: "Compteur du nombre de courses.",
      },
      {
        id: "man-7",
        text: "Dispositif de rappel incendie au niveau principal, inclus fourniture du cylindre.",
      },
      {
        id: "man-8",
        text: "Dispositif de surcharge.",
      },
      {
        id: "man-9",
        text: "Ouverture anticipée des portes.",
      },
      {
        id: "man-10",
        text: "Dispositif de réservation inclus fourniture du cylindre et de 5 clés.",
      },
    ],
  },
  {
    id: "tableaux",
    label: "Tableaux",
    clauses: [
      {
        id: "tab-1",
        text: "Le positionnement et les boutons correspondent aux directives pour les personnes handicapées.",
      },
      {
        id: "tab-2",
        text: "Les cylindres doivent être affleurés dans les différentes platines, avec une introduction de la clé depuis la face avant de la platine.",
      },
    ],
  },
  {
    id: "tableau-cabine",
    label: "Tableau de cabine",
    clauses: [
      {
        id: "tab-3",
        text: "Exécution de la platine et des boutons en acier inoxydable.",
      },
      {
        id: "tab-4",
        text: "Boutons de commande avec quittance lumineuse.",
      },
      {
        id: "tab-5",
        text: "Commande à clé pour un niveau (cylindre existant à récupérer).",
      },
      {
        id: "tab-6",
        text: "Bouton d’ouverture de porte.",
      },
      {
        id: "tab-7",
        text: "Bouton de fermeture de porte.",
      },
      {
        id: "tab-8",
        text: "Éclairage de secours intégré.",
      },
      {
        id: "tab-9",
        text: "Voyant « surcharge » (optique et acoustique).",
      },
      {
        id: "tab-10",
        text: "Indicateur d’étage.",
      },
      {
        id: "tab-11",
        text: "Bouton d’alarme combiné avec le dispositif de transmission.",
      },
      {
        id: "tab-12",
        text: "Micro et haut-parleur pour le dispositif de transmission d’alarme.",
      },
      {
        id: "tab-13",
        text: "Signal d’alarme sonore depuis la cabine.",
      },
      {
        id: "tab-14",
        text: "Cylindre pour le dispositif de réservation.",
      },
      {
        id: "tab-15",
        text: "Informations relatives au point 5.4.2.3.2 de l’EN 81-20.",
      },
    ],
  },
  {
    id: "tableau-etage",
    label: "Tableaux d’étage",
    clauses: [
      {
        id: "tab-16",
        text: "Exécution de la platine et des boutons en acier inoxydable.",
      },
      {
        id: "tab-17",
        text: "Boutons avec quittance d’enregistrement de la commande.",
      },
      {
        id: "tab-18",
        text: "Flèches de préavis de sens de marche.",
      },
      {
        id: "tab-19",
        text: "Cylindre pour le dispositif de rappel incendie à l’arrêt principal.",
      },
      {
        id: "tab-20",
        text: "Fermeture des anciennes ouvertures par des tôles montées affleurées aux cadres.",
      },
      {
        id: "tab-21",
        text: "Les tableaux d’étages seront positionnés dans les cadres (exécution encastrée). Les percements sont à effectuer par l’ascensoriste.",
      },
    ],
  },
  {
    id: "alarme",
    label: "Transmission d’alarme",
    clauses: [
      {
        id: "al-1",
        text: "Dispositif de transmission d’alarme bidirectionnelle par réseau mobile 4G (VoLTE) ou 5G, conforme à l’EN 81-28.",
      },
      {
        id: "al-2",
        text: "Un haut-parleur sera obligatoirement placé en cabine pour une parfaite audibilité.",
      },
      {
        id: "al-3",
        text: "L’actionnement du dispositif s’effectuera uniquement avec le bouton d’appel d’urgence placé sur le tableau de cabine.",
      },
      {
        id: "al-4",
        text: "Il surveillera en permanence l’état du réseau mobile.",
      },
      {
        id: "al-5",
        text: "Si nécessaire, l’antenne sera prolongée le long de la cage pour obtenir une réception suffisante. Cette dernière devra être installée de manière fixe. Le contrôle du réseau et les éventuels travaux complémentaires sont à effectuer par et sous la responsabilité de l’ascensoriste. Les frais y relatifs sont à inclure dans la présente soumission.",
      },
    ],
  },
  {
    id: "cabine",
    label: "Cabine",
    clauses: [
      {
        id: "cab-1",
        text: "La structure de cabine sera réalisée en matériaux RF1, y compris le plancher.",
      },
      {
        id: "cab-2",
        text: "Les revêtements intérieurs (sol et parois) seront en matériaux RF2.",
      },
      {
        id: "cab-3",
        text: "Revêtement des parois de cabine en stratifié standard de la collection de base (Formica / Polyrey / Kelco).",
      },
      {
        id: "cab-4",
        text: "Entrée de cabine en acier inoxydable brossé ou structuré (sans plus-value), selon choix du MO.",
      },
      {
        id: "cab-5",
        text: "Revêtement de sol en PVC ou granit synthétique (sans plus-value), selon choix du MO.",
      },
      {
        id: "cab-6",
        text: "Plinthes en acier inoxydable.",
      },
      {
        id: "cab-7",
        text: "Plafond en acier inoxydable brossé ou poli-miroir, avec éclairage de cabine par LED.",
      },
      {
        id: "cab-8",
        text: "Main-courante en acier inoxydable, sur la paroi latérale, à côté du tableau.",
      },
      {
        id: "cab-9",
        text: "Miroir sur la paroi latérale, de la main-courante au plafond.",
      },
      {
        id: "cab-10",
        text: "L’entrée de cabine et le décrochement des portes ne font pas partie de la profondeur de cabine.",
      },
    ],
  },
  {
    id: "portes-cabine",
    label: "Portes de cabine",
    clauses: [
      {
        id: "pcab-1",
        text: "Ouverture centrale télescopique en 2 parties.",
      },
      {
        id: "pcab-2",
        text: "Ouverture centrale télescopique en 4 parties.",
      },
      {
        id: "pcab-3",
        text: "Modèle slim ou fineline.",
      },
      {
        id: "pcab-4",
        text: "Exécution en acier inoxydable brossé ou structuré (sans plus-value).",
      },
      {
        id: "pcab-5",
        text: "Entraînement par convertisseur de fréquence.",
      },
      {
        id: "pcab-6",
        text: "Tôle chasse-pied.",
      },
      {
        id: "pcab-7",
        text: "Barrière lumineuse de sécurité sur toute la hauteur, positionnée entre la porte cabine et les portes palières.",
      },
      {
        id: "pcab-8",
        text: "Autres dimensions de porte possibles pour le fournisseur (sans modification du prix).",
      },
    ],
  },
  {
    id: "portes-palieres",
    label: "Portes palières avec cadres",
    clauses: [
      {
        id: "ppal-1",
        text: "Dimensions idem porte de cabine.",
      },
      {
        id: "ppal-2",
        text: "Exécution des vantaux en tôle d’acier, enduits de peinture primaire. Pour les réalisations de peinture primaire en deux composants (époxy ou thermolaqué), les vantaux seront livrés dans la teinte RAL choisie par le MO.",
      },
      {
        id: "ppal-3",
        text: "Résistance au feu E30.",
      },
      {
        id: "ppal-4",
        text: "Découpe des cadres de portes, si nécessaire.",
      },
      {
        id: "ppal-5",
        text: "Évacuation des anciens battants de portes.",
      },
      {
        id: "ppal-6",
        text: "Montage des portes sur les ouvertures existantes.",
      },
      {
        id: "ppal-7",
        text: "Chemisage des anciens cadres en tôle à peindre. La résistance au feu de ces éléments sera identique aux portes.",
      },
      {
        id: "ppal-8",
        text: "Tôle de raccord avec l’ancien seuil en acier inox structuré.",
      },
      {
        id: "ppal-9",
        text: "Toutes les mesures de protection entre le démontage des battants et la pose des nouvelles portes.",
      },
      {
        id: "ppal-10",
        text: "Tôle chasse-pieds.",
      },
      {
        id: "ppal-11",
        text: "Traverses de fixation ou rails Halfen.",
      },
    ],
  },
  {
    id: "revision",
    label: "Manœuvre de révision",
    clauses: [
      {
        id: "rev-1",
        text: "Tableaux de révision fixés sur le toit de cabine et en fond de fosse.",
      },
    ],
  },
  {
    id: "fosse",
    label: "Fosse",
    clauses: [
      {
        id: "fos-1",
        text: "Échelle de fond de fosse fixée à la cage. Les modèles amovibles devront impérativement être munis d’un contact empêchant l’installation de démarrer si elle n’est pas en place.",
      },
      {
        id: "fos-2",
        text: "Interrupteur de sécurité disposé à côté de l’échelle d’accès à la fosse.",
      },
      {
        id: "fos-3",
        text: "Tôle de séparation entre le contrepoids et la cabine.",
      },
    ],
  },
  {
    id: "amortisseurs",
    label: "Amortisseurs",
    clauses: [
      {
        id: "amo-1",
        text: "Amortisseurs de cabine et de contrepoids en fond de fosse.",
      },
      {
        id: "amo-2",
        text: "Béquilles réglables fixées au fond de fosse ou cales placées sous les contrepoids pour permettre de compenser ultérieurement l’allongement des câbles.",
      },
    ],
  },
  {
    id: "survitesse",
    label: "Gestion de la survitesse",
    clauses: [
      {
        id: "sur-1",
        text: "Limiteur de vitesse.",
      },
      {
        id: "sur-2",
        text: "Poulie tendeuse munie d’un contact.",
      },
      {
        id: "sur-3",
        text: "Câble.",
      },
      {
        id: "sur-4",
        text: "Capot de protection pour les machines en haut.",
      },
      {
        id: "sur-5",
        text: "Réarmement à distance s’il est placé en tête de gaine ou si la hauteur du local est insuffisante.",
      },
      {
        id: "sur-6",
        text: "Autre dispositif régulé électroniquement.",
      },
    ],
  },
  {
    id: "guidages-cabine",
    label: "Guidages de cabine",
    clauses: [
      {
        id: "gui-1",
        text: "Nouveaux guidages de cabine, inclus consoles de fixation et traverses complémentaires.",
      },
      {
        id: "gui-2",
        text: "Pose de récipient pour la récupération de l’huile.",
      },
    ],
  },
  {
    id: "guidages-contrepoids",
    label: "Guidages de contrepoids",
    clauses: [
      {
        id: "gui-3",
        text: "Nouveaux guidages de contrepoids, inclus consoles de fixation et traverses complémentaires.",
      },
      {
        id: "gui-4",
        text: "Pose de récipient pour la récupération de l’huile.",
      },
    ],
  },
  {
    id: "contrepoids",
    label: "Contrepoids",
    clauses: [
      {
        id: "ctr-1",
        text: "Contrepoids complet.",
      },
    ],
  },
  {
    id: "organe-traction",
    label: "Organe de traction",
    clauses: [
      {
        id: "ctr-2",
        text: "Éléments de traction, inclus suspension de cabine et de contrepoids.",
      },
    ],
  },
  {
    id: "coffre-cles",
    label: "Coffre à clés",
    clauses: [
      {
        id: "ter-1",
        text: "Fourniture et pose d’un coffre à clés.",
      },
    ],
  },
  {
    id: "mise-a-terre",
    label: "Mise à terre",
    clauses: [
      {
        id: "ter-2",
        text: "Fourniture et pose de la liaison équipotentielle de l’armoire de commande de l’ascenseur au local SE selon les besoins du soumissionnaire, relatif à la norme EN 60204-1.",
      },
    ],
  },
  {
    id: "eclairage",
    label: "Éclairage de gaine",
    clauses: [
      {
        id: "ecl-1",
        text: "Démontage de l’ancien éclairage.",
      },
      {
        id: "ecl-2",
        text: "Pose d’un éclairage minimum 50 Lux dans la trémie.",
      },
      {
        id: "ecl-3",
        text: "Pose de 2 interrupteurs « schéma 3 » pour allumer la trémie, un au niveau de la fosse et l’autre dans le local ou l’armoire de manœuvre (schéma 6 pour la machine en gaine, avec un interrupteur supplémentaire en haut de la cage ou sur le toit de cabine).",
      },
      {
        id: "ecl-4",
        text: "Éclairage de l’armoire de manœuvre ou du local (200 Lux au sol).",
      },
      {
        id: "ecl-5",
        text: "Pose d’une prise dans la fosse et d’une autre au local de machines ou dans l’armoire de commande.",
      },
      {
        id: "ecl-6",
        text: "Alimentation, depuis le tableau principal de l’immeuble, du dispositif selon les directives.",
      },
    ],
  },
  {
    id: "divers",
    label: "Divers",
    clauses: [
      {
        id: "div-1",
        text: "Fourniture et pose de points d’ancrages fixés en tête de gaine et du local des machines. Ces derniers seront testés et marqués de la charge admissible.",
      },
      {
        id: "div-2",
        text: "Éventuellement béquille ou autre solution certifiée pour garantir les volumes de sécurité.",
      },
      {
        id: "div-3",
        text: "Fourniture et pose de chevilles de fixation du matériel, adaptées à la qualité de la cage existante.",
      },
      {
        id: "div-4",
        text: "Tôle perforée pour fermer l’ouverture entre le local et la cage.",
      },
      {
        id: "div-5",
        text: "Pour éviter des infiltrations d’eau, l’ensemble des tamponnages au niveau de la fosse doit être réalisé avec des tampons chimiques.",
      },
      {
        id: "div-6",
        text: "Mise à disposition éventuelle de chaises sur les paliers pour la durée des travaux.",
      },
      {
        id: "div-7",
        text: "Autocollants de dépannage, avec mention du n° de l’installation, de l’entreprise et de son numéro de téléphone ainsi qu’une flèche informant le positionnement de l’armoire de manœuvre, disposés sur la porte du niveau principal et dans la cabine.",
      },
      {
        id: "div-8",
        text: "Autocollants de prescription « non-utilisation en cas d’incendie » disposés sur chaque porte palière.",
      },
      {
        id: "div-9",
        text: "Nettoyage complet de l’appareil avant la réception définitive.",
      },
      {
        id: "div-10",
        text: "Pour les gaines vitrées, les éventuelles déposes de joints de vitrage nécessaires à la fixation des consoles de guidage, ainsi que les fixations des portes palières, sont à la charge du prestataire, inclus les tests d’amiante.",
      },
    ],
  },
  {
    id: "options",
    label: "Options non comptabilisées",
    clauses: [
      {
        id: "opt-1",
        text: "Finitions de cabine : revêtement des parois en stratifié de la collection du soumissionnaire (moins-value à indiquer).",
      },
    ],
  },
  {
    id: "delais",
    label: "Délais",
    clauses: [
      {
        id: "del-1",
        text: "Délai de livraison après la commande (e-mail, lettre, fax, etc.), en semaines, à indiquer par le soumissionnaire.",
      },
      {
        id: "del-2",
        text: "Durée des travaux, en jours ouvrables (sans les travaux annexes), à indiquer par le soumissionnaire.",
      },
      {
        id: "del-3",
        text: "Les travaux sous-traités par le soumissionnaire font intégralement partie de la durée des travaux mentionnée.",
      },
    ],
  },
  {
    id: "infos",
    label: "Informations complémentaires",
    clauses: [
      {
        id: "inf-1",
        text: "Ponts de montage : indiquer de combien d’échafaudages de montage vous avez besoin.",
      },
      {
        id: "inf-2",
        text: "Machines : le logement de la fixation des nouvelles machines doit-il être modifié ? Si oui, indiquer les dimensions (larg. x haut., mm) et le nombre de découpes verticales.",
      },
    ],
  },
  {
    id: "maintenance",
    label: "Maintenance",
    clauses: [
      {
        id: "mai-1",
        text: "Contrat simple : visites de maintenance et dépannage 24 h/24, inclus dispositif de transmission d’alarme par réseau mobile, durée 2 ans renouvelable d’année en année.",
      },
      {
        id: "mai-2",
        text: "Contrat complet : visites de maintenance, dépannage 24 h/24 et réparations (pièces et main-d’œuvre), inclus dispositif de transmission d’alarme par réseau mobile, durée 10 ans renouvelable tacitement à son échéance pour 5 ans.",
      },
      {
        id: "mai-3",
        text: "En cas de conclusion d’un contrat complet, le soumissionnaire s’engage à facturer les deux premières années au prix du contrat simple.",
      },
    ],
  },
];

export const SPEC_CLAUSE_IDS = new Set(
  SPEC_CLAUSE_SECTIONS.flatMap((section) => section.clauses.map((clause) => clause.id)),
);

export function clausesById() {
  const map = new Map<string, { section: string; text: string }>();
  for (const section of SPEC_CLAUSE_SECTIONS) {
    for (const clause of section.clauses) {
      map.set(clause.id, { section: section.label, text: clause.text });
    }
  }
  return map;
}

export function parseSelectedClauses(ids: string[]) {
  return ids.filter((id) => SPEC_CLAUSE_IDS.has(id));
}

export function formatSelectedClauses(ids: string[]) {
  return selectedClauseSections(ids)
    .filter((section) => section.clauses.length)
    .map(
      (section) =>
        `${section.label}\n${section.clauses.map((clause) => `– ${clause.text}`).join("\n")}`,
    )
    .join("\n\n");
}

export function selectedClauseSections(ids: string[]) {
  const selected = new Set(parseSelectedClauses(ids));
  return SPEC_CLAUSE_SECTIONS.map((section) => ({
    ...section,
    clauses: section.clauses.filter((clause) => selected.has(clause.id)),
  }));
}
