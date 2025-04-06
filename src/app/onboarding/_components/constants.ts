// Define all steps
export const STEPS = {
    WELCOME: 'welcome',
    WEBSITE_PARSER: 'website_parser',
    COMPANY_INFO: 'company_info',
    SECTORS: 'sectors',
    REGIONS: 'regions',
    COMPLETE: 'complete'
}

// Array of steps for progress bar
export const STEP_SEQUENCE = [
    STEPS.WELCOME,
    STEPS.COMPANY_INFO,
    STEPS.SECTORS,
    STEPS.REGIONS,
    STEPS.COMPLETE
]

export const STEP_LABELS = {
    [STEPS.WELCOME]: "Welkom",
    [STEPS.COMPANY_INFO]: "Bedrijfsinfo",
    [STEPS.SECTORS]: "Sectoren",
    [STEPS.REGIONS]: "Regio's",
    [STEPS.COMPLETE]: "Voltooid"
}

// Available sectors based on CPV codes
// TODO: include more sectors
export const availableSectors = [
    { value: "03000000", label: "Landbouw, veeteelt, visserij, bosbouw" },
    { value: "09000000", label: "Aardolieproducten, brandstof, elektriciteit" },
    { value: "14000000", label: "Mijnbouw, basismetalen en aanverwante producten" },
    { value: "15000000", label: "Voedingsmiddelen, dranken, tabak" },
    { value: "30000000", label: "Kantoor- en computerapparatuur" },
    { value: "31000000", label: "Elektrische machines, apparaten, apparatuur" },
    { value: "32000000", label: "Radio-, televisie-, communicatie-, telecommunicatie" },
    { value: "33000000", label: "Medische apparatuur, farmaceutische producten" },
    { value: "34000000", label: "Vervoersmaterieel en hulpstukken voor transport" },
    { value: "35000000", label: "Beveiligings-, brandbestrijdings-, politie-, defensie" },
    { value: "37000000", label: "Muziekinstrumenten, sportartikelen, spellen" },
    { value: "38000000", label: "Laboratorium-, optische en precisieapparatuur" },
    { value: "39000000", label: "Meubelen, inrichting, huishoudelijke apparaten" },
    { value: "41000000", label: "Opgevangen en gezuiverd water" },
    { value: "42000000", label: "Industriële machines" },
    { value: "43000000", label: "Machines voor mijnbouw, steengroeven" },
    { value: "44000000", label: "Bouwconstructies en -materialen" },
    { value: "45000000", label: "Bouwwerkzaamheden" },
    { value: "48000000", label: "Softwarepakketten en informatiesystemen" },
    { value: "50000000", label: "Reparatie- en onderhoudsdiensten" },
    { value: "51000000", label: "Installatiediensten (excl. software)" },
    { value: "55000000", label: "Hotel-, restaurant- en detailhandeldiensten" },
    { value: "60000000", label: "Transportdiensten (excl. afvaltransport)" },
    { value: "63000000", label: "Ondersteunende en aanvullende transportdiensten" },
    { value: "64000000", label: "Post- en telecommunicatiediensten" },
    { value: "65000000", label: "Openbare nutsvoorzieningen" },
    { value: "66000000", label: "Financiële en verzekeringsdiensten" },
    { value: "70000000", label: "Vastgoeddiensten" },
    { value: "71000000", label: "Architectuur-, bouw-, engineering-, inspectiediensten" },
    { value: "72000000", label: "IT-diensten: consulting, softwareontwikkeling" },
    { value: "73000000", label: "Onderzoeks- en ontwikkelingsdiensten" },
    { value: "75000000", label: "Overheids-, defensie- en sociale zekerheidsdiensten" },
    { value: "76000000", label: "Diensten gerelateerd aan de olie- en gasindustrie" },
    { value: "77000000", label: "Landbouw-, bosbouw-, tuinbouw-, aquacultuur diensten" },
    { value: "79000000", label: "Zakelijke diensten: recht, marketing, consulting" },
    { value: "80000000", label: "Onderwijs- en opleidingsdiensten" },
    { value: "85000000", label: "Gezondheidszorg- en maatschappelijke diensten" },
    { value: "90000000", label: "Riolering, afvalverwerking, schoonmaak-, milieudiensten" },
    { value: "92000000", label: "Recreatieve, culturele en sportdiensten" },
    { value: "98000000", label: "Overige gemeenschaps-, sociale en persoonlijke diensten" },
]

// Group sectors by categories
export const sectorCategories = [
    {
        name: "Producten & Grondstoffen",
        sectors: ["03000000", "09000000", "14000000", "15000000", "41000000"]
    },
    {
        name: "Elektronische & Technische Apparatuur",
        sectors: ["30000000", "31000000", "32000000", "38000000", "48000000"]
    },
    {
        name: "Industrieel & Transport",
        sectors: ["34000000", "42000000", "43000000", "60000000", "63000000"]
    },
    {
        name: "Bouw & Infrastructuur",
        sectors: ["44000000", "45000000"]
    },
    {
        name: "Diensten & Consultancy",
        sectors: ["71000000", "72000000", "73000000", "79000000"]
    },
    {
        name: "Publieke & Sociale Diensten",
        sectors: ["75000000", "80000000", "85000000", "90000000", "92000000"]
    },
    {
        name: "Overige",
        sectors: ["35000000", "37000000", "39000000", "50000000", "51000000", "55000000", "64000000", "65000000", "66000000", "70000000", "76000000", "77000000", "98000000"]
    }
]

// Available regions based on NUTS codes for Belgium
export const availableRegions = [
    { value: "BE1", label: "Brussels Hoofdstedelijk Gewest" },
    { value: "BE10", label: "Région de Bruxelles-Capitale / Brussels Hoofdstedelijk Gewest" },
    { value: "BE2", label: "Vlaams Gewest" },
    { value: "BE21", label: "Prov. Antwerpen" },
    { value: "BE22", label: "Prov. Limburg (BE)" },
    { value: "BE23", label: "Prov. Oost-Vlaanderen" },
    { value: "BE24", label: "Prov. Vlaams-Brabant" },
    { value: "BE25", label: "Prov. West-Vlaanderen" },
    { value: "BE3", label: "Région wallonne" },
    { value: "BE31", label: "Prov. Brabant Wallon" },
    { value: "BE32", label: "Prov. Hainaut" },
    { value: "BE33", label: "Prov. Liège" },
    { value: "BE34", label: "Prov. Luxembourg (BE)" },
    { value: "BE35", label: "Prov. Namur" },
    { value: "BE", label: "België (Heel België)" },
]

// Group regions into categories
export const regionCategories = [
    {
        name: "Landelijk",
        regions: ["BE"]
    },
    {
        name: "Gewesten",
        regions: ["BE1", "BE2", "BE3"]
    },
    {
        name: "Provincies in Vlaanderen",
        regions: ["BE21", "BE22", "BE23", "BE24", "BE25"]
    },
    {
        name: "Provincies in Wallonië",
        regions: ["BE31", "BE32", "BE33", "BE34", "BE35"]
    },
    {
        name: "Brussel",
        regions: ["BE10"]
    }
]

// Company data types
export interface CompanyData {
    vat_number: string;
    name: string;
    emails: string[];
    summary_activities: string;
    number_of_employees: number;
    max_publication_value: number | null;
    interested_sectors: { sector: string, cpv_codes: string[] }[];
    operating_regions: string[];
    activity_keywords: string[];
}