import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Publication } from "@/data/publicationSchema";
import { RiArrowLeftLine, RiBarcodeBoxLine, RiBuildingLine, RiCalendarLine, RiFileTextLine, RiFlashlightLine, RiMoneyDollarCircleLine, RiTimeLine } from "@remixicon/react";
import React from "react";

interface PublicationDetailsProps {
  publication: Publication;
  onBack: () => void;
}

const PublicationDetails: React.FC<PublicationDetailsProps> = ({ publication, onBack }) => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Button onClick={onBack} className="mb-4 flex items-center gap-2">
        <RiArrowLeftLine /> Terug naar overzicht
      </Button>

      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        {publication.title}
      </h1>

      {publication.is_recommended && <Badge className="mb-4 text-lg" variant="success">Aanbevolen</Badge>}


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 shadow-xs border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <RiBuildingLine /> Koper
          </h2>
          <p className="text-gray-600">{publication.organisation}</p>
        </Card>

        <Card className="p-4 shadow-xs border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <RiBarcodeBoxLine /> CPV Code
          </h2>
          <p className="text-gray-600">{publication.cpv_code}</p>
        </Card>

        <Card className="p-4 shadow-xs border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <RiMoneyDollarCircleLine /> Publicatie waarde
          </h2>
          <p className="text-gray-600">{publication.publication_value || "N/A"}</p>
        </Card>
      </div>

      <Card className="p-6 shadow-xs border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <RiFileTextLine /> Omschrijving
        </h2>
        <p className="text-gray-700">{publication.original_description}</p>
      </Card>

      <Card className="p-6 shadow-xs border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <RiFlashlightLine /> AI Samenvatting
        </h2>
        <p className="text-gray-700 whitespace-pre-line">{publication.ai_notice_summary}</p>
      </Card>

      <Card className="p-6 shadow-xs border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <RiCalendarLine /> Belangrijke informatie
        </h2>
        <InfoRow label="Verzenddatum" value={publication.dispatch_date?.toString()} icon={<RiCalendarLine />} />
        <InfoRow label="Publicatiedatum" value={publication.publication_date?.toString()} icon={<RiCalendarLine />} />
        <InfoRow label="Indiendatum" value={publication.submission_deadline?.toString() || "N/A"} icon={<RiTimeLine />} />
        <InfoRow label="Tijd over" value={publication.time_remaining || "N/A"} icon={<RiTimeLine />} />
      </Card>
    </div>
  );
};

export default PublicationDetails;

function InfoRow({ label, value, icon }: { label: string; value: string | null | undefined; icon: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <p className="font-medium text-gray-800 flex items-center gap-2">{icon} {label}:</p>
      <p className="text-gray-600">{value}</p>
    </div>
  );
}

