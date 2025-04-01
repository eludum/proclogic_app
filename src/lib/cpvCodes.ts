// src/lib/cpvCodes.ts

export const nl_sectors: Record<string, string> = {
    "03000000": "Landbouw-, veeteelt-, visserij-, bosbouw- en aanverwante producten",
    "09000000": "Aardolieproducten, brandstof, elektriciteit en andere energiebronnen",
    "14000000": "Mijnbouw, basismetalen en aanverwante producten",
    "15000000": "Voedingsmiddelen, dranken, tabak en aanverwante producten",
    "16000000": "Landbouwmachines",
    "18000000": "Kleding, schoeisel, bagageartikelen en accessoires",
    "19000000": "Leder- en textielstoffen, kunststof- en rubbermaterialen",
    "22000000": "Gedrukt materiaal en aanverwante producten",
    "24000000": "Chemische producten",
    "30000000": "Kantoor- en computerapparatuur, machines en benodigdheden, met uitzondering van meubels en softwarepakketten",
    "31000000": "Elektrische machines, apparaten, apparatuur en verbruiksartikelen; verlichting",
    "32000000": "Radio-, televisie-, communicatie-, telecommunicatie- en aanverwante apparatuur",
    "33000000": "Medische apparatuur, farmaceutische producten en persoonlijke verzorgingsproducten",
    "34000000": "Vervoersmaterieel en hulpstukken voor transport",
    "35000000": "Beveiligings-, brandbestrijdings-, politie- en defensieapparatuur",
    "37000000": "Muziekinstrumenten, sportartikelen, spellen, speelgoed, handwerk- en kunstbenodigdheden en accessoires",
    "38000000": "Laboratorium-, optische en precisieapparatuur (excl. brillen)",
    "39000000": "Meubelen (incl. kantoormeubelen), inrichting, huishoudelijke apparaten (excl. verlichting) en schoonmaakproducten",
    "41000000": "Opgevangen en gezuiverd water",
    "42000000": "Industriële machines",
    "43000000": "Machines voor mijnbouw, steengroeven en bouwmaterieel",
    "44000000": "Bouwconstructies en -materialen; hulpstukken voor de bouw (behalve elektrische apparaten)",
    "45000000": "Bouwwerkzaamheden",
    "48000000": "Softwarepakketten en informatiesystemen",
    "50000000": "Reparatie- en onderhoudsdiensten",
    "51000000": "Installatiediensten (excl. software)",
    "55000000": "Hotel-, restaurant- en detailhandeldiensten",
    "60000000": "Transportdiensten (excl. afvaltransport)",
    "63000000": "Ondersteunende en aanvullende transportdiensten; reisbureaudiensten",
    "64000000": "Post- en telecommunicatiediensten",
    "65000000": "Openbare nutsvoorzieningen",
    "66000000": "Financiële en verzekeringsdiensten",
    "70000000": "Vastgoeddiensten",
    "71000000": "Architectuur-, bouw-, engineering- en inspectiediensten",
    "72000000": "IT-diensten: consulting, softwareontwikkeling, internet en ondersteuning",
    "73000000": "Onderzoeks- en ontwikkelingsdiensten en aanverwante adviesdiensten",
    "75000000": "Overheids-, defensie- en sociale zekerheidsdiensten",
    "76000000": "Diensten gerelateerd aan de olie- en gasindustrie",
    "77000000": "Landbouw-, bosbouw-, tuinbouw-, aquacultuur- en bijenteeltdiensten",
    "79000000": "Zakelijke diensten: recht, marketing, consulting, werving, drukwerk en beveiliging",
    "80000000": "Onderwijs- en opleidingsdiensten",
    "85000000": "Gezondheidszorg- en maatschappelijke diensten",
    "90000000": "Riolering, afvalverwerking, schoonmaak- en milieudiensten",
    "92000000": "Recreatieve, culturele en sportdiensten",
    "98000000": "Overige gemeenschaps-, sociale en persoonlijke diensten",
  };
  
  export function getCpvSectorName(code: string): string {
    if (!code) return "Onbekend";
    
    // Extract sector code (first two digits + zeros)
    const sectorCode = code.slice(0, 2) + "000000";
    
    return nl_sectors[sectorCode] || "Overige";
  }
  
  export function getSectorColor(sectorCode: string): string {
    // Return consistent colors based on the sector code
    const colors = [
      "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20",
      "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20",
      "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20",
      "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20",
      "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20",
      "text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20",
      "text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/20",
      "text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/20", 
      "text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/20",
      "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20"
    ];
    
    // Use first two digits for consistent coloring
    if (!sectorCode) return colors[0];
    
    const index = parseInt(sectorCode.slice(0, 2)) % colors.length;
    return colors[index];
  }
  