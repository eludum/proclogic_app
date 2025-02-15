"use client"
import { getColumns } from "@/app/(dashboard)/publications/_components/Columns"
import { DataTable } from "@/app/(dashboard)/publications/_components/DataTable"
import { DataTableDrawer } from "@/app/(dashboard)/publications/_components/DataTableDrawer"
import { siteConfig } from "@/app/siteConfig"
import { Publication } from "@/data/publicationSchema"
import { Row } from "@tanstack/react-table"
import { useEffect, useState } from 'react'

export default function Publications() {
  const API_BASE_URL = siteConfig.api_base_url;
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [row, setRow] = useState<Row<Publication> | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/publication/BE0893620715/`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Publication[] = await response.json();
        setPublications(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  const handleRowClick = (row: Row<Publication>) => {
    setRow(row);
    setIsOpen(false); // Ensure the drawer does not open on row click
  };

  const handleEditClick = (row: Row<Publication>, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the row click handler from being triggered
    setRow(row);
    setIsOpen(true);
  };

  const datas = row?.original;
  const columns = getColumns({
    onEditClick: handleEditClick,
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Publicaties
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <DataTable
          data={publications || []}
          columns={columns}
          onRowClick={handleRowClick}
          onEditClick={handleEditClick}
        />
        <DataTableDrawer open={isOpen} onOpenChange={setIsOpen} datas={datas} />
      </div>
    </>
  );
}