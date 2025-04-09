import { Button } from '@/components/Button';
import { InfoIcon, PlusCircleIcon, SaveIcon, TagIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { Company } from '../company-profile/page';

interface SectorsFormProps {
    company: Company;
    onSave: (data: Partial<Company>) => Promise<void>;
    saving: boolean;
}

// Available sectors based on CPV codes
const availableSectors = [
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
];

interface SectorInput {
    sector: string;
    cpvCodes: string;
    id: string;
}

export default function SectorsForm({ company, onSave, saving }: SectorsFormProps) {
    // Convert company sectors to a format for form inputs with unique IDs
    const initializeSectors = () => {
        if (!company.interested_sectors || company.interested_sectors.length === 0) {
            return [{
                sector: availableSectors[0].value,
                cpvCodes: '',
                id: Date.now().toString()
            }];
        }

        return company.interested_sectors.map(s => ({
            sector: s.sector,
            cpvCodes: s.cpv_codes.join(', '),
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }));
    };

    const [sectorInputs, setSectorInputs] = useState<SectorInput[]>(initializeSectors());
    const [selectedSector, setSelectedSector] = useState(availableSectors[0].value);

    const addSectorInput = () => {
        const sectorLabel = availableSectors.find(s => s.value === selectedSector)?.label || '';

        setSectorInputs([
            ...sectorInputs,
            {
                sector: sectorLabel,
                cpvCodes: selectedSector,  // Preset with the main CPV code
                id: Date.now().toString()
            }
        ]);
    };

    const removeSectorInput = (id: string) => {
        setSectorInputs(sectorInputs.filter(input => input.id !== id));
    };

    const updateSectorInput = (id: string, field: keyof SectorInput, value: string) => {
        setSectorInputs(
            sectorInputs.map(input =>
                input.id === id ? { ...input, [field]: value } : input
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Process inputs before submission
        const sectorsList = sectorInputs.map(input => ({
            sector: input.sector,
            cpv_codes: input.cpvCodes.split(',').map(code => code.trim()).filter(Boolean)
        }));

        await onSave({ interested_sectors: sectorsList });
    };

    const getSectorLabel = (sectorValue: string) => {
        const sector = availableSectors.find(s => s.value === sectorValue);
        return sector ? sector.label : sectorValue;
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                        Sectoren & CPV-codes
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Geef aan in welke sectoren je bedrijf actief is en specificeer relevante CPV-codes voor betere aanbevelingen.
                    </p>

                    <div className="mb-6 bg-astral-50 dark:bg-astral-900/20 p-3 rounded-md">
                        <div className="flex items-start gap-2">
                            <InfoIcon size={16} className="text-astral-600 dark:text-astral-300 mt-0.5" />
                            <div className="text-sm text-astral-700 dark:text-astral-200">
                                <p className="font-medium">Tip: Hoe CPV-codes werken</p>
                                <p className="mt-1">
                                    CPV-codes (Common Procurement Vocabulary) worden gebruikt om aanbestedingen te classificeren.
                                    Voeg specifieke codes toe om preciezere aanbevelingen te krijgen.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Add new sector */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                            <select
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                value={selectedSector}
                                onChange={(e) => setSelectedSector(e.target.value)}
                            >
                                {availableSectors.map(sector => (
                                    <option key={sector.value} value={sector.value}>
                                        {sector.label} ({sector.value})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button
                            type="button"
                            onClick={addSectorInput}
                            className="flex items-center gap-2 bg-astral-100 hover:bg-astral-200 text-astral-700 dark:bg-astral-900/40 dark:hover:bg-astral-900/60 dark:text-astral-300"
                        >
                            <PlusCircleIcon size={16} />
                            <span>Sector toevoegen</span>
                        </Button>
                    </div>

                    {/* Sector inputs list */}
                    <div className="space-y-4">
                        {sectorInputs.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Geen sectoren toegevoegd. Voeg minimaal één sector toe.
                                </p>
                            </div>
                        ) : (
                            sectorInputs.map((input, index) => (
                                <div key={input.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-slate-900">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <TagIcon size={16} className="text-astral-600 dark:text-astral-300" />
                                            <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                                Sector {index + 1}
                                            </h4>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => removeSectorInput(input.id)}
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 p-1 h-auto"
                                        >
                                            <TrashIcon size={16} />
                                        </Button>
                                    </div>

                                    {/* Sector Name Input */}
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Sectornaam
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-astral-500"
                                            value={input.sector}
                                            onChange={(e) => updateSectorInput(input.id, 'sector', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* CPV Codes Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            CPV-codes (gescheiden door komma&apos;s)
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-astral-500"
                                            value={input.cpvCodes}
                                            onChange={(e) => updateSectorInput(input.id, 'cpvCodes', e.target.value)}
                                            placeholder="45000000, 45210000, 45300000"
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Voer specifieke CPV-codes in die relevant zijn voor deze sector.
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        className="flex items-center gap-2"
                        disabled={saving || sectorInputs.length === 0}
                    >
                        {saving ? (
                            <>
                                <span className="animate-spin">⟳</span>
                                <span>Opslaan...</span>
                            </>
                        ) : (
                            <>
                                <SaveIcon size={16} />
                                <span>Opslaan</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}