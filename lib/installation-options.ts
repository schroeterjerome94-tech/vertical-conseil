export const MACHINE_ROOM_LOCATIONS = [
  "En tête de gaine",
  "En bas latéral",
  "En fosse",
  "En superstructure",
] as const;

export const CABIN_DOOR_KINDS = [
  "Central télescopique 2 parties",
  "Central télescopique 4 parties",
  "Central télescopique 6 parties",
  "Latéral télescopique 2 parties",
  "Latéral télescopique 4 parties",
  "Asymétrique 4 parties",
] as const;

export const LANDING_DOOR_KINDS = [...CABIN_DOOR_KINDS, "Battant"] as const;
