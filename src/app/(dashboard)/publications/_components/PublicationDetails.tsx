import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Publication } from "@/data/publicationSchema";
import React from "react";

interface PublicationDetailsProps {
  publication: Publication
  onBack: () => void
}

const PublicationDetails: React.FC<PublicationDetailsProps> = ({ publication, onBack }) => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Button variant="primary" onClick={onBack} className="mb-4">
        ← Terug naar overzicht
      </Button>

      <p className="text-2xl font-bold mb-4">{publication.title}</p>
      <Card className="space-y-4">
        <InfoRow label="Dispatch Date" value={publication.dispatch_date?.toString()} />
        <InfoRow label="Publication Date" value={publication.publication_date?.toString()} />
        <InfoRow label="Submission Deadline" value={publication.submission_deadline?.toString() || "N/A"} />
        <InfoRow label="Is Active" value={publication.is_active?.toString() || "N/A"} />
        <InfoRow label="Original Description" value={publication.original_description} />
        <InfoRow label="AI Summary" value={publication.ai_summary} />
        <InfoRow label="Organisation" value={publication.organisation} />
        <InfoRow label="CPV Code" value={publication.cpv_code} />
        <InfoRow label="Time Remaining" value={publication.time_remaining || "N/A"} />
        <InfoRow label="Accreditations" value={JSON.stringify(publication.accreditations) || "N/A"} />
        <InfoRow label="Publication Value" value={publication.publication_value || "N/A"} />
        <InfoRow label="Documents" value={publication.documents?.join(", ") || "N/A"} />
        <InfoRow label="Publication in Your Sector" value={publication.publication_in_your_sector?.toString() || "N/A"} />
        <InfoRow label="Is Recommended" value={publication.is_recommended?.toString() || "N/A"} />
      </Card>
    </div>
  )
}

export default PublicationDetails

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="font-medium">{label}:</p>
      <p className="text-gray-600">{value}</p>
    </div>
  );
}