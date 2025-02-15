"use client"
import { getColumns } from "@/app/(dashboard)/publicaties/_components/Columns"
import { DataTable } from "@/app/(dashboard)/publicaties/_components/DataTable"
import { DataTableDrawer } from "@/app/(dashboard)/publicaties/_components/DataTableDrawer"
import { siteConfig } from "@/app/siteConfig"
import { Publication } from "@/data/publicationSchema"
import { Row } from "@tanstack/react-table"
import { useEffect, useState } from 'react'

export default function Publicaties() {
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
        console.log(data)
        console.log(data[0].publicationDate)
        setPublications(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  const datas = row?.original;
  const columns = getColumns({
    onEditClick: (row) => {
      setRow(row);
      setIsOpen(true);
    },
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
          onRowClick={(row) => {
            setRow(row);
            setIsOpen(true);
          }}
        />
        <DataTableDrawer open={isOpen} onOpenChange={setIsOpen} datas={datas} />
      </div>
    </>
  );
}