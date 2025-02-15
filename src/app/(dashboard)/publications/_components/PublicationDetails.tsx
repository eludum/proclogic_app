import { Publication } from "@/data/publicationSchema"
import React from "react"

interface PublicationDetailsProps {
  publication: Publication
  onBack: () => void
}

const PublicationDetails: React.FC<PublicationDetailsProps> = ({ publication, onBack }) => {
  return (
    <div className="p-4">
      <button onClick={onBack} className="mb-4 text-blue-500">Back to Table</button>
      <h2 className="text-xl font-bold">{publication.title}</h2>
      <p><strong>Dispatch Date:</strong> {publication.dispatch_date.toString()}</p>
      <p><strong>Publication Date:</strong> {publication.publication_date.toString()}</p>
      <p><strong>Submission Deadline:</strong> {publication.submission_deadline?.toString() || "N/A"}</p>
      <p><strong>Is Active:</strong> {publication.is_active?.toString() || "N/A"}</p>
      <p><strong>Original Description:</strong> {publication.original_description}</p>
      <p><strong>AI Summary:</strong> {publication.ai_summary}</p>
      <p><strong>Organisation:</strong> {publication.organisation}</p>
      <p><strong>CPV Code:</strong> {publication.cpv_code}</p>
      <p><strong>Time Remaining:</strong> {publication.time_remaining || "N/A"}</p>
      <p><strong>Accreditations:</strong> {JSON.stringify(publication.accreditations) || "N/A"}</p>
      <p><strong>Publication Value:</strong> {publication.publication_value || "N/A"}</p>
      <p><strong>Documents:</strong> {publication.documents?.join(", ") || "N/A"}</p>
      <p><strong>Publication in Your Sector:</strong> {publication.publication_in_your_sector?.toString() || "N/A"}</p>
      <p><strong>Is Recommended:</strong> {publication.is_recommended?.toString() || "N/A"}</p>
    </div>
  )
}

export default PublicationDetails